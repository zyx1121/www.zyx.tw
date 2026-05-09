import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Footer } from "@workspace/ui/components/footer"
import { Header } from "@workspace/ui/components/header"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip"

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
          <TooltipProvider>
            <Header />
            {children}
            <Footer birthday={BIRTHDAY} />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
