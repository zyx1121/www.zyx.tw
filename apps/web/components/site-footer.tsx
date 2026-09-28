"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BottomCorners, cornerLink } from "@workspace/ui/components/corners"

import { MarkdownLink } from "@/components/markdown-link"
import { enter, ENTER, enterDelay } from "@/lib/layout"
import { SOCIAL } from "@/lib/site"

export function SiteFooter() {
  const pathname = usePathname()
  const home = pathname === "/"

  return (
    <BottomCorners
      fade={!home}
      className={home ? `dark ${enter}` : enter}
      style={enterDelay(ENTER.footer)}
      links={
        <>
          <Link
            href="/privacy"
            aria-current={pathname === "/privacy" ? "page" : undefined}
            className={cornerLink}
          >
            Privacy
          </Link>
          {SOCIAL.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cornerLink}
            >
              {label}
            </a>
          ))}
          <MarkdownLink className={cornerLink} />
        </>
      }
    />
  )
}
