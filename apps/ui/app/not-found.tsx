import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@workspace/ui/components/status-page";
import { cn } from "@workspace/ui/lib/utils";
import { column, enterRow, page } from "@workspace/ui/lib/layout";

import { LLMS_PATH, MARKDOWN_PATH } from "@/lib/site";

export const metadata: Metadata = {
  title: "Not found",
};

const LINK =
  "rounded-control underline decoration-muted-foreground/40 underline-offset-4 outline-offset-2 transition-colors hover:decoration-foreground focus-visible:outline-2";

// Written for people and agents alike: say what happened, then where to look.
// Spotlight layout, like a component page.
export default function NotFound() {
  return (
    <main
      className={cn(
        column,
        page,
        "flex flex-1 flex-col items-center justify-center",
        enterRow(1)
      )}
    >
      <StatusPage
        title="Not found"
        action={
          <nav aria-label="Where to look" className="flex gap-5">
            <Link href="/" className={LINK}>
              Home
            </Link>
            <a href={MARKDOWN_PATH} className={LINK}>
              {MARKDOWN_PATH}
            </a>
            <a href={LLMS_PATH} className={LINK}>
              {LLMS_PATH}
            </a>
          </nav>
        }
      />
    </main>
  );
}
