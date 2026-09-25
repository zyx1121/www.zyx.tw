import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { attributeRootLayoutRequest } from "@workspace/otel/layout"
import "@workspace/ui/globals.css"
import { Brand } from "@workspace/ui/components/brand"
import { Copyright } from "@workspace/ui/components/copyright"
import { DaysAlive } from "@workspace/ui/components/days-alive"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeToggle } from "@workspace/ui/components/ui/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { MotionProvider } from "@workspace/ui/components/motion-provider"

import { JsonLd } from "@/components/json-ld"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_NAME = "zyx"
const SITE_DESCRIPTION =
  "Loki (詹詠翔), CS grad student at NYCU WinLab. Side projects, lab work, GitHub activity, and places I have photographed."

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zyx.tw"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Loki", url: "https://www.zyx.tw" }],
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
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body>
        <JsonLd />
        <ThemeProvider>
          <TooltipProvider>
            <MotionProvider>
              <Brand />
              {/* Placement lives here, the registry component stays stock. */}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="fixed top-2.5 right-2.5 z-50 flex" />
                  }
                >
                  <ThemeToggle className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Toggle theme (press d)
                </TooltipContent>
              </Tooltip>
              {children}
              <DaysAlive />
              <Copyright />
            </MotionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
