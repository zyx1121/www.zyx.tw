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

/**
 * The steps from the home page to `pathname`: the page it belongs to, then
 * the project when it is one's page (`names` maps a slug to its name).
 */
function trailOf(pathname: string, names: Record<string, string>) {
  const page = PAGES.find(
    ({ path }) =>
      path !== "/" && (pathname === path || pathname.startsWith(`${path}/`))
  )
  if (!page) return []
  const name = names[pathname.slice(page.path.length + 1)]
  return name
    ? [{ label: page.label, href: page.path }, { label: name }]
    : [{ label: page.label }]
}

export function SiteHeader({
  projectNames,
}: {
  /** Each project's name by slug, for the last step of its page's trail. */
  projectNames: Record<string, string>
}) {
  const pathname = usePathname()
  // Nothing scrolls under the home's corners, so they need no fade.
  const home = pathname === "/"

  return (
    <TopCorners
      home="/"
      label="zyx, home"
      fade={!home}
      trail={trailOf(pathname, projectNames)}
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
