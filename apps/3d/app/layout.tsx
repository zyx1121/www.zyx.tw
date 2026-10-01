import type { Metadata } from "next"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "./globals.css"
import {
  BottomCorners,
  CornerTip,
  LegalLinks,
  TopCorners,
} from "@workspace/ui/components/corners"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"
import { geistMono, notoSansJp, notoSansTc } from "@workspace/ui/lib/fonts"
import { cn } from "@workspace/ui/lib/utils"

import { SITE_DESC, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://zyx.tw" }],
  creator: "Loki",
  keywords: ["Plump", "3D", "SVG", "text", "extrude", "three.js", "zyx"],
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
        notoSansJp.variable,
        notoSansTc.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <TopCorners
              nav={
                <CornerTip tip="Turn your SVG or text into a 3D object">
                  <span className="font-medium">{SITE_NAME}</span>
                </CornerTip>
              }
            />
            {children}
            <BottomCorners links={<LegalLinks />} />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
