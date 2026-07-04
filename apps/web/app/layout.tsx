import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import { Brand } from "@workspace/ui/components/brand"
import { Copyright } from "@workspace/ui/components/copyright"
import { DaysAlive } from "@workspace/ui/components/days-alive"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

import { JsonLd } from "@/components/json-ld"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_NAME = "zyx"

export const metadata: Metadata = {
  metadataBase: new URL("https://zyx.tw"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://zyx.tw" }],
  creator: "Loki",
  keywords: [
    "Loki",
    "Zhan Yong Xiang",
    "詹詠翔",
    "zyx",
    "NYCU",
    "WinLab",
    "software engineer",
    "machine learning",
    "photography",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
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
      className={`${fontMono.variable} font-mono antialiased`}
    >
      <body>
        <JsonLd />
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
