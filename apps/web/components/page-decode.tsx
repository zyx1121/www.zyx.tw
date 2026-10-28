"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, useRef } from "react"

// Glyphs for characters that have not resolved, as ScrambleText draws them,
// minus the ones a line may break at ("-", "/", "!", "?", brackets), so no
// line rewraps mid-effect. Han characters take Han glyphs from the font's
// subset (fonts/cjk.txt): in the monospace face each glyph keeps its cell's
// width, so nothing on the page moves. Punctuation and symbols stay as they
// are.
const NARROW = Array.from("#$%&*+<=>@^~")
const WIDE = Array.from("之乖值動化協境夠改測率環系統翔自良詠試詹調頻")
const WIDE_CHAR = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u
const LETTER = /[\p{L}\p{N}]/u

/** Milliseconds per resolved character, as the title's ScrambleText. */
const STEP = 50
/** A long line resolves within this, however many characters it has. */
const LONGEST = 600
/** Milliseconds between rows, as enterRow. */
const ROW = 25
/** Milliseconds to scramble the page before leaving it. */
export const OUT = 200
/**
 * Dispatched on the document as the page starts to scramble out, for what
 * draws its own characters (the home's mark) to scramble with it over OUT.
 */
export const LEAVE_EVENT = "page-decode:leave"

const KEEP = 0
const NARROW_GLYPH = 1
const WIDE_GLYPH = 2

type Line = {
  node: Text
  text: string
  chars: string[]
  kinds: number[]
  delay: number
  step: number
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Every text node in the page that has something to scramble, with the delay
 * of the row it sits in. Nodes of symbols alone are left to their owners, as
 * the works window's frame.
 */
function collect(main: HTMLElement): Line[] {
  const lines: Line[] = []
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      (node as Text).data.trim() &&
      !node.parentElement?.closest("script, style, noscript")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  })
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    const row = text.parentElement
      ?.closest("[class*='enter-row-']")
      ?.className.match(/enter-row-(\d+)/)?.[1]
    const chars = Array.from(text.data)
    const kinds = chars.map((char) =>
      !LETTER.test(char)
        ? KEEP
        : WIDE_CHAR.test(char)
          ? WIDE_GLYPH
          : NARROW_GLYPH
    )
    if (kinds.every((kind) => kind === KEEP)) continue
    lines.push({
      node: text,
      text: text.data,
      chars,
      kinds,
      delay: Number(row ?? 0) * ROW,
      step: Math.min(STEP, LONGEST / chars.length),
    })
  }
  return lines
}

function draw(line: Line, resolved: number) {
  let out = ""
  for (let index = 0; index < line.chars.length; index++) {
    const kind = line.kinds[index]
    if (index < resolved || kind === KEEP) {
      out += line.chars[index]
    } else {
      const pool = kind === WIDE_GLYPH ? WIDE : NARROW
      out += pool[Math.floor(Math.random() * pool.length)]
    }
  }
  return out
}

/**
 * Scrambles the lines in, each resolving left to right after its row's
 * delay, or out, every line scrambling from its end over OUT ms. Out keeps
 * the glyphs moving until the page is replaced. Returns a cancel that puts
 * the final text back.
 */
function play(
  main: HTMLElement,
  lines: Line[],
  direction: "in" | "out",
  onScrambled?: () => void
) {
  let raf = 0
  let start: number | undefined
  let lastTick = -1
  let called = false
  const resolvedAt = lines.map(() => -1)
  main.setAttribute("aria-busy", "true")

  const frame = (now: number) => {
    start ??= now
    const elapsed = now - start
    const tick = Math.floor(elapsed / STEP)
    const reroll = tick !== lastTick
    lastTick = tick
    // Out runs until the next page replaces this one, even on its first
    // frame, where every line is still whole.
    let running = direction === "out"
    lines.forEach((line, index) => {
      const length = line.chars.length
      let resolved: number
      if (direction === "in") {
        const local = elapsed - line.delay
        resolved = local < 0 ? 0 : Math.floor(local / line.step)
      } else {
        resolved = Math.ceil(length * Math.max(0, 1 - elapsed / OUT))
      }
      if (resolved >= length) {
        if (resolvedAt[index] !== length) line.node.data = line.text
        resolvedAt[index] = length
        return
      }
      running = true
      if (reroll || resolvedAt[index] !== resolved) {
        line.node.data = draw(line, resolved)
        resolvedAt[index] = resolved
      }
    })
    if (direction === "out" && elapsed >= OUT && !called) {
      called = true
      onScrambled?.()
    }
    if (running) {
      raf = requestAnimationFrame(frame)
    } else {
      main.removeAttribute("aria-busy")
    }
  }

  // The first frame is drawn now, so a new page never paints its final
  // text before the effect starts.
  frame(performance.now())

  return () => {
    cancelAnimationFrame(raf)
    main.removeAttribute("aria-busy")
    for (const line of lines) line.node.data = line.text
  }
}

/**
 * Decodes one element's text in at once, for text that changes after the
 * page has entered. Returns a cancel that puts the final text back.
 */
export function decodeText(element: HTMLElement) {
  const lines = collect(element).map((line) => ({ ...line, delay: 0 }))
  return play(element, lines, "in")
}

/**
 * The site's one motion: text decodes as a terminal prints it. A page's
 * text starts scrambled and resolves row by row, 25ms apart, top to bottom.
 * Following a link on the site first scrambles the page being left, then the
 * next one decodes in, both ways; the home's mark takes part through
 * LEAVE_EVENT, the works window likewise. Reduced motion skips all of it. The rows' fades in
 * globals.css step aside once this runs.
 */
export function PageDecode() {
  const pathname = usePathname()
  const router = useRouter()
  const cancel = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    document.documentElement.dataset.decoder = ""
    const main = document.querySelector("main")
    if (!main || reducedMotion()) return
    cancel.current()
    cancel.current = play(main, collect(main), "in")
    return () => cancel.current()
  }, [pathname])

  useEffect(() => {
    // Capture, so this runs before Next's own link handler and can hold the
    // navigation until the page has scrambled.
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const link = (event.target as Element | null)?.closest("a[href]")
      if (
        !(link instanceof HTMLAnchorElement) ||
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download")
      ) {
        return
      }
      const url = new URL(link.href)
      if (
        url.origin !== location.origin ||
        url.pathname === location.pathname
      ) {
        return
      }
      const main = document.querySelector("main")
      if (!main || reducedMotion()) return
      event.preventDefault()
      event.stopPropagation()
      cancel.current()
      document.dispatchEvent(new Event(LEAVE_EVENT))
      cancel.current = play(main, collect(main), "out", () =>
        router.push(url.pathname + url.search + url.hash)
      )
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [router])

  return null
}
