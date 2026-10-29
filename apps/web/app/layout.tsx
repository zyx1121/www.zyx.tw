import type { Metadata } from "next"

import { cn } from "@workspace/ui/lib/utils"
import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import { MotionProvider } from "@workspace/ui/components/motion-provider"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"
import { fontVariables } from "@workspace/ui/lib/fonts"

import { SiteJsonLd } from "@/components/json-ld"
import { PageDecode } from "@workspace/ui/components/page-decode"
import { PondBackground } from "@/components/pond-background"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

import "./globals.css"

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
      // 20 px from the window's edge on every page and every site.
      className={cn(
        "dark",
        "antialiased [scrollbar-gutter:stable]",
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
              <PageDecode />
              <PondBackground />
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
