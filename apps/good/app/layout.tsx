import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import { Brand } from "@workspace/ui/components/brand"
import { Copyright } from "@workspace/ui/components/copyright"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_NAME = "乖乖"
const SITE_DESC =
  "Digital 乖乖 — the snack engineers tape onto servers for luck."

export const metadata: Metadata = {
  metadataBase: new URL("https://good.zyx.tw"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://zyx.tw" }],
  creator: "Loki",
  keywords: ["乖乖", "digital amulet", "電子護符", "zyx"],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
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
          <Brand />
          {children}
          <Copyright />
        </ThemeProvider>
      </body>
    </html>
  )
}
