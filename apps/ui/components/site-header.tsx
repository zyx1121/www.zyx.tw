"use client";
import { T, useT } from "@workspace/ui/components/locale-provider";
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
  const t = useT();

  return (
    <TopCorners
      fade
      className={enter}
      style={enterDelay(0)}
      nav={
        <nav aria-label={t("Main")} className="flex items-center gap-4">
          <CornerTip tip={t("What shadcn/ui does not have")}>
            <Link href="/#components" className={cornerLink}>
              <T>{"Components"}</T>
            </Link>
          </CornerTip>
          <CornerTip tip={t("Forms, data and AI primitives")}>
            <Link href="/#applications" className={cornerLink}>
              <T>{"Apps"}</T>
            </Link>
          </CornerTip>
          {/* The tip's trigger props land on the span, so they never replace
              the toggle's own onClick. -m-2 takes the 32px button's 8px inset
              back on every side, so the corner sees only its 16px icon, and
              the 20px span keeps the row, and the tip, where the links'
              are. */}
          <CornerTip tip={t("Toggle theme")}>
            <span className="flex h-5 items-center">
              <ThemeToggle
                aria-label={t("Toggle theme")}
                className="-m-2 text-muted-foreground hover:text-foreground"
              />
            </span>
          </CornerTip>
        </nav>
      }
    />
  );
}
