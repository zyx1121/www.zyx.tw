import type { Metadata } from "next";

import { Hero } from "@/components/hero";
import { Showcase } from "@/components/showcase";
import { column } from "@/lib/layout";
import { COMPONENTS, getItem } from "@/lib/registry";
import { MARKDOWN_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";

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
      <Showcase
        theme={getItem("theme").description}
        items={COMPONENTS.map(({ name, title, description }) => ({
          name,
          title,
          description,
        }))}
      />
    </main>
  );
}
