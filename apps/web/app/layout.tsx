import type { Metadata } from "next"
import { cn } from "cn"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import { MotionProvider } from "@workspace/ui/components/motion-provider"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"
import { fontVariables } from "@workspace/ui/lib/fonts"

import { SiteJsonLd } from "@/components/json-ld"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import sceneFile from "@/lib/home-scene.json"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: SITE_URL }],
  creator: "Loki",
  keywords: [
    "Loki",
    "Zhan Yong Xiang",
    "詹詠翔",
    "zyx",
    "NYCU",
    "WinLab",
    "software engineer",
    "machine learning",
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Client attribution for Sensorium — see @workspace/otel/layout for why
  // this has to run here (Node.js Server Component) and not middleware.
  await attributeRootLayoutRequest()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      // A stable gutter keeps the centered column from moving when a page
      // gains or loses its scrollbar. One edge only, so the left corners stay
      // 20 px from the window's edge on every page and every site. Under the
      // home's 3D stage the gutter takes the scene's background, so the stage
      // meets the window's edge in either theme.
      style={{ "--stage": sceneFile.staging.background } as React.CSSProperties}
      className={cn(
        "dark",
        "antialiased [scrollbar-gutter:stable] has-[main[data-stage]]:bg-(--stage)",
        fontVariables,
        "font-sans"
      )}
    >
      {/* Body text is 16px at every width, phones included. Pages fill the
          viewport so the footer sits low. */}
      <body className="flex min-h-dvh flex-col text-body">
        <SiteJsonLd />
        <ThemeProvider>
          <TooltipProvider>
            <MotionProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
            </MotionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
