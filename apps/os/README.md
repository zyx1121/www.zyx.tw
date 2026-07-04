```
 ██████╗ ███████╗
██╔═══██╗██╔════╝
██║   ██║███████╗
██║   ██║╚════██║
╚██████╔╝███████║
 ╚═════╝ ╚══════╝
```

# os

os.zyx.tw — a Windows 98 desktop, rebuilt in the browser to study window
chrome, form controls, pixel icons, and taskbar interaction.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (CSS-first) + shadcn/ui structure, fully
  reskinned for Win98 chrome
- **Behavior**: `radix-ui` primitives (Tabs / Checkbox / RadioGroup /
  Slider / Progress / Select) — visuals are hand-rolled, no headless-UI
  defaults survive
- **Package Manager**: Bun

## Getting Started

```bash
bun install
bun dev
```

## What's in the POC

- Teal desktop with pixel-art icons (hand-drawn, no Microsoft assets —
  see `components/pixel-icon.tsx`)
- Draggable windows with Win98 chrome (gradient title bar, minimize /
  maximize / close, click-to-focus z-order)
- Taskbar with Start button, start menu, per-window buttons, and a live
  clock
- Three demo apps: 控制台 (control panel — full form-control gallery),
  記事本 (notepad), 關於 (about)

## Fonts

`public/fonts/ms_sans_serif.woff2` and `ms_sans_serif_bold.woff2` are the
MIT-licensed "Pixelated MS Sans Serif" webfont from
[jdan/98.css](https://github.com/jdan/98.css) (MIT license).

## License

[MIT](LICENSE.md)
