import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ui.zyx.tw"),
  title: "ui.zyx.tw",
  description:
    "Loki's design system. Stock shadcn/ui, grayscale palette, plus my own components.",
  openGraph: {
    title: "ui.zyx.tw",
    description:
      "Loki's design system. Stock shadcn/ui, grayscale palette, plus my own components.",
    url: "https://ui.zyx.tw",
    siteName: "ui.zyx.tw",
    type: "website",
  },
};

// No `@workspace/otel/layout` client-attribution call here: this app builds
// with `output: "export"` (see next.config.ts), and Next.js's static export
// doesn't support dynamic APIs like `headers()` in Server Components — the
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
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
