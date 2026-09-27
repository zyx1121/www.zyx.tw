import { Geist_Mono, Noto_Sans_JP, Noto_Sans_TC } from "next/font/google"
import localFont from "next/font/local"

// The fonts behind the theme's --font-sans and --font-mono stacks
// (apps/ui/DESIGN.md). This app does not depend on @workspace/ui, so it keeps
// its own copy of packages/ui/src/lib/fonts.ts; keep the two in step.

// Inter 4.1 from rsms/inter, unmodified (LICENSE.txt beside the files). The
// Google Fonts build of Inter lacks the ss01 (open digits) and zero (slashed
// zero) features that the theme turns on, so it is self-hosted.
export const inter = localFont({
  src: "../fonts/InterVariable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
})

// The italic is a second call only so that it is not preloaded; the browser
// fetches it the first time italic text renders. Its declaration moves it into
// the family above, which Turbopack names after the `inter` const.
export const interItalic = localFont({
  src: "../fonts/InterVariable-Italic.woff2",
  weight: "100 900",
  style: "italic",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "'inter'" }],
})

// CJK after Inter. Noto Sans JP comes first so Han characters take Japanese
// forms and punctuation; Noto Sans TC fills the glyphs JP lacks (值, 夠). Both
// ship as unicode-range slices without preload, so a page downloads only the
// slices its text needs.
export const notoSansJp = Noto_Sans_JP({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-jp",
})

export const notoSansTc = Noto_Sans_TC({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-tc",
})

// Code only.
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const fontVariables = [
  inter.variable,
  notoSansJp.variable,
  notoSansTc.variable,
  geistMono.variable,
].join(" ")
