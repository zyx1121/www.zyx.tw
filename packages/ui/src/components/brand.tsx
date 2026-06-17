import Link from "next/link"

import { Tooltip } from "@workspace/ui/components/ui/tooltip"

export function Brand() {
  return (
    <Tooltip content="Zhan Yong Xiang · 詹詠翔" side="bottom">
      <Link
        href="https://zyx.tw"
        className="fixed top-4 left-4 z-50 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        zyx
      </Link>
    </Tooltip>
  )
}
