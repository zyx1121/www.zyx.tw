"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"
import { DaysAlive } from "@workspace/ui/components/days-alive"

type FooterProps = {
  birthday: string
}

export function Footer({ birthday }: FooterProps) {
  const year = new Date().getFullYear()
  return (
    <TooltipProvider>
      <DaysAlive birthday={birthday} />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="fixed right-4 bottom-4 z-50 cursor-default font-mono text-sm text-muted-foreground">
            © {year}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          still under construction
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
