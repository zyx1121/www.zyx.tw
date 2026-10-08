import type { Metadata } from "next"

import { cn } from "@workspace/ui/lib/utils"
import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import {
  BottomCorners,
  LegalLinks,
  TopCorners,
} from "@workspace/ui/components/corners"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"
import { fontVariables } from "@workspace/ui/lib/fonts"

import { SITE_DESC, SITE_NAME, SITE_TITLE } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL("https://good.zyx.tw"),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://zyx.tw" }],
  creator: "Loki",
  keywords: ["乖乖", "digital amulet", "電子護符", "zyx"],
  openGraph: {
    type: "website",
    locale: "zh_TW",
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
      className={cn("dark", "antialiased", fontVariables, "font-sans")}
    >
      <head>
        <link
          rel="preload"
          href="/good.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <TopCorners />
            {children}
            <BottomCorners links={<LegalLinks />} />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
