"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="fixed top-4 right-4 z-50 cursor-pointer font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "    "}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        {mounted &&
          `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode (press d)`}
      </TooltipContent>
    </Tooltip>
  )
}
