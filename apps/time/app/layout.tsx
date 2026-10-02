import { LocaleProvider } from "@workspace/ui/components/locale-provider"
import { getLocale, localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import type { Metadata } from "next"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import {
  BottomCorners,
  LegalLinks,
  TopCorners,
} from "@workspace/ui/components/corners"
import { fontVariables } from "@workspace/ui/lib/fonts"
import { cn } from "@workspace/ui/lib/utils"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"

import { SITE_DESC, SITE_NAME, SITE_TITLE } from "@/lib/site"

const baseMetadata: Metadata = {
  metadataBase: new URL("https://time.zyx.tw"),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://zyx.tw" }],
  creator: "Loki",
  keywords: ["time", "clock", "zyx"],
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

  const locale = await getLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("dark", "antialiased", fontVariables, "font-sans")}
    >
      <body className="select-none">
        <LocaleProvider locale={locale} messages={MESSAGES}>
          <ThemeProvider>
            <TooltipProvider>
              <TopCorners />
              {children}
              <BottomCorners links={<LegalLinks />} />
            </TooltipProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES)
}
