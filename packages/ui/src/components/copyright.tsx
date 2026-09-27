import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

export function Copyright() {
  const year = new Date().getFullYear()
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="fixed right-4 bottom-4 z-50 cursor-default text-sm text-muted-foreground tabular-nums" />
        }
      >
        © {year}
      </TooltipTrigger>
      <TooltipContent side="top">still under construction</TooltipContent>
    </Tooltip>
  )
}
