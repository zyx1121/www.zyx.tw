import type { Metadata } from "next"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import { BottomCorners, TopCorners } from "@workspace/ui/components/corners"
import { fontVariables } from "@workspace/ui/lib/fonts"
import { cn } from "@workspace/ui/lib/utils"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"

const SITE_NAME = "Link"
const SITE_DESC = "URL shortener — paste a long one, get a short one back."

export const metadata: Metadata = {
  metadataBase: new URL("https://link.zyx.tw"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://zyx.tw" }],
  creator: "Loki",
  keywords: ["url shortener", "short link", "zyx"],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
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
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <TopCorners />
            {children}
            <BottomCorners />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
