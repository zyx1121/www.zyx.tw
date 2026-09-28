# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "pillow>=11,<13",
#   "playwright==1.63.0",
# ]
# ///
"""Regenerates the project previews in apps/web/public/previews/.

Reads lib/projects.json, the same list /works renders, and writes two
files per project to the paths in its "preview" field:

  <slug>.webp         a 1440x900 screenshot of the live site in dark mode
  <slug>-dither.webp  the same image dithered with a 4x4 Bayer matrix in muted
                      gray on black, which the preview stage shows at rest

Projects whose href is a GitHub repository have no live site. They use the
repository's OpenGraph card instead, downloaded so it can be dithered too.

Requirements
  uv            https://docs.astral.sh/uv/ . `bun run previews` runs this
                file with `uv run`, which installs Pillow and Playwright for
                Python from the header above into a cached environment. No
                npm packages are involved.
  Chromium      the build Playwright 1.63 expects (revision 1243). Either run
                `uv run --with playwright==1.63.0 playwright install chromium`
                once, or set PREVIEWS_CHROMIUM to a chrome binary, for example
                ~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome.
  Network       the live sites, or local builds passed with --url.

Usage (from apps/web)
  bun run previews                       capture every project from production
  bun run previews --only good,3d        capture some of them
  bun run previews --url good=http://localhost:3101
                                         capture a project from a local build
  bun run previews --dither-only         re-dither the committed screenshots
  bun run previews --compare good --out /tmp/dither
                                         also write Floyd-Steinberg and
                                         side-by-side comparison images
"""

from __future__ import annotations

import argparse
import io
import json
import math
import os
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "lib" / "projects.json"
PUBLIC = ROOT / "public"

VIEWPORT = {"width": 1440, "height": 900}
# The dark theme's --muted-foreground, oklch(0.65 0 0), is #8f8f8f in sRGB.
INK = (143, 143, 143)
PAPER = (0, 0, 0)
# One dither dot covers CELL x CELL screenshot pixels, so the pattern stays
# visible when the stage shows the image at half size or less.
CELL = 3
# White becomes 75% dots rather than solid gray, so light pages read as a dot
# field like the rest instead of a flat slab. Black stays black.
COVERAGE = 0.75
COLOR_QUALITY = 82

# The classic recursive Bayer index matrices; threshold = (index + 0.5) / n^2.
BAYER_4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
]


def bayer(n: int) -> list[list[int]]:
    if n == 4:
        return BAYER_4
    if n < 4 or n & (n - 1):
        raise ValueError("Bayer size must be a power of two, 4 or more")
    half = bayer(n // 2)
    size = n // 2
    return [
        [
            4 * half[y % size][x % size]
            + [[0, 2], [3, 1]][y // size][x // size]
            for x in range(n)
        ]
        for y in range(n)
    ]


def luminance_cells(image: Image.Image, cell: int) -> Image.Image:
    """Grayscale, averaged over cell x cell blocks and scaled by COVERAGE."""
    gray = ImageOps.grayscale(image.convert("RGB"))
    width, height = gray.size
    small = gray.resize(
        (math.ceil(width / cell), math.ceil(height / cell)),
        Image.Resampling.BOX,
    )
    return small.point(lambda value: round(value * COVERAGE))


def two_tone(bits: bytearray, size: tuple[int, int], cell: int, full: tuple[int, int]) -> Image.Image:
    """Scales a 0/1 dot map back up to the full size in INK on PAPER."""
    dots = Image.frombytes("P", size, bytes(bits))
    dots.putpalette([*PAPER, *INK])
    width, height = full
    big = dots.resize((size[0] * cell, size[1] * cell), Image.Resampling.NEAREST)
    return big.crop((0, 0, width, height)).convert("RGB")


def dither_ordered(image: Image.Image, cell: int = CELL, n: int = 4) -> Image.Image:
    small = luminance_cells(image, cell)
    width, height = small.size
    matrix = bayer(n)
    levels = n * n
    thresholds = [[(value + 0.5) / levels * 255 for value in row] for row in matrix]
    data = small.tobytes()
    bits = bytearray(width * height)
    for y in range(height):
        row = thresholds[y % n]
        base = y * width
        for x in range(width):
            bits[base + x] = 1 if data[base + x] > row[x % n] else 0
    return two_tone(bits, (width, height), cell, image.size)


def dither_floyd_steinberg(image: Image.Image, cell: int = CELL) -> Image.Image:
    small = luminance_cells(image, cell)
    width, height = small.size
    values = [float(v) for v in small.tobytes()]
    bits = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            i = y * width + x
            old = values[i]
            on = old > 127.5
            bits[i] = 1 if on else 0
            error = old - (255.0 if on else 0.0)
            if x + 1 < width:
                values[i + 1] += error * 7 / 16
            if y + 1 < height:
                if x > 0:
                    values[i + width - 1] += error * 3 / 16
                values[i + width] += error * 5 / 16
                if x + 1 < width:
                    values[i + width + 1] += error * 1 / 16
    return two_tone(bits, (width, height), cell, image.size)


def github_og(href: str) -> Image.Image:
    owner, repo = urlparse(href).path.strip("/").split("/")[:2]
    url = f"https://opengraph.githubassets.com/1/{owner}/{repo}"
    request = urllib.request.Request(url, headers={"User-Agent": "zyx.tw previews"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return Image.open(io.BytesIO(response.read())).convert("RGB")


def is_github(href: str) -> bool:
    return urlparse(href).hostname == "github.com"


class Browser:
    """One Chromium for every capture, started on first use."""

    def __init__(self, wait_ms: int):
        self.wait_ms = wait_ms
        self._playwright = None
        self._browser = None

    def capture(self, url: str) -> Image.Image:
        from playwright.sync_api import TimeoutError as PlaywrightTimeout

        if self._browser is None:
            from playwright.sync_api import sync_playwright

            self._playwright = sync_playwright().start()
            executable = os.environ.get("PREVIEWS_CHROMIUM")
            self._browser = self._playwright.chromium.launch(
                executable_path=os.path.expanduser(executable) if executable else None,
                # WebGL scenes (good, 3d) render on the CPU when there is no GPU.
                args=["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
            )
        context = self._browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=1,
            color_scheme="dark",
            # Entrance animations end at once, so the shot shows the settled page.
            reduced_motion="reduce",
        )
        page = context.new_page()
        try:
            page.goto(url, wait_until="load", timeout=60_000)
            # A page that holds a request open (a streamed response, a poll)
            # never goes idle; after 15 s the capture goes ahead from load.
            try:
                page.wait_for_load_state("networkidle", timeout=15_000)
            except PlaywrightTimeout:
                pass
            page.evaluate("document.fonts.ready.then(() => true)")
            page.wait_for_timeout(self.wait_ms)
            return Image.open(io.BytesIO(page.screenshot(type="png"))).convert("RGB")
        finally:
            context.close()

    def close(self):
        if self._browser is not None:
            self._browser.close()
            self._playwright.stop()


def public_path(site_path: str) -> Path:
    return PUBLIC / site_path.lstrip("/")


def kib(path: Path) -> str:
    return f"{path.stat().st_size / 1024:.1f} KiB"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--only", help="comma-separated slugs")
    parser.add_argument(
        "--url",
        action="append",
        default=[],
        metavar="SLUG=URL",
        help="capture SLUG from URL instead of its href (repeatable)",
    )
    parser.add_argument(
        "--dither-only",
        action="store_true",
        help="skip capturing, re-dither the existing color images",
    )
    parser.add_argument("--compare", metavar="SLUG", help="write a dither comparison for SLUG")
    parser.add_argument("--out", type=Path, help="directory for --compare output")
    parser.add_argument("--wait", type=int, default=4000, help="ms to wait after load")
    args = parser.parse_args()

    projects = json.loads(PROJECTS.read_text())
    overrides = dict(item.split("=", 1) for item in args.url)
    only = set(args.only.split(",")) if args.only else None
    unknown = (only or set()) | set(overrides) | ({args.compare} if args.compare else set())
    unknown -= {project["slug"] for project in projects}
    if unknown:
        parser.error(f"unknown slug(s): {', '.join(sorted(unknown))}")

    browser = Browser(args.wait)
    try:
        for project in projects:
            slug = project["slug"]
            if only and slug not in only:
                continue
            color_path = public_path(project["preview"]["image"])
            dither_path = public_path(project["preview"]["dither"])
            color_path.parent.mkdir(parents=True, exist_ok=True)

            if args.dither_only:
                color = Image.open(color_path).convert("RGB")
                source = "existing"
            elif slug in overrides:
                color = browser.capture(overrides[slug])
                source = overrides[slug]
            elif is_github(project["href"]):
                color = github_og(project["href"])
                source = "GitHub OpenGraph card"
            else:
                color = browser.capture(project["href"])
                source = project["href"]

            if not args.dither_only:
                color.save(color_path, "WEBP", quality=COLOR_QUALITY, method=6)
            dither_ordered(color).save(dither_path, "WEBP", lossless=True, method=6)
            print(
                f"{slug:12} {source}\n"
                f"{'':12} {color_path.name} {kib(color_path)}, "
                f"{dither_path.name} {kib(dither_path)}"
            )

            if args.compare == slug:
                out = args.out or Path.cwd()
                out.mkdir(parents=True, exist_ok=True)
                write_comparison(color, slug, out)
    finally:
        browser.close()
    return 0


def write_comparison(color: Image.Image, slug: str, out: Path) -> None:
    """Bayer 4x4, Bayer 8x8 and Floyd-Steinberg side by side, full size and cropped."""
    variants = {
        "bayer4": dither_ordered(color, n=4),
        "bayer8": dither_ordered(color, n=8),
        "floyd-steinberg": dither_floyd_steinberg(color),
    }
    for name, image in variants.items():
        path = out / f"{slug}-{name}.webp"
        image.save(path, "WEBP", lossless=True, method=6)
        print(f"{'':12} compare {path} {kib(path)}")

    # A strip of each at the stage's desktop scale (728 px wide), plus a
    # 1:1 crop of the top left so the dot pattern itself is visible.
    width = 728
    scaled_height = round(color.height * width / color.width)
    crop = (0, 0, 360, 180)
    panels = [("color", color), *variants.items()]
    label_height = 24
    sheet = Image.new(
        "RGB",
        (width + 20 + crop[2] * 2, len(panels) * (scaled_height + label_height + 20)),
        (24, 24, 24),
    )
    draw = ImageDraw.Draw(sheet)
    y = 0
    for name, image in panels:
        draw.text((4, y + 4), name, fill=(230, 230, 230))
        y += label_height
        sheet.paste(image.resize((width, scaled_height), Image.Resampling.LANCZOS), (0, y))
        sheet.paste(
            image.crop(crop).resize((crop[2] * 2, crop[3] * 2), Image.Resampling.NEAREST),
            (width + 20, y),
        )
        y += scaled_height + 20
    path = out / f"{slug}-comparison.png"
    sheet.save(path)
    print(f"{'':12} compare {path}")


if __name__ == "__main__":
    sys.exit(main())
