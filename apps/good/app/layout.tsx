import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Footer } from "@workspace/ui/components/footer"
import { Header } from "@workspace/ui/components/header"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const BIRTHDAY = process.env.NEXT_PUBLIC_BIRTHDAY ?? "2002-01-01"

export const metadata: Metadata = {
  title: "Good — NYCU WinLab",
  description: "Interactive 3D showcase for NYCU WinLab.",
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
          <Header />
          {children}
          <Footer birthday={BIRTHDAY} />
        </ThemeProvider>
      </body>
    </html>
  )
}
