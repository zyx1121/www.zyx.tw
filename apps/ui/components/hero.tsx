import { cn } from "cn";

import { ScrambleText } from "@workspace/ui/components/ui/scramble-text";
import { enterRow } from "@workspace/ui/lib/layout";

import { SITE_NAME, TAGLINE } from "@/lib/site";

// Title and one line, 12px apart, 100px above the content. Rows 1 and 2 fade
// in after the header (row 0).
export function Hero() {
  return (
    <header className="pb-25">
      <div className={enterRow(1)}>
        <ScrambleText
          element="h1"
          text={SITE_NAME}
          className="text-title font-medium"
        />
      </div>
      <p className={cn("mt-3 text-muted-foreground", enterRow(2))}>{TAGLINE}</p>
    </header>
  );
}
