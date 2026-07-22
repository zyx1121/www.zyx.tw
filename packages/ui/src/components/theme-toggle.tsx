"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { Tooltip } from "@workspace/ui/components/ui/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate: first paint must match SSR markup
    setMounted(true)
  }, [])

  return (
    <Tooltip
      side="bottom"
      content={
        mounted
          ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode (press d)`
          : ""
      }
    >
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 cursor-pointer font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "    "}
      </button>
    </Tooltip>
  )
}
