import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { cn } from "@workspace/ui/lib/utils";
import { column, enterRow, page } from "@workspace/ui/lib/layout";

import { Demo } from "@/components/demos";
import { docMarkdownPath, DOCS, getDoc, hasDemo } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((item) => ({ slug: item.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getDoc(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    alternates: {
      canonical: `/${item.name}`,
      types: { "text/markdown": docMarkdownPath(item.name) },
    },
  };
}

// One component per page, in the spotlight layout: the title, its one line,
// the demo and the install command, centered on both axes. A page taller than
// the viewport falls back to scrolling from the top.
export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getDoc(slug);
  if (!item) notFound();

  return (
    <main
      className={cn(
        column,
        page,
        "flex flex-1 flex-col items-center justify-center text-center"
      )}
    >
      <h1 className={cn("text-title font-medium", enterRow(1))}>
        {item.title}
      </h1>
      <p className={cn("mt-3 text-muted-foreground", enterRow(2))}>
        {item.description}
      </p>
      {hasDemo(item.name) && (
        <div
          className={cn(
            "mt-15 flex w-full flex-col items-center text-left",
            enterRow(3)
          )}
        >
          <Demo name={item.name} />
        </div>
      )}
      <code
        className={cn(
          "mt-15 font-mono text-caption wrap-break-word text-muted-foreground",
          enterRow(4)
        )}
      >
        {`bunx shadcn@latest add @zyx1121/${item.name}`}
      </code>
    </main>
  );
}
