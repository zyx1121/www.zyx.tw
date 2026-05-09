import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Brand } from "@workspace/ui/components/brand"
import { Copyright } from "@workspace/ui/components/copyright"
import { DaysAlive } from "@workspace/ui/components/days-alive"
import { cn } from "@workspace/ui/lib/utils"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Link",
  description: "Shorten your links.",
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
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body className="font-mono">
        <ThemeProvider>
          <Brand />
          <ThemeToggle />
          {children}
          <DaysAlive />
          <Copyright />
        </ThemeProvider>
      </body>
    </html>
  )
}
