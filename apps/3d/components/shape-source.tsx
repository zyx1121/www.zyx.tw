"use client"

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"

import { findPreset, type SceneV1 } from "@workspace/3d"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/ui/tabs"
import { Textarea } from "@workspace/ui/components/ui/textarea"
import { cn } from "@workspace/ui/lib/utils"

import { PresetSelect } from "@/components/preset-select"
import { fonts, type TextFont } from "@/lib/fonts"
import { ZYX_SVG } from "@/lib/zyx-svg"

type Mode = "svg" | "text"

type ShapeText = NonNullable<SceneV1["shape"]["text"]>

const MAX_LINES = 3
const MAX_LINE_LENGTH = 40

/** Milliseconds typing pauses before the text is set again. */
const TYPING_PAUSE = 300

/** Milliseconds a conversion runs before it says it's loading. */
const LOADING_DELAY = 400

/**
 * While the shape is text, the SVG that SVG mode goes back to waits here,
 * so it survives a reload.
 */
const SVG_KEY = "3d:svg:v1"

const DEFAULT_TEXT: ShapeText = { value: "Hello", font: fonts[0].id }

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "missing"; chars: string[] }
  | { kind: "failed"; message: string }

export type ShapeSourceProps = {
  mode: Mode
  draft: ShapeText
  status: Status
  /** The last edit went past the length limit and was cut. */
  clamped: boolean
  changeMode: (mode: Mode) => void
  /** `composing`: an input method's characters aren't chosen yet, so they wait. */
  changeText: (value: string, composing?: boolean) => void
  /** An input method committed its characters. */
  commitText: (value: string) => void
  changeFont: (id: string) => void
}

/**
 * Where the shape comes from: an SVG file, or text set in a font. Text is
 * turned into an SVG and stored as `shape.svg`, with `shape.text` to edit it
 * again, so renderers never see the difference. A conversion that fails or
 * has nothing to draw keeps the shape as it was.
 */
export function useShapeSource(
  scene: SceneV1,
  setScene: Dispatch<SetStateAction<SceneV1>>
) {
  const [mode, setMode] = useState<Mode>(scene.shape.text ? "text" : "svg")
  const [draft, setDraft] = useState(() => readText(scene.shape.text))
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [clamped, setClamped] = useState(false)
  const typing = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Bumped by every conversion and mode change; a result from an older one
  // is dropped.
  const latest = useRef(0)

  const lastSvg = useRef<string | null>(null)
  const isText = scene.shape.text !== undefined
  useEffect(() => {
    if (!isText) {
      lastSvg.current = scene.shape.svg
      storeSvg(null)
    } else if (lastSvg.current !== null) {
      storeSvg(lastSvg.current)
    }
  }, [isText, scene.shape.svg])

  function convert(text: ShapeText) {
    clearTimeout(typing.current)
    const run = ++latest.current
    // Nothing to draw keeps the shape; the panel asks for text instead.
    if (!text.value.trim()) {
      setStatus({ kind: "idle" })
      return
    }
    const font = findPreset(fonts, text.font) ?? fonts[0]
    const slow = setTimeout(() => {
      if (latest.current === run) setStatus({ kind: "loading" })
    }, LOADING_DELAY)
    void outline(text.value, font).then((result) => {
      clearTimeout(slow)
      if (latest.current !== run) return
      if ("failed" in result) {
        setStatus({ kind: "failed", message: result.failed })
        return
      }
      const { svg, missing } = result
      if (svg) {
        setScene((current) => ({
          ...current,
          shape: { ...current.shape, svg, text: { ...text, font: font.id } },
        }))
      }
      setStatus(
        missing.length > 0
          ? { kind: "missing", chars: missing }
          : { kind: "idle" }
      )
    })
  }

  const props: ShapeSourceProps = {
    mode,
    draft,
    status,
    clamped,
    changeMode(next) {
      if (next === mode) return
      setMode(next)
      if (next === "text") {
        convert(draft)
        return
      }
      clearTimeout(typing.current)
      latest.current++
      setStatus({ kind: "idle" })
      const svg = lastSvg.current ?? readStoredSvg() ?? ZYX_SVG
      setScene((current) => ({
        ...current,
        shape: { ...current.shape, svg, text: undefined },
      }))
    },
    changeText(value, composing = false) {
      const typed = tidyText(value)
      const next = { ...draft, value: clampText(typed) }
      setDraft(next)
      setClamped(next.value !== typed)
      // A key past the limit changes nothing to convert.
      if (next.value === draft.value) return
      // What was said about the last text doesn't hold for this one.
      setStatus({ kind: "idle" })
      clearTimeout(typing.current)
      if (!composing) {
        typing.current = setTimeout(() => convert(next), TYPING_PAUSE)
      }
    },
    commitText(value) {
      // Always converts: the committed text can match the last composed one.
      const next = { ...draft, value: clampText(tidyText(value)) }
      setDraft(next)
      clearTimeout(typing.current)
      typing.current = setTimeout(() => convert(next), TYPING_PAUSE)
    },
    changeFont(id) {
      const next = { ...draft, font: id }
      setDraft(next)
      // What was said about the last font doesn't hold for this one.
      setStatus({ kind: "idle" })
      convert(next)
    },
  }

  return {
    props,
    /**
     * A file replaced the shape: text mode with its text, or SVG mode. Drops
     * any conversion under way.
     */
    reset(text?: ShapeText) {
      clearTimeout(typing.current)
      latest.current++
      setMode(text ? "text" : "svg")
      if (text) setDraft(readText(text))
      setStatus({ kind: "idle" })
      setClamped(false)
    },
  }
}

/** A stored text, with a font this version doesn't know swapped for the default. */
function readText(text: ShapeText | undefined): ShapeText {
  if (!text) return DEFAULT_TEXT
  return {
    value: text.value,
    font: (findPreset(fonts, text.font) ?? fonts[0]).id,
  }
}

function tidyText(value: string) {
  return value.replace(/\r\n?/g, "\n").replace(/\t/g, " ")
}

function clampText(value: string) {
  return value
    .split("\n")
    .slice(0, MAX_LINES)
    .map((line) => Array.from(line).slice(0, MAX_LINE_LENGTH).join(""))
    .join("\n")
}

type Outline = { svg: string | null; missing: string[] } | { failed: string }

/** The converter and its font parser load on first use, keeping them out of the page's first load. */
async function outline(value: string, font: TextFont): Promise<Outline> {
  const unreachable = {
    failed: `Couldn't load ${font.label}. Check the connection; the shape is unchanged.`,
  }
  const converter = await import("@/lib/text-to-svg").catch(() => null)
  // A chunk that failed to load isn't fetched again until the page reloads.
  if (!converter) {
    return {
      failed: "Couldn't load the text tools. Reload the page to try again.",
    }
  }
  try {
    return await converter.textToSvg(value, font)
  } catch (error) {
    return error instanceof converter.FontLoadError
      ? unreachable
      : { failed: "Couldn't turn this text into a shape." }
  }
}

function readStoredSvg(): string | null {
  try {
    return localStorage.getItem(SVG_KEY)
  } catch {
    return null
  }
}

function storeSvg(svg: string | null) {
  try {
    if (svg === null) localStorage.removeItem(SVG_KEY)
    else localStorage.setItem(SVG_KEY, svg)
  } catch {
    // Blocked or full storage: SVG mode falls back to the zyx mark after a reload.
  }
}

/** The Shape panel's source switch, and the text field and font when it's text. */
export function ShapeSource({
  mode,
  draft,
  status,
  clamped,
  changeMode,
  changeText,
  commitText,
  changeFont,
}: ShapeSourceProps) {
  const font = findPreset(fonts, draft.font) ?? fonts[0]
  const note = describe(status, font, !draft.value.trim(), clamped)
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => changeMode(value === "text" ? "text" : "svg")}
    >
      <TabsList className="w-full">
        <TabsTrigger value="svg">SVG</TabsTrigger>
        <TabsTrigger value="text">Text</TabsTrigger>
      </TabsList>
      <TabsContent value="svg" className="text-xs text-muted-foreground">
        Open an SVG file, or drop one on the page.
      </TabsContent>
      <TabsContent value="text" className="flex flex-col gap-2">
        <Textarea
          aria-label="Text"
          value={draft.value}
          placeholder="Type some text"
          rows={3}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) =>
            changeText(
              event.target.value,
              (event.nativeEvent as InputEvent).isComposing
            )
          }
          onCompositionEnd={(event) => commitText(event.currentTarget.value)}
        />
        <PresetSelect
          label="Font"
          presets={fonts}
          value={font.id}
          onChange={changeFont}
        />
        <p
          aria-live="polite"
          className={cn(
            "text-xs empty:hidden",
            note?.error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {note?.text}
        </p>
      </TabsContent>
    </Tabs>
  )
}

const MISSING_LISTED = 10

const HAN = /\p{Script=Han}/u

function describe(
  status: Status,
  font: TextFont,
  empty: boolean,
  clamped: boolean
): { text: string; error?: boolean } | null {
  if (status.kind === "failed") return { text: status.message, error: true }
  if (empty) return { text: "Type some text to make a shape." }
  if (status.kind === "missing") {
    const { chars } = status
    const listed = chars.slice(0, MISSING_LISTED).join(" ")
    const more = chars.length > MISSING_LISTED ? " …" : ""
    // Chinese typed in a Latin font: name a font that has it.
    const fallback =
      !font.han && chars.some((char) => HAN.test(char))
        ? fonts.find((other) => other.han)
        : undefined
    return {
      text: `${font.label} has no ${listed}${more}.${fallback ? ` Try ${fallback.label}.` : ""}`,
    }
  }
  if (clamped) {
    return {
      text: `Up to ${MAX_LINES} lines of ${MAX_LINE_LENGTH} characters.`,
    }
  }
  if (status.kind === "loading") return { text: `Loading ${font.label}…` }
  return null
}
