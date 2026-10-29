import { cn } from "@workspace/ui/lib/utils";
import { enterRow } from "@workspace/ui/lib/layout";

import { SITE_NAME, TAGLINE } from "@/lib/site";

// Title and one line, 12px apart, 100px above the content. Rows 1 and 2
// decode in after the header (row 0).
export function Hero() {
  return (
    <header className="pb-25">
      <h1 className={cn("text-title font-medium", enterRow(1))}>{SITE_NAME}</h1>
      <p className={cn("mt-3 text-muted-foreground", enterRow(2))}>{TAGLINE}</p>
    </header>
  );
}
