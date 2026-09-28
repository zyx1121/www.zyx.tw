"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ActiveMark } from "@workspace/ui/components/active-mark"
import { cornerLink, TopCorners } from "@workspace/ui/components/corners"

import { enter } from "@/lib/layout"
import { PAGES } from "@/lib/site"

const NAV = PAGES.filter((page) => page.nav)

export function SiteHeader() {
  const pathname = usePathname()
  // The home is a dark 3D stage in either theme, so its corners take the
  // dark tokens, and nothing scrolls under them.
  const home = pathname === "/"

  return (
    <TopCorners
      home="/"
      label="zyx, home"
      fade={!home}
      className={home ? `dark ${enter}` : enter}
      nav={
        <nav aria-label="Main">
          <ul className="flex gap-4">
            {NAV.map(({ path, label }) => {
              const current = pathname === path
              return (
                <li key={path} className="relative flex">
                  <Link
                    href={path}
                    aria-current={current ? "page" : undefined}
                    className={cornerLink}
                  >
                    {label}
                  </Link>
                  {/* Springs to the new page's item on navigation. */}
                  {current && (
                    <ActiveMark
                      layoutId="site-header-mark"
                      className="absolute -bottom-2 left-[calc(50%-2px)]"
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      }
    />
  )
}
