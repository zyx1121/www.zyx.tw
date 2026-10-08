import type { Metadata } from "next";

import { cn } from "@workspace/ui/lib/utils";
import { column } from "@workspace/ui/lib/layout";

import { Hero } from "@/components/hero";
import { Showcase } from "@/components/showcase";
import { DOC_GROUPS } from "@/lib/docs";
import { INIT_COMMAND, MARKDOWN_PATH } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "text/markdown": MARKDOWN_PATH },
  },
};

export default function Home() {
  return (
    <main className={cn(column, "flex-1 pt-30 pb-25")}>
      <Hero />
      <Showcase initCommand={INIT_COMMAND} groups={DOC_GROUPS} />
    </main>
  );
}
