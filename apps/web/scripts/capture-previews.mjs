/**
 * Regenerates the static project previews in public/previews/.
 *
 * The Projects section used to embed every site as a live <iframe>; that
 * cost visitors ~7 MB on first load and showed blank tiles for sites that
 * set `frame-ancestors 'none'`. Screenshots are committed instead and
 * refreshed by hand with `bun run previews` whenever a site changes.
 *
 * Needs Google Chrome installed (used via Playwright's `chrome` channel so
 * nothing is downloaded) and `cwebp` on PATH (`brew install webp`).
 */
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const SITES = [
  "things.zyx.tw",
  "good.zyx.tw",
  "ai.winlab.tw",
  "www.winlab.tw",
  "gallery.winlab.tw",
  "temp.zyx.tw",
  "link.zyx.tw",
  "time.zyx.tw",
]

const OUT_DIR = new URL("../public/previews/", import.meta.url).pathname
const WIDTH = 680 // 2x of the widest card (340px)

mkdirSync(OUT_DIR, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), "previews-"))

for (const host of SITES) {
  const png = join(tmp, `${host}.png`)
  execFileSync(
    "npx",
    [
      "-y",
      "playwright@1.58.0",
      "screenshot",
      "--browser=chromium",
      "--channel=chrome",
      "--viewport-size=1280,720",
      "--wait-for-timeout=4000",
      "--color-scheme=dark",
      `https://${host}`,
      png,
    ],
    { stdio: "inherit" }
  )
  execFileSync("cwebp", [
    "-quiet",
    "-q",
    "82",
    "-resize",
    String(WIDTH),
    "0",
    png,
    "-o",
    join(OUT_DIR, `${host}.webp`),
  ])
  console.log(`captured ${host}`)
}
