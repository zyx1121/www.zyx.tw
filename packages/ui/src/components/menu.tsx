"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

const ITEMS = [{ href: "/map", label: "MAP" }] as const

export function Menu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <nav
      ref={ref}
      className="fixed top-4 right-4 z-50 font-mono text-sm"
      aria-label="Site menu"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="animate-pulse text-muted-foreground transition-colors hover:text-foreground"
      >
        MENU
      </button>
      <ul
        className={cn(
          "duration-base mt-2 flex flex-col items-end gap-2 transition-all ease-glide",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className="block text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
