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

export const metadata = {
  title: "1909",
  description: "三個室友的共同支出",
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
      lang="zh-TW"
      suppressHydrationWarning
      className={cn("dark", "antialiased", fontVariables, "font-sans")}
    >
      <body>
        <ThemeProvider>
          <TopCorners fade />
          {children}
          <BottomCorners
            fade
            copyrightTip="Loki（詹詠翔）"
            links={
              <LegalLinks
                labels={{ privacy: "隱私權", terms: "條款" }}
                tips={{
                  privacy: "zyx.tw 各站儲存與記錄的資料",
                  terms: "zyx.tw 各站的使用規則",
                }}
              />
            }
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
