import type { Metadata } from "next";
import { cn } from "cn";

import "@workspace/ui/globals.css";

import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { Toaster } from "@workspace/ui/components/ui/sonner";
import { TooltipProvider } from "@workspace/ui/components/ui/tooltip";
import { fontVariables } from "@workspace/ui/lib/fonts";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const SITE_TITLE = `Loki's design system | ${SITE_NAME}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
      {/* The page fills the viewport so the footer sits low on short pages. */}
      <body className="flex min-h-dvh flex-col">
        <JsonLd />
        <ThemeProvider>
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
