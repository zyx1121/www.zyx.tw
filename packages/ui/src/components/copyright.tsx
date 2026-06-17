import { Tooltip } from "@workspace/ui/components/ui/tooltip"

export function Copyright() {
  const year = new Date().getFullYear()
  return (
    <Tooltip content="still under construction" side="top">
      <span className="fixed right-4 bottom-4 z-50 cursor-default font-mono text-sm text-muted-foreground">
        © {year}
      </span>
    </Tooltip>
  )
}
