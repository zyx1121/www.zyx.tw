```
 ██████╗ ███████╗
██╔═══██╗██╔════╝
██║   ██║███████╗
██║   ██║╚════██║
╚██████╔╝███████║
 ╚═════╝ ╚══════╝
```

# os

os.zyx.tw — a Windows 98 desktop OS, rebuilt in the browser: a real
in-memory filesystem persisted to IndexedDB, a process table + window
manager, system dialogs, a file explorer, and boot/shutdown chrome, all
running as static Next.js output with zero backend.

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

## Architecture

```
userland   components/apps/<id>/{manifest.tsx, <id>.tsx}
              │  SDK hooks (lib/os/sdk/)
              │  useProcess · useWindow · useFs · useDialogs · useSystem
kernel     lib/os/kernel/ (context + reducer, no external state library)
              ProcessTable · WindowManager · VFS · DialogManager
persist    IndexedDB (debounced snapshot, hydrated on boot)
```

A new app is just a manifest + a component that only talks to the OS
through the SDK hooks above — windows, processes, the filesystem, and
system dialogs are all supplied by the kernel. See `docs/DESIGN.md` for
the full contract and `docs/APP-SPEC.md` for the step-by-step guide (the
小算盤/calculator app was added from scratch following exactly this
process, as a fitness test for the spec).

## What's in the OS

- Win98 boot screen on every load, and a start-menu 關機... flow ending in
  the classic black-screen-orange-text shutdown notice (click/any key to
  reboot)
- A real virtual filesystem (`lib/os/kernel/fs.ts`) under `C:/`, persisted
  to IndexedDB — the desktop, My Documents, and the recycle bin are all
  live views of it, and files survive a reload
- 檔案總管 (Explorer): tree + list view, address bar, right-click
  new/rename/delete, recycle bin restore/permanent-delete
- System dialogs (message boxes, open/save file pickers) rendered as real
  Win98 modals, not `window.alert`
- Original Windows 98 icons (© Microsoft, sourced from
  win98icons.alexmeub.com for personal, non-commercial nostalgia use —
  see `components/pixel-icon.tsx`)
- Draggable, resizable windows with Win98 chrome (gradient title bar,
  minimize / maximize / close, click-to-focus z-order, Alt+F4)
- Taskbar with Start button, start menu, per-window buttons (with a
  right-click restore/minimize/maximize/close menu), and a live clock
- Seven apps: 檔案總管 (explorer, also serves 我的電腦/我的文件), 記事本
  (notepad), 控制台 (control panel — full form-control gallery), 小算盤
  (calculator), 工作管理員 (task manager), 資源回收筒 (recycle bin), 關於
  (about)

## Fonts

`public/fonts/ms_sans_serif.woff2` and `ms_sans_serif_bold.woff2` are the
MIT-licensed "Pixelated MS Sans Serif" webfont from
[jdan/98.css](https://github.com/jdan/98.css) (MIT license).

## License

[MIT](LICENSE.md)
