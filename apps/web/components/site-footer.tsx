"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  BottomCorners,
  cornerLink,
  CornerTip,
  LEGAL_TIPS,
} from "@workspace/ui/components/corners"
import { enterFooter } from "@workspace/ui/lib/layout"

/** The bottom corners: Privacy and Terms, which cover every zyx.tw site. */
export function SiteFooter() {
  const pathname = usePathname()
  const home = pathname === "/"
  const made = pathname.startsWith("/made/")

  return (
    <BottomCorners
      fade={!home}
      className={
        home
          ? `dark ${enterFooter}`
          : made
            ? `made-bottom-corner ${enterFooter}`
            : enterFooter
      }
      links={
        <>
          <CornerTip tip={LEGAL_TIPS.privacy}>
            <Link
              href="/privacy"
              aria-current={pathname === "/privacy" ? "page" : undefined}
              className={cornerLink}
            >
              Privacy
            </Link>
          </CornerTip>
          <CornerTip tip={LEGAL_TIPS.terms}>
            <Link
              href="/terms"
              aria-current={pathname === "/terms" ? "page" : undefined}
              className={cornerLink}
            >
              Terms
            </Link>
          </CornerTip>
        </>
      }
    />
  )
}
