import Link from "next/link"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

export function Header() {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/"
            className="fixed top-4 left-4 z-50 animate-pulse font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ZYX
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          Zhan Yong Xiang · 詹詠翔
        </TooltipContent>
      </Tooltip>
      <ThemeToggle />
    </>
  )
}
