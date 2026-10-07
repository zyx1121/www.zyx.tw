import Link from "next/link";

import {
  cornerLink,
  CornerTip,
  TopCorners,
} from "@workspace/ui/components/corners";
import { ThemeToggle } from "@workspace/ui/components/ui/theme-toggle";
import { enterRow } from "@workspace/ui/lib/layout";

// The mark top left goes to www.zyx.tw; the section link and the theme toggle
// sit top right.
export function SiteHeader() {
  return (
    <TopCorners
      fade
      className={enterRow(0)}
      nav={
        <nav aria-label="Main" className="flex items-center gap-4">
          <CornerTip tip="Everything the registry ships">
            <Link href="/#components" className={cornerLink}>
              Components
            </Link>
          </CornerTip>
          {/* The tip's trigger props land on the span, so they never replace
              the toggle's own onClick. -m-3 takes the 40px button's 12px
              inset back on every side, so the corner sees only its 16px icon,
              and the 24px span keeps the row, and the tip, where the links'
              are. */}
          <CornerTip tip="Toggle theme">
            <span className="flex h-6 items-center">
              <ThemeToggle className="-m-3 text-muted-foreground hover:text-foreground" />
            </span>
          </CornerTip>
        </nav>
      }
    />
  );
}
