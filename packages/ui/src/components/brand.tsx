import Link from "next/link"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

export function Brand() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="https://zyx.tw"
            className="fixed top-4 left-4 z-50 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ZYX
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          Zhan Yong Xiang · 詹詠翔
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
