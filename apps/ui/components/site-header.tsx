import Link from "next/link";

import { cornerLink, TopCorners } from "@workspace/ui/components/corners";

import { enter, enterDelay } from "@/lib/layout";
import { ThemeToggle } from "@/registry/ui/theme-toggle";

// The mark top left goes to www.zyx.tw; the section link and the theme toggle
// sit top right. GitHub and the Markdown version are bottom left.
export function SiteHeader() {
  return (
    <TopCorners
      fade
      className={enter}
      style={enterDelay(0)}
      nav={
        <nav aria-label="Main" className="flex items-center gap-4">
          <Link href="/#components" className={cornerLink}>
            Components
          </Link>
          {/* -m-2 takes the 32px button's 8px inset back on every side, so
              the corner sees only its 16px icon and keeps its 20px row. */}
          <ThemeToggle className="-m-2 text-muted-foreground hover:text-foreground" />
        </nav>
      }
    />
  );
}
