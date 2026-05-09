import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Brand } from "@workspace/ui/components/brand"
import { Copyright } from "@workspace/ui/components/copyright"
import { DaysAlive } from "@workspace/ui/components/days-alive"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const BIRTHDAY = process.env.NEXT_PUBLIC_BIRTHDAY ?? "2002-01-01"

export const metadata: Metadata = {
  title: "ZYX",
  description: "Loki — software, ML, and the occasional photo trail.",
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
          <ThemeToggle />
          {children}
          <DaysAlive birthday={BIRTHDAY} />
          <Copyright />
        </ThemeProvider>
      </body>
    </html>
  )
}
