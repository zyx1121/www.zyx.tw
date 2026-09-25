import Link from "next/link"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

export function Brand() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href="https://www.zyx.tw"
            className="fixed top-4 left-4 z-50 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          />
        }
      >
        zyx
      </TooltipTrigger>
      <TooltipContent side="bottom">Zhan Yong Xiang · 詹詠翔</TooltipContent>
    </Tooltip>
  )
}
