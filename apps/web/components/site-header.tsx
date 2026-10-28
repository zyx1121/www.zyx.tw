"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  cornerLink,
  CornerTip,
  TopCorners,
} from "@workspace/ui/components/corners"
import { enter } from "@workspace/ui/lib/layout"

import { instrumentSans } from "@/lib/corner-font"
import { PAGES } from "@/lib/site"

const NAV = PAGES.filter((page) => page.nav)

export function SiteHeader() {
  const pathname = usePathname()
  // The home is a 3D stage over Bliss, so its corners take the ink
  // HomeInk picks for the picture under them, and nothing scrolls under them.
  const home = pathname === "/"

  return (
    <TopCorners
      home="/"
      label="zyx, home"
      fade={!home}
      className={
        home
          ? `[--foreground:var(--home-ink-top,var(--color-black))] [--muted-foreground:var(--home-ink-top,var(--color-black))] ${instrumentSans.className} ${enter}`
          : enter
      }
      nav={
        <nav aria-label="Main">
          <ul className="flex gap-2">
            {NAV.map(({ path, label, tip }) => {
              const current =
                pathname === path || pathname.startsWith(`${path}/`)
              // Brackets mark the current page, as in a terminal menu. The
              // other items keep theirs invisible, so nothing shifts on
              // navigation.
              const bracket = current ? undefined : "invisible"
              return (
                <li key={path} className="flex">
                  <CornerTip tip={tip}>
                    <Link
                      href={path}
                      aria-current={current ? "page" : undefined}
                      className={`${cornerLink} uppercase`}
                    >
                      <span aria-hidden="true" className={bracket}>
                        [
                      </span>
                      {label}
                      <span aria-hidden="true" className={bracket}>
                        ]
                      </span>
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
