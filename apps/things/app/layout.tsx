import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Brand } from "@workspace/ui/components/brand"
import { Copyright } from "@workspace/ui/components/copyright"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Things",
  description:
    "A scrapbook for text, links, images, and video — things worth keeping.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontMono.variable} font-mono antialiased`}
    >
      <body>
        <ThemeProvider>
          <Brand />
          {children}
          <Copyright />
        </ThemeProvider>
      </body>
    </html>
  )
}
