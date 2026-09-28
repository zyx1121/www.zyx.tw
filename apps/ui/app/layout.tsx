import type { Metadata } from "next";
import "./globals.css";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

// No `@workspace/otel/layout` client-attribution call here: this app builds
// with `output: "export"` (see next.config.ts), and Next.js's static export
// doesn't support dynamic APIs like `headers()` in Server Components; the
// build fails if a route under a fully static export tree calls it. There's
// also no per-request Next.js server at runtime for a static export
// deployment, so there would be nothing to attribute per-visitor anyway.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // Dark is server-rendered, so the first paint and pages without
      // JavaScript are dark. A stable gutter keeps the centered column still
      // when a page gains or loses its scrollbar; one edge only, so the left
      // corners stay 20px from the window's edge.
      className={cn(
        "dark",
        "[scrollbar-gutter:stable] antialiased",
        fontVariables,
        "font-sans"
      )}
    >
      {/* Body and nav text is 20px on phones and 16px from `sm`, easing
          between the two. The page fills the viewport so the footer sits
          low on short pages. */}
      <body className="flex min-h-dvh flex-col text-xl motion-safe:transition-[font-size] motion-safe:duration-300 sm:text-base">
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
