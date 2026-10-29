"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  cornerLink,
  CornerLabel,
  CornerTip,
  TopCorners,
} from "@workspace/ui/components/corners"
import { enter } from "@workspace/ui/lib/layout"

import { PAGES } from "@/lib/site"

const NAV = PAGES.filter((page) => page.nav)

export function SiteHeader() {
  const pathname = usePathname()
  // Nothing scrolls under the home's corners, so they need no fade.
  const home = pathname === "/"

  return (
    <TopCorners
      home="/"
      label="zyx, home"
      fade={!home}
      className={enter}
      nav={
        <nav aria-label="Main">
          <ul className="flex gap-2">
            {NAV.map(({ path, label, tip }) => {
              const current =
                pathname === path || pathname.startsWith(`${path}/`)
              return (
                <li key={path} className="flex">
                  <CornerTip tip={tip}>
                    <Link
                      href={path}
                      aria-current={current ? "page" : undefined}
                      className={cornerLink}
                    >
                      <CornerLabel current={current}>{label}</CornerLabel>
                    </Link>
                  </CornerTip>
                </li>
              )
            })}
          </ul>
        </nav>
      }
    />
  )
}
