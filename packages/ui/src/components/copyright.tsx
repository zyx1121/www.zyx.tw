import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

export function Copyright() {
  const year = new Date().getFullYear()
  return (
    <TooltipProvider>
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
