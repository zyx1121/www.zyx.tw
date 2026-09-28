import Link from "next/link";

import {
  cornerLink,
  CornerTip,
  TopCorners,
} from "@workspace/ui/components/corners";

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
          <CornerTip tip="What shadcn/ui does not have">
            <Link href="/#components" className={cornerLink}>
              Components
            </Link>
          </CornerTip>
          {/* The tip's trigger props land on the span, so they never replace
              the toggle's own onClick. -m-2 takes the 32px button's 8px inset
              back on every side, so the corner, and the tip, see only its
              16px icon and the row stays 20px. */}
          <CornerTip tip="Toggle theme">
            <span className="flex">
              <ThemeToggle className="-m-2 text-muted-foreground hover:text-foreground" />
            </span>
          </CornerTip>
        </nav>
      }
    />
  );
}
