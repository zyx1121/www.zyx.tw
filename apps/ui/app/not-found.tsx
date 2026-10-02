import { T } from "@workspace/ui/components/locale-provider";
import { localizedMetadata } from "@workspace/ui/lib/i18n-server";
import { MESSAGES } from "@/lib/messages";
import type { Metadata } from "next";
import Link from "next/link";

import { column, enter, enterDelay } from "@/lib/layout";
import { LLMS_PATH, MARKDOWN_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";

const baseMetadata: Metadata = {
  title: "Not found",
};

const LINK =
  "rounded-sm underline decoration-muted-foreground/40 underline-offset-4 outline-offset-2 transition-colors hover:decoration-foreground focus-visible:outline-2";

// Written for people and agents alike: say what happened, then where to look.
export default function NotFound() {
  return (
    <main className={cn(column, "flex-1 pt-30 pb-25")}>
      <h1 className={cn("text-2xl/8 font-medium", enter)} style={enterDelay(1)}>
        <T>{"Not found"}</T>
      </h1>
      <ul className={cn("mt-5 space-y-3", enter)} style={enterDelay(2)}>
        <li>
          <Link href="/" className={LINK}>
            <T>{"The home page"}</T>
          </Link>
          <span className="text-muted-foreground">
            <T>{": every item with a demo."}</T>
          </span>
        </li>
        <li>
          <a href={MARKDOWN_PATH} className={LINK}>
            <T>{MARKDOWN_PATH}</T>
          </a>
          <span className="text-muted-foreground">
            <T>{": the same, as Markdown."}</T>
          </span>
        </li>
        <li>
          <a href={LLMS_PATH} className={LINK}>
            <T>{LLMS_PATH}</T>
          </a>
          <span className="text-muted-foreground">
            <T>{": the index for agents."}</T>
          </span>
        </li>
      </ul>
      <p
        className={cn("mt-5 text-muted-foreground", enter)}
        style={enterDelay(3)}
      >
        <T>{"Registry items live at"}</T>
        <T> </T>
        <code className="font-mono">{"/r/<name>.json"}</code>
        <T>{", and index.md lists every name."}</T>
      </p>
    </main>
  );
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES);
}
