import { attributeRootLayoutRequest } from "@workspace/otel/layout"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "1909",
  description: "竹科潤隆 A 棟 19 樓之 9",
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
      className={cn("antialiased", fontVariables, "font-sans")}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
