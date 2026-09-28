"use client"

import { usePathname } from "next/navigation"

import { markdownFor } from "@/lib/site"

/** The current page as Markdown; nothing on pages without a twin. */
export function MarkdownLink({ className }: { className?: string }) {
  const markdown = markdownFor(usePathname())
  if (!markdown) return null
  return (
    <a href={markdown} className={className}>
      Markdown
    </a>
  )
}
