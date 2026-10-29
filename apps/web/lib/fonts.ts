import localFont from "next/font/local"

// Pixel type, a trial on this site only. Monocraft sets Latin, digits and
// punctuation in the Minecraft look; Cubic 11 sets the Han characters on an
// 11 px grid. Both are bitmap designs, so the site's type scale (globals.css)
// uses multiples of 11 px, where their pixels land on the screen's. Each file
// is subset (../fonts/README.md has the commands). Han characters outside the
// subset fall back to Noto Sans TC. Cubic 11 has one weight.
export const monocraft = localFont({
  src: [
    { path: "../fonts/Monocraft-Regular.woff2", weight: "400" },
    { path: "../fonts/Monocraft-SemiBold.woff2", weight: "500 600" },
  ],
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-monocraft",
})

export const cubic11 = localFont({
  src: "../fonts/Cubic11.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-cubic-11",
})
