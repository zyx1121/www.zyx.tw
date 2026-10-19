<!-- 翻译自 README.md @ docs/readme-template-v2。只翻译 "For AI agents" 之前的章节，英文版更新时一起改。 -->

<div align="center">

<h1>www.zyx.tw</h1>

<p><strong>zyx.tw 和它所有子域名的应用，放在同一个 Turborepo，共用一套设计系统。</strong></p>

[![CI](https://img.shields.io/github/actions/workflow/status/zyx1121/www.zyx.tw/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/zyx1121/www.zyx.tw/actions)
[![Live](https://img.shields.io/badge/live-zyx.tw-000000?style=flat-square)](https://zyx.tw)
[![License](https://img.shields.io/github/license/zyx1121/www.zyx.tw?style=flat-square)](LICENSE)

[English](README.md) | [繁體中文](README.zh-TW.md) | **简体中文**

</div>

```
zyx.tw          the site: a 3D home, works and a resume
link.zyx.tw     a URL shortener
time.zyx.tw     a clock
good.zyx.tw     a digital 乖乖, the snack that engineers tape onto servers
plump.zyx.tw    Plump: SVG, shaped and lit in 3D
ui.zyx.tw       the component registry that every app imports from
1909            a private shared-expense dashboard for three flatmates
```

以前每开一个子域名，就要开一个新 repo，再复制一次同样的 lint 配置、设计 token 和遥测配置。在这里，一个新点子就是 `apps/` 下的一个新文件夹。

## 功能

- **放 7 个应用**：同一个 repo、同一条 CI，各自部署到自己的子域名。
- **共用一套设计系统**：每个组件只在 `packages/ui` 存一份，所有应用都从那里引用。
- **强制设计规则**：应用偏离主题，或用了不是设计 token 的值，CI 就会失败。
- **也给 agent 读**：主站和 ui.zyx.tw 每一页都有 Markdown 版本，另外有 `/llms.txt`、`/agent-instructions.md` 和 JSON-LD。
- **发布组件库**：其他项目可以用 shadcn CLI 从 ui.zyx.tw 安装组件。

## 快速开始

```sh
git clone https://github.com/zyx1121/www.zyx.tw && cd www.zyx.tw
bun install
cp apps/web/.env.example apps/web/.env.local
bun dev --filter=web
```

打开 http://localhost:3000，应该会看到 zyx.tw 首页。

## 使用方法

| 应用 | 文件夹 | 地址 |
|------|--------|------|
| 主站 | `apps/web` | [zyx.tw](https://zyx.tw) |
| 短链接 | `apps/link` | [link.zyx.tw](https://link.zyx.tw) |
| 时钟 | `apps/time` | [time.zyx.tw](https://time.zyx.tw) |
| 乖乖 | `apps/good` | [good.zyx.tw](https://good.zyx.tw) |
| Plump | `apps/3d` | [plump.zyx.tw](https://plump.zyx.tw) |
| 组件库 | `apps/ui` | [ui.zyx.tw](https://ui.zyx.tw) |
| 分账 | `apps/1909` | 不公开 |

- 只运行一个应用：`bun dev --filter=<文件夹名称>`。`bun dev` 会全部一起运行。
- 在应用里引用组件：`import { Button } from "@workspace/ui/components/ui/button"`。
- 在其他项目使用这套设计系统：

  ```sh
  bunx shadcn@latest init https://ui.zyx.tw/r/base.json
  bunx shadcn@latest add @zyx1121/button @zyx1121/dialog
  ```


设计规则(主题、字号、版面、动效和文案)在 [apps/ui/DESIGN.md](apps/ui/DESIGN.md)。

## 配置

`apps/web` 和 `apps/link` 各有一份 `.env.example`。`apps/1909` 的变量列在[它的 README](apps/1909/README.md#environment-variables)。

`apps/web` 的 `GITHUB_TOKEN` 是可选的，需要有 `read:user` 权限的 fine-grained token。没设置的话，网站会隐藏贡献热力图，事件列表照常显示。

## 工作原理

| 层 | 选择 |
|----|------|
| 框架 | Next.js 16(App Router、Turbopack) |
| 界面 | React 19、Tailwind CSS 4、Base UI、[ui.zyx.tw](https://ui.zyx.tw) 组件 |
| 语言 | TypeScript，strict 并开启 `noUncheckedIndexedAccess` |
| 数据 | Supabase(`1909`、`link`) |
| 3D | three.js、React Three Fiber(`good`、`3d`) |
| 遥测 | `packages/otel` 把日志发送到 [sensorium](https://github.com/zyx1121/sensorium) |
| 工具 | Bun workspaces 和 Turborepo |

共用包：`packages/ui`(设计系统)、`packages/3d`(Plump 的场景格式和渲染器)、`packages/agent`(agent kit)、`packages/otel`、`packages/eslint-config` 和 `packages/typescript-config`。

## 其他

给 AI agent 的结构化信息与开发说明见[英文版](README.md#for-ai-agents)。

## 许可证

[MIT](LICENSE)
