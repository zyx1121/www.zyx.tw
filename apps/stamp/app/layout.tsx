import type { Metadata } from "next"

import { cn } from "@workspace/ui/lib/utils"
import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import {
  BottomCorners,
  CornerTip,
  LegalLinks,
  TopCorners,
  cornerLink,
} from "@workspace/ui/components/corners"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"
import { fontVariables } from "@workspace/ui/lib/fonts"
import { enterFooter, enterRow } from "@workspace/ui/lib/layout"

import "./stamp.css"
import { SiteJsonLd } from "@/components/json-ld"
import {
  ACCESS_URL,
  SITE_DESC,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/content"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://www.zyx.tw" }],
  creator: "Loki",
  keywords: [
    "Stamp",
    "workflow automation",
    "AI agent",
    "human approval",
    "school administration",
    "MCP",
  ],
  alternates: {
    types: { "text/markdown": "/index.md", "text/plain": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
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
      className={cn(
        "dark",
        "antialiased",
        "[scrollbar-gutter:stable]",
        fontVariables,
        "font-sans"
      )}
    >
      <body>
        <SiteJsonLd />
        <ThemeProvider>
          <TooltipProvider>
            <TopCorners
              fade
              className={enterRow(0)}
              nav={
                <>
                  <a href="#film" className={cornerLink}>
                    Film
                  </a>
                  <CornerTip tip="Invite only">
                    <a href={ACCESS_URL} className={cornerLink}>
                      Request access
                    </a>
                  </CornerTip>
                </>
              }
            />
            {children}
            <BottomCorners
              fade
              className={enterFooter}
              links={<LegalLinks />}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
