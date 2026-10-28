import localFont from "next/font/local"

// Sarasa Mono TC replaces Inter as this site's text face, for a terminal
// look. It is subset to the Latin, punctuation, box drawing and CJK
// punctuation ranges plus the Han characters the site's text uses
// (../fonts/README.md has the command). Han characters outside the subset fall
// back to Noto Sans TC. Sarasa has no Medium, so SemiBold serves 500 and 600.
export const sarasaMono = localFont({
  src: [
    { path: "../fonts/SarasaMonoTC-Regular.woff2", weight: "400" },
    { path: "../fonts/SarasaMonoTC-SemiBold.woff2", weight: "500 600" },
  ],
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-sarasa-mono",
})
