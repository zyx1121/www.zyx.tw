# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "playwright==1.63.0",
# ]
# ///
"""Regenerates the share cards in public/og/, the GIFs a shared link shows.

Each card is the home itself, recorded in dark mode without the corners: the
mark decodes in, sways, and the koi swim around it. The mark is drawn by
three.js on the client, so a card is a recording of a running site rather
than a next/og render. The pond is brightened so the fish read at thumbnail
size. The koi start in random places, so every recording differs, and
/og.gif (app/og.gif/route.ts) sends each request to one of them at random.

Look at the cards before you commit them, and record again if the koi stay
off screen. lib/og.json records how many there are.

Requirements
  uv            `bun run og` runs this file with `uv run`.
  Chromium      the build Playwright 1.63 expects, or set PREVIEWS_CHROMIUM
                to a chrome binary (see scripts/previews.py).
  ffmpeg        on PATH, to turn each recording into a GIF.

Usage (from apps/web)
  bun run og                             record 6 cards from https://www.zyx.tw
  bun run og --count 3 --url http://localhost:3410
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og"
MANIFEST = ROOT / "lib" / "og.json"
VIEWPORT = {"width": 1200, "height": 630}
# The card's size: 800 wide keeps 15 seconds near 3 MB, under X's 5 MB.
WIDTH = 800
FPS = 12
# The clip starts just before the mark decodes in, about 2 seconds after
# load, and runs long enough for the koi to come round.
START_S = 1.8
LENGTH_S = 15
# The pond is dimmed to stay a backdrop on the site; the card wants it bright.
STYLE = (
    "header, footer { visibility: hidden }"
    " canvas.pointer-events-none { filter: brightness(1.8) }"
)
GIF_FILTER = (
    f"fps={FPS},scale={WIDTH}:-1:flags=lanczos,split[a][b];"
    "[a]palettegen=max_colors=64:stats_mode=diff[p];"
    "[b][p]paletteuse=dither=none:diff_mode=rectangle"
)


def record(browser, url: str, folder: Path) -> Path:
    context = browser.new_context(
        viewport=VIEWPORT,
        color_scheme="dark",
        record_video_dir=str(folder),
        record_video_size=VIEWPORT,
    )
    page = context.new_page()
    page.goto(url, wait_until="load")
    page.add_style_tag(content=STYLE)
    page.wait_for_timeout((START_S + LENGTH_S + 1) * 1000)
    video = Path(page.video.path())
    context.close()
    return video


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="https://www.zyx.tw")
    parser.add_argument("--count", type=int, default=6)
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.gif"):
        old.unlink()
    with tempfile.TemporaryDirectory() as tmp, sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=os.environ.get("PREVIEWS_CHROMIUM") or None,
            args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        for index in range(args.count):
            video = record(browser, args.url, Path(tmp))
            gif = OUT / f"{index}.gif"
            subprocess.run(
                ["ffmpeg", "-loglevel", "error", "-y", "-ss", str(START_S),
                 "-t", str(LENGTH_S), "-i", str(video), "-vf", GIF_FILTER,
                 str(gif)],
                check=True,
            )
            print(f"wrote {gif.relative_to(ROOT)} ({gif.stat().st_size / 1e6:.1f} MB)")
        browser.close()
    MANIFEST.write_text(json.dumps({"count": args.count}) + "\n")


if __name__ == "__main__":
    main()
