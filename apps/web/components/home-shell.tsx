"use client"

import { useEffect, useRef, useState } from "react"

import { Cursor } from "@workspace/ui/components/shell"
import { cn } from "@workspace/ui/lib/utils"

import { FEED_EVENT } from "@/components/pond-background"
import { FACTS } from "@/lib/resume"
import { PAGES } from "@/lib/site"

/** A line of the scrollback: what was typed, or what came back. */
type Line = { id: number; kind: "in" | "out"; text: string }

/** The scrollback keeps this many lines; older ones scroll away. */
const KEEP = 8

const HOME = "/home/guest"

/** Pages by the names `cd` and `ls` know them by. */
const DIRS = PAGES.filter((page) => page.path !== "/").map((page) => ({
  name: page.path.slice(1),
  path: page.path,
}))

type Shell = {
  out: (...lines: string[]) => void
  clear: () => void
  close: () => void
  go: (path: string) => void
}

type Command = {
  help?: string
  run: (args: string[], shell: Shell) => void
}

const COMMANDS: Record<string, Command> = {
  help: {
    help: "list the commands",
    run: (_, sh) =>
      sh.out(
        ...Object.entries(COMMANDS)
          .filter(([, command]) => command.help)
          .map(([name, command]) => `${name.padEnd(8)}${command.help}`)
      ),
  },
  ls: {
    help: "list the pages",
    run: (_, sh) => sh.out(DIRS.map((dir) => `${dir.name}/`).join("  ")),
  },
  cd: {
    help: "go to a page",
    run: ([to], sh) => {
      const name = (to ?? "").replace(/^\/|\/$/g, "")
      if (name === "" || name === "~" || name === ".") return
      const dir = DIRS.find((d) => d.name === name)
      if (!dir) return sh.out(`cd: no such file or directory: ${to}`)
      sh.go(dir.path)
    },
  },
  cat: {
    help: "print a file",
    run: ([file], sh) => {
      if (!file) return sh.out("usage: cat <file>")
      if (file.replace(/\.md$/, "") === "about")
        return sh.out(
          "Loki, 詹詠翔.",
          ...FACTS.map((fact) => `${fact.label.padEnd(8)}${fact.value}`)
        )
      if (DIRS.some((d) => d.name === file.replace(/\/$/, "")))
        return sh.out(`cat: ${file}: Is a directory`)
      sh.out(`cat: ${file}: No such file or directory`)
    },
  },
  feed: {
    help: "feed the fish",
    run: (_, sh) => {
      document.dispatchEvent(new Event(FEED_EVENT))
      sh.out("a pinch of food drifts down")
    },
  },
  whoami: { help: "print your name", run: (_, sh) => sh.out("guest") },
  date: {
    help: "print the date",
    run: (_, sh) => sh.out(new Date().toString()),
  },
  echo: { run: (args, sh) => sh.out(args.join(" ")) },
  pwd: { run: (_, sh) => sh.out(HOME) },
  clear: { help: "clear the screen", run: (_, sh) => sh.clear() },
  exit: { help: "close the shell", run: (_, sh) => sh.close() },
  sudo: {
    run: (_, sh) =>
      sh.out(
        "guest is not in the sudoers file. This incident will be reported."
      ),
  },
  rm: { run: (_, sh) => sh.out("rm: the fish would like a word") },
  vim: { run: (_, sh) => sh.out("you are safe here, there is no vim") },
  emacs: { run: (_, sh) => sh.out("emacs: try vim") },
}

/** The command or page names that complete what has been typed, for Tab. */
function complete(input: string) {
  const parts = input.split(" ")
  if (parts.length === 1)
    return Object.keys(COMMANDS).filter((name) => name.startsWith(parts[0]!))
  if (parts.length === 2 && ["cd", "cat"].includes(parts[0]!)) {
    const names = [
      ...DIRS.map((d) => d.name),
      ...(parts[0] === "cat" ? ["about.md"] : []),
    ]
    return names
      .filter((name) => name.startsWith(parts[1]!))
      .map((name) => `${parts[0]} ${name}`)
  }
  return []
}

/**
 * A small shell over the home, as an easter egg: "/" opens a prompt with a
 * blinking cursor in the bottom left, clear of the mark, a few commands
 * answer, and Escape or `exit` closes it.
 * `cd` follows a link, so the page scrambles out as with any other.
 */
export function HomeShell() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [lines, setLines] = useState<Line[]>([])
  const history = useRef<string[]>([])
  const back = useRef(0)
  const nextId = useRef(0)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable]")) return
      event.preventDefault()
      setOpen(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open) field.current?.focus()
  }, [open])

  const push = (kind: Line["kind"], ...texts: string[]) =>
    setLines((all) =>
      [
        ...all,
        ...texts.map((text) => ({ id: nextId.current++, kind, text })),
      ].slice(-KEEP)
    )

  const close = () => {
    setOpen(false)
    setInput("")
    field.current?.blur()
  }

  const shell: Shell = {
    out: (...texts) => push("out", ...texts),
    clear: () => setLines([]),
    close,
    go: (path) => {
      // A real link, so PageDecode scrambles the page out before it leaves.
      const link = document.createElement("a")
      link.href = path
      field.current?.parentElement?.append(link)
      link.click()
      link.remove()
    },
  }

  const run = (raw: string) => {
    const line = raw.trim()
    push("in", line)
    if (!line) return
    history.current.push(line)
    back.current = 0
    const [name, ...args] = line.split(/\s+/)
    const command = COMMANDS[name!]
    if (command) command.run(args, shell)
    else shell.out(`sh: command not found: ${name}`)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      close()
    } else if (event.key === "Enter") {
      event.preventDefault()
      run(input)
      setInput("")
    } else if (event.key === "Tab") {
      event.preventDefault()
      const options = complete(input)
      if (options.length === 1) setInput(`${options[0]} `)
      else if (options.length > 1) {
        push("in", input)
        shell.out(options.map((o) => o.split(" ").pop()).join("  "))
      }
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      const all = history.current
      back.current = Math.max(
        0,
        Math.min(all.length, back.current + (event.key === "ArrowUp" ? 1 : -1))
      )
      setInput(back.current ? all[all.length - back.current]! : "")
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault()
      setLines([])
    }
  }

  if (!open) return null

  return (
    <section
      aria-label="Shell"
      data-no-feed
      className="shell-dock pointer-events-auto fixed corner-left z-10 max-w-xl font-mono text-body"
      onPointerDown={(event) => {
        event.preventDefault()
        field.current?.focus()
      }}
    >
      <div aria-live="polite">
        {lines.map((line) =>
          line.kind === "in" ? (
            <p key={line.id} className="text-muted-foreground">
              <span aria-hidden="true">$ </span>
              {line.text}
            </p>
          ) : (
            <p key={line.id} className="whitespace-pre-wrap">
              {line.text}
            </p>
          )
        )}
      </div>
      <label className="relative flex">
        <span
          aria-hidden="true"
          className="whitespace-pre text-muted-foreground"
        >
          ${" "}
        </span>
        <span aria-hidden="true" className="whitespace-pre">
          {input}
        </span>
        <Cursor />
        <input
          ref={field}
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            back.current = 0
          }}
          onKeyDown={onKeyDown}
          onBlur={() => !input && lines.length === 0 && close()}
          aria-label="Command"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "absolute inset-0 w-full opacity-0",
            "caret-transparent outline-none"
          )}
        />
      </label>
    </section>
  )
}
