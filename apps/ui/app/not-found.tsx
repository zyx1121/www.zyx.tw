import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";

import { column, enterRow } from "@workspace/ui/lib/layout";

import { LLMS_PATH, MARKDOWN_PATH } from "@/lib/site";

export const metadata: Metadata = {
  title: "Not found",
};

const LINK =
  "rounded-control underline decoration-muted-foreground/40 underline-offset-4 outline-offset-2 transition-colors hover:decoration-foreground focus-visible:outline-2";

// Written for people and agents alike: say what happened, then where to look.
export default function NotFound() {
  return (
    <main className={cn(column, "flex-1 pt-30 pb-25")}>
      <h1 className={cn("text-title font-medium", enterRow(1))}>Not found</h1>
      <ul className={cn("mt-5 space-y-3", enterRow(2))}>
        <li>
          <Link href="/" className={LINK}>
            The home page
          </Link>
          <span className="text-muted-foreground">
            : every item with a demo.
          </span>
        </li>
        <li>
          <a href={MARKDOWN_PATH} className={LINK}>
            {MARKDOWN_PATH}
          </a>
          <span className="text-muted-foreground">
            : the same, as Markdown.
          </span>
        </li>
        <li>
          <a href={LLMS_PATH} className={LINK}>
            {LLMS_PATH}
          </a>
          <span className="text-muted-foreground">: the index for agents.</span>
        </li>
      </ul>
      <p className={cn("mt-5 text-muted-foreground", enterRow(3))}>
        Registry items live at{" "}
        <code className="font-mono">{"/r/<name>.json"}</code>, and index.md
        lists every name.
      </p>
    </main>
  );
}
