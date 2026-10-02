import { LocaleProvider } from "@workspace/ui/components/locale-provider"
import { getLocale, localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { attributeRootLayoutRequest } from "@workspace/otel/layout"

import {
  BottomCorners,
  LegalLinks,
  TopCorners,
} from "@workspace/ui/components/corners"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"

const baseMetadata = {
  title: "1909",
  description: "三個室友的共同支出",
  // A private app for three flatmates: keep every page out of search results.
  robots: { index: false, follow: false },
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
      <body>
        <LocaleProvider locale={locale} messages={MESSAGES}>
          <ThemeProvider>
            <TopCorners fade languageSwitch={false} />
            {children}
            <BottomCorners fade copyrightTip="Loki" links={<LegalLinks />} />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES)
}
