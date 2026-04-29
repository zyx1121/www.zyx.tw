# Design Tokens

設計系統的「底層邏輯」— 所有顏色、字體、節奏的單一真相來源在 `globals.css` 的 `@theme`。這份是人類可讀對照表。

> Token = 設計決策的最小顆粒度。要新增/改規則，只動 token，不要在元件裡 hardcode。

---

## 🎨 Colors

純黑白為主，唯一的 saturated 色是 `--brand`，給品牌記憶點用（hover、focus、地圖 marker 邊框…等）。

### Light / Dark 雙模

| Token                | Light                       | Dark                        | 用途                                 |
| -------------------- | --------------------------- | --------------------------- | ------------------------------------ |
| `--background`       | `oklch(1 0 0)`              | `oklch(0.145 0 0)`          | 頁面底色                             |
| `--foreground`       | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | 主要文字                             |
| `--primary`          | `oklch(0.205 0 0)`          | `oklch(0.922 0 0)`          | 主要按鈕、強調區塊                   |
| `--secondary`        | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | 次要背景                             |
| `--muted-foreground` | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`          | 副標、次要文字（**用最多**）         |
| `--accent`           | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | hover / focus 灰底（**不是**品牌色） |
| `--border`           | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`        | 邊框                                 |
| `--ring`             | `oklch(0.708 0 0)`          | `oklch(0.556 0 0)`          | focus ring                           |
| `--brand`            | `oklch(0.6745 0.1822 230)`  | `oklch(0.78 0.14 230)`      | **品牌色（cyan-blue）**              |
| `--destructive`      | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | 錯誤、刪除                           |

### Tailwind class 對應

```
bg-background      bg-foreground       text-muted-foreground
bg-primary         text-primary-foreground
bg-brand           text-brand-foreground   border-brand
hover:text-brand   focus:ring-brand
```

> ⚠️ **不要直接寫 `text-blue-500` 之類的 Tailwind palette**。要用就走 token，否則 dark mode 會破。

---

## ✏️ Typography

**Mono-first** — 全站走 monospace，body / heading / 按鈕 / footer 一致。Sans 留作未來擴充用，不主動使用。

| Token         | Value      | 用途                              |
| ------------- | ---------- | --------------------------------- |
| `--font-mono` | Geist Mono | **預設**（body 已套 `font-mono`） |
| `--font-sans` | Geist Sans | 備援，需要時手動 `font-sans`      |

實際字體 instance 在 `apps/web/app/layout.tsx` 用 `next/font/google` 載入。

### Tailwind class

```
font-mono   font-sans
```

### 文字尺寸（mono 配大字會太搶眼，全部降一檔）

| 用途                      | Class                                        |
| ------------------------- | -------------------------------------------- |
| Section heading (h1 / h2) | `text-3xl md:text-4xl font-bold`             |
| Body / paragraph          | `text-lg md:text-xl text-muted-foreground`   |
| Marquee / 列表項          | `text-base md:text-lg text-muted-foreground` |
| Header / Footer corner    | `text-sm text-muted-foreground`              |

---

## 📐 Radius

| Token                           | Value             | 用途                                      |
| ------------------------------- | ----------------- | ----------------------------------------- |
| `--radius`                      | `0.625rem` (10px) | base，所有 radius 都從這算                |
| `--radius-sm`                   | `radius * 0.6`    | inputs / 小元件                           |
| `--radius-md`                   | `radius * 0.8`    | cards                                     |
| `--radius-lg`                   | `radius`          | dialog / popover                          |
| `--radius-xl`                   | `radius * 1.4`    | hero card                                 |
| `--radius-2xl` ~ `--radius-4xl` | 1.8 / 2.2 / 2.6   | 大 surface                                |
| `--radius-marker`               | `33%`             | 地圖照片 marker（特例，圓角矩形不是正圓） |

### Tailwind class

```
rounded-sm   rounded-md   rounded-lg   rounded-xl   rounded-2xl   rounded-marker
```

---

## 🎬 Motion

| Token             | Value                            | 用途                               |
| ----------------- | -------------------------------- | ---------------------------------- |
| `--duration-fast` | `80ms`                           | popup snap、micro-feedback         |
| `--duration-base` | `200ms`                          | 一般 hover、scale、menu open/close |
| `--duration-slow` | `400ms`                          | scroll-driven、blur fade           |
| `--ease-glide`    | `cubic-bezier(0.22, 1, 0.36, 1)` | 自然減速曲線（出場用）             |

### Tailwind class

```
duration-fast   duration-base   duration-slow
ease-glide
```

### 規則

- **micro-interaction** → `duration-fast`
- **元件層動畫**（hover、scale、color shift、menu）→ `duration-base`
- **大區塊過渡**（blur、opacity scroll fade）→ `duration-slow`
- 緩動曲線預設用 `ease-glide`，少用 `ease-linear`（線性會太機械）

### 自訂動畫

| Token               | Value                         |
| ------------------- | ----------------------------- |
| `--animate-marquee` | `marquee 60s linear infinite` |

`@keyframes marquee` 定義在 `@theme` 內，搭 `Stack` 元件的跑馬燈。新增動畫請集中加在這裡，不要散落各元件。

---

## 🧭 Layout — Four Corners

頁面外殼採 4 corner 架構，由 `Header` + `Footer` 兩個元件共同組成：

| 位置 | 元件                      | 內容                                          |
| ---- | ------------------------- | --------------------------------------------- |
| 左上 | `Header` 內的 `<Link>`    | `ZYX` — logo / home link                      |
| 右上 | `<Menu>` (in Header)      | `MENU` 點擊展開導覽（目前只有 `MAP`）         |
| 左下 | `<DaysAlive>` (in Footer) | 純數字 — 從 `NEXT_PUBLIC_BIRTHDAY` 算起的天數 |
| 右下 | `Footer` 內的 `<span>`    | `© 2026` — 寫死，不依年份變動                 |

四個 corner 全部 `fixed inset-{n}-4 z-50`，font-mono text-sm，hover 由 muted → foreground。

---

## 🗺️ Mapbox popup

舊 zyx 的全螢幕照片 lightbox CSS 收在 globals.css 底部，class 名稱：

```
.map-fullscreen-popup
.map-fullscreen-popup-visible
.map-fullscreen-popup-content
.map-fullscreen-popup-img
```

由 `mapbox-map.tsx` 的 `createMarkerWithPopup` 動態加 class 觸發 transition。**不要在 React 裡重新發明這套**，沿用即可。

---

## 新增 token 的流程

1. 加到 `globals.css` 的 `:root` 與 `.dark`（如果是顏色，兩邊都要）
2. 在 `@theme inline` expose 對應 `--color-*` / `--font-*` / `--radius-*` / `--duration-*`
3. 補進這份 `tokens.md`
4. 元件改用 token，不要 hardcode

> 三步閉環：定義 → expose → 文件化。任何一步漏掉都會在未來變成技術債。
