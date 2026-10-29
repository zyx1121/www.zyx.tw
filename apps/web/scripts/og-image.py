# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "playwright==1.63.0",
# ]
# ///
"""Regenerates app/opengraph-image.png, the card a shared link shows.

The card is the home itself at 1200x630 in dark mode: the mark in
characters over the pond, without the corners. The mark is drawn by three.js
on the client, so the card is a screenshot of a running site rather than a
next/og render.

Requirements
  uv            `bun run og` runs this file with `uv run`.
  Chromium      the build Playwright 1.63 expects, or set PREVIEWS_CHROMIUM
                to a chrome binary (see scripts/previews.py).

Usage (from apps/web)
  bun run og                             capture https://www.zyx.tw
  bun run og --url http://localhost:3410 capture a local build
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "opengraph-image.png"
SIZE = {"width": 1200, "height": 630}
# The mark decodes in over about 2 seconds after three.js loads.
SETTLE_MS = 5000


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="https://www.zyx.tw")
    args = parser.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=os.environ.get("PREVIEWS_CHROMIUM") or None,
            args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        page = browser.new_page(viewport=SIZE, color_scheme="dark")
        page.goto(args.url, wait_until="load")
        page.add_style_tag(
            content="header, footer { visibility: hidden }"
        )
        page.wait_for_timeout(SETTLE_MS)
        page.screenshot(path=OUT)
        browser.close()
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
