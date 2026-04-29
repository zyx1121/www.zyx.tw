import Link from "next/link"

import { Menu } from "./menu"

export function Header() {
  return (
    <>
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 animate-pulse font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ZYX
      </Link>
      <Menu />
    </>
  )
}
