# 1909 Expense Dashboard Design

竹科潤隆 A 棟 19 樓之 9 — 三人合租帳務 Dashboard

## Overview

取代現有 Google Sheets 記帳方式。核心功能：記錄共同支出、自動三人均分、計算誰欠誰多少、標記核銷。

## Members

| Name   | Role     |
| ------ | -------- |
| 詹詠翔 | Roommate |
| 蔡雨恩 | Roommate |
| 邱彥銘 | Roommate |

## Auth

- Supabase Google OAuth (social auth via `@supabase/ssr`)
- 登入限制在 Supabase Dashboard Auth 設定層鎖定 3 個 email
- App 層不做白名單檢查
- Middleware 已設定：未登入導向 `/auth/login`

### Auth Flow

1. User visits `/` → middleware checks session → redirects to `/auth/login` if not logged in
2. User clicks Google login → Supabase OAuth → redirect to `/auth/callback`
3. `/auth/callback` exchanges code for session → redirect to `/`

## Database Schema

### `members` table

用於對應 auth user 和顯示名稱。

| Column     | Type        | Constraint              |
| ---------- | ----------- | ----------------------- |
| id         | uuid        | PK, FK → auth.users(id) |
| name       | text        | not null                |
| email      | text        | not null, unique        |
| created_at | timestamptz | default now()           |

RLS: authenticated users can select all members.

### `expenses` table

每筆紀錄 = 某人先墊付了一筆共同支出，自動均分三人。

| Column     | Type        | Constraint                    |
| ---------- | ----------- | ----------------------------- |
| id         | bigint      | PK, identity generated always |
| member_id  | uuid        | FK → members(id), not null    |
| title      | text        | not null                      |
| amount     | integer     | not null (NTD)                |
| settled    | boolean     | default false                 |
| created_at | timestamptz | default now()                 |

RLS:

- SELECT: authenticated can read all
- INSERT: authenticated can insert where `member_id = auth.uid()`
- UPDATE: authenticated can update `settled` column only

## Balance Calculation

從所有 `settled = false` 的紀錄即時計算：

```
每人淨餘額 = 自己墊付的未核銷總額 - (所有未核銷總額 / 3)
```

- 正數 = 別人欠你錢
- 負數 = 你欠別人錢

誰欠誰的呈現：從三人淨餘額推算配對債務關係。

## Pages

### `/auth/login`

- Google 登入按鈕
- 簡潔頁面

### `/auth/callback`

- Server-side route handler
- Exchange OAuth code for session
- Redirect to `/`

### `/` (Dashboard)

首頁，需登入。三個區塊：

1. **欠款摘要** — 頂部卡片，顯示三人之間的欠款關係（例：「詹詠翔 欠 蔡雨恩 $2,145」）
2. **新增支出** — 表單：項目名稱 + 金額。付款人自動填入當前登入者。送出後新增一筆 `settled = false` 的紀錄
3. **紀錄列表** — 所有支出紀錄，最新在上。顯示：日期、付款人、項目、金額、狀態。可點擊標記為已核銷

## Seed Data

匯入 Google Sheets 中所有「核銷」類型紀錄（排除「儲值」），共 25 筆。

最新兩筆標記 `settled = false`：

- 2026/3/28 蔡雨恩 垃圾袋 $75
- 2026/3/28 詹詠翔 電費 $4,317

其餘 23 筆標記 `settled = true`。

## Tech Stack

- Next.js 16 (App Router, RSC)
- Supabase (Auth, Database, SSR)
- shadcn/ui (radix-luma style)
- Tailwind CSS v4
- TypeScript

## Out of Scope

- 非均分支出
- 還款紀錄
- 通知功能
- 匯出功能
