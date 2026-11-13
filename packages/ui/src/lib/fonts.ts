import { Geist_Mono, Noto_Sans_JP, Noto_Sans_TC } from "next/font/google"
import localFont from "next/font/local"

// The fonts behind the theme's one stack (apps/ui/DESIGN.md, Type). Every
// root layout on @workspace/ui puts `fontVariables` on <html>.

// Maple Mono NF CN sets all text, for the terminal look: every glyph keeps its
// cell (0.6em, a Han character 1.2em), so text lines up on a character grid.
// It is subset to Latin, punctuation, box drawing and CJK punctuation plus the
// Han characters the apps' text uses (../fonts/README.md has the command).
// SemiBold serves 500 and 600.
export const mapleMono = localFont({
  src: [
    { path: "../fonts/MapleMonoNFCN-Regular.woff2", weight: "400" },
    { path: "../fonts/MapleMonoNFCN-SemiBold.woff2", weight: "500 600" },
  ],
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-maple-mono",
})

// Han characters outside Maple's subset, as unicode-range slices without
// preload, so a page downloads only the slices its text needs.
export const notoSansTc = Noto_Sans_TC({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-tc",
})

// Plump (apps/3d) sets its own scene text in these; no other app loads them.
export const notoSansJp = Noto_Sans_JP({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-jp",
})

export const geistMono = Geist_Mono({
  preload: false,
  variable: "--font-geist-mono",
})

export const fontVariables = [mapleMono.variable, notoSansTc.variable].join(" ")
