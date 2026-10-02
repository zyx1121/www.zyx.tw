"use client";
import { T, useT } from "@workspace/ui/components/locale-provider";
import { enter, enterDelay } from "@/lib/layout";
import { SITE_NAME, TAGLINE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ScrambleText } from "@/registry/ui/scramble-text";

// Title and one line, 12px apart, 100px above the content. Rows 1 and 2 fade
// in after the header (row 0).
export function Hero() {
  const t = useT();

  return (
    <header className="pb-25">
      <div className={enter} style={enterDelay(1)}>
        <ScrambleText
          element="h1"
          text={t(SITE_NAME)}
          className="text-2xl/8 font-medium"
        />
      </div>
      <p
        className={cn("mt-3 text-muted-foreground", enter)}
        style={enterDelay(2)}
      >
        <T>{TAGLINE}</T>
      </p>
    </header>
  );
}
