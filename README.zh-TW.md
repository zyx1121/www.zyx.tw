<!-- 翻譯自 README.md @ docs/readme-template-v2。只翻 "For AI agents" 以上的章節，英文版更新時一起改。 -->

<div align="center">

<h1>www.zyx.tw</h1>

<p><strong>zyx.tw 和它所有子網域的 app，放在同一個 Turborepo，共用一套設計系統。</strong></p>

[![CI](https://img.shields.io/github/actions/workflow/status/zyx1121/www.zyx.tw/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/zyx1121/www.zyx.tw/actions)
[![Live](https://img.shields.io/badge/live-zyx.tw-000000?style=flat-square)](https://zyx.tw)
[![License](https://img.shields.io/github/license/zyx1121/www.zyx.tw?style=flat-square)](LICENSE)

[English](README.md) | **繁體中文** | [简体中文](README.zh-CN.md)

</div>

```
zyx.tw          the site: a 3D home, works and a resume
link.zyx.tw     a URL shortener
time.zyx.tw     a clock
good.zyx.tw     a digital 乖乖, the snack that engineers tape onto servers
plump.zyx.tw    Plump: SVG, shaped and lit in 3D
ui.zyx.tw       the component registry that every app imports from
stamp.zyx.tw    the Stamp product site
1909            a private shared-expense dashboard for three flatmates
```

以前每開一個子網域，就要開一個新 repo，再複製一次同樣的 lint 設定、設計 token 和遙測設定。在這裡，一個新點子就是 `apps/` 底下的一個新資料夾。

## 功能

- **放 8 個 app**：同一個 repo、同一條 CI，各自部署到自己的子網域。
- **共用一套設計系統**：每個元件只在 `packages/ui` 存一份，所有 app 都從那裡引用。
- **強制設計規則**：app 偏離主題，或用了不是設計 token 的值，CI 就會失敗。
- **也給 agent 讀**：主站和 ui.zyx.tw 每一頁都有 Markdown 版本，另外有 `/llms.txt`、`/agent-instructions.md` 和 JSON-LD。
- **發布元件庫**：其他專案可以用 shadcn CLI 從 ui.zyx.tw 安裝元件。

## 快速開始

```sh
git clone https://github.com/zyx1121/www.zyx.tw && cd www.zyx.tw
bun install
cp apps/web/.env.example apps/web/.env.local
bun dev --filter=web
```

打開 http://localhost:3000，應該會看到 zyx.tw 首頁。

## 使用方式

| App | 資料夾 | 網址 |
|-----|--------|------|
| 主站 | `apps/web` | [zyx.tw](https://zyx.tw) |
| 短網址 | `apps/link` | [link.zyx.tw](https://link.zyx.tw) |
| 時鐘 | `apps/time` | [time.zyx.tw](https://time.zyx.tw) |
| 乖乖 | `apps/good` | [good.zyx.tw](https://good.zyx.tw) |
| Plump | `apps/3d` | [plump.zyx.tw](https://plump.zyx.tw) |
| 元件庫 | `apps/ui` | [ui.zyx.tw](https://ui.zyx.tw) |
| Stamp 官網 | `apps/stamp` | [stamp.zyx.tw](https://stamp.zyx.tw) |
| 分帳 | `apps/1909` | 不公開 |

- 只跑一個 app：`bun dev --filter=<資料夾名稱>`。`bun dev` 會全部一起跑。
- 在 app 裡引用元件：`import { Button } from "@workspace/ui/components/ui/button"`。
- 在其他專案使用這套設計系統：

  ```sh
  bunx shadcn@latest init https://ui.zyx.tw/r/base.json
  bunx shadcn@latest add @zyx1121/button @zyx1121/dialog
  ```


設計規則(主題、字級、版面、動態和文案)在 [apps/ui/DESIGN.md](apps/ui/DESIGN.md)。

## 設定

`apps/web` 和 `apps/link` 各有一份 `.env.example`。`apps/1909` 的變數列在[它的 README](apps/1909/README.md#environment-variables)。

`apps/web` 的 `GITHUB_TOKEN` 是選用的，需要有 `read:user` 權限的 fine-grained token。沒設的話，網站會隱藏貢獻熱力圖，事件列表照常顯示。

## 運作方式

| 層 | 選擇 |
|----|------|
| 框架 | Next.js 16(App Router、Turbopack) |
| 介面 | React 19、Tailwind CSS 4、Base UI、[ui.zyx.tw](https://ui.zyx.tw) 元件 |
| 語言 | TypeScript，strict 並開 `noUncheckedIndexedAccess` |
| 資料 | Supabase(`1909`、`link`) |
| 3D | three.js、React Three Fiber(`good`、`3d`) |
| 遙測 | `packages/otel` 把 log 送到 [sensorium](https://github.com/zyx1121/sensorium) |
| 工具 | Bun workspaces 和 Turborepo |

共用套件：`packages/ui`(設計系統)、`packages/3d`(Plump 的場景格式和渲染器)、`packages/agent`(agent kit)、`packages/otel`、`packages/eslint-config` 和 `packages/typescript-config`。

## 其他

給 AI agent 的結構化資訊與開發說明在[英文版](README.md#for-ai-agents)。

## 授權

[MIT](LICENSE)
