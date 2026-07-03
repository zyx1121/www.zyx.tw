# Expense Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared expense tracking dashboard for 3 roommates with Google login, expense recording, and balance calculation.

**Architecture:** Next.js 16 App Router with Supabase (Auth + Postgres). Server Components for data fetching, Server Actions for mutations. Single-page dashboard at `/` with auth pages at `/auth/*`. Balance calculation done server-side from unsettled expense records.

**Tech Stack:** Next.js 16, Supabase SSR, shadcn/ui (radix-luma), Tailwind CSS v4, TypeScript

**Supabase Project ID:** `dihyfbrzenbdofgrqfli`

---

## File Structure

```
middleware.ts                    (create) Root middleware, auth guard
app/
  layout.tsx                     (modify) Add metadata
  page.tsx                       (rewrite) Dashboard page
  auth/
    login/
      page.tsx                   (create) Google login page
    callback/
      route.ts                   (create) OAuth callback handler
  actions.ts                     (create) Server actions: addExpense, toggleSettle, signOut
lib/
  types.ts                       (create) Member, Expense types
  calc.ts                        (create) Balance calculation logic
  calc.test.ts                   (create) Tests for balance calculation
components/
  balance-summary.tsx            (create) Debt summary cards
  expense-form.tsx               (create) Add expense form
  expense-list.tsx               (create) Expense record list
  user-nav.tsx                   (create) User info + signout
supabase/
  migrations/
    20260406120000_create_tables.sql  (create) Schema migration
    20260406120001_seed_data.sql      (create) Seed data
```

---

### Task 1: DB Schema Migration

**Files:**

- Create: `supabase/migrations/20260406120000_create_tables.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Migration: Create members and expenses tables for shared expense tracking
-- Affected tables: members, expenses
-- Special: RLS enabled on both tables, helper function for current member lookup

-- Members table: maps auth users to display names
create table public.members (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

comment on table public.members is 'Roommates of 1909. Maps auth users to display names via email.';

alter table public.members enable row level security;

create policy "Authenticated users can view all members"
on public.members
for select
to authenticated
using (true);

-- Expenses table: each record is a shared expense paid by one member, split equally
create table public.expenses (
  id bigint generated always as identity primary key,
  member_id bigint not null references public.members(id),
  title text not null,
  amount integer not null,
  settled boolean default false,
  created_at timestamptz default now()
);

comment on table public.expenses is 'Shared household expenses. Each expense is split equally among all members.';

alter table public.expenses enable row level security;

create index idx_expenses_member_id on public.expenses using btree (member_id);
create index idx_expenses_settled on public.expenses using btree (settled);

create policy "Authenticated users can view all expenses"
on public.expenses
for select
to authenticated
using (true);

create policy "Members can insert their own expenses"
on public.expenses
for insert
to authenticated
with check (
  member_id = (
    select members.id
    from public.members
    where members.email = (select auth.jwt() ->> 'email')
  )
);

create policy "Authenticated users can update expenses"
on public.expenses
for update
to authenticated
using (true)
with check (true);
```

Write this file to `supabase/migrations/20260406120000_create_tables.sql`.

- [ ] **Step 2: Apply migration via Supabase MCP**

Run: `mcp__plugin_supabase_supabase__apply_migration` with project_id `dihyfbrzenbdofgrqfli` and the SQL above.

- [ ] **Step 3: Verify tables exist**

Run: `mcp__plugin_supabase_supabase__list_tables` with project_id `dihyfbrzenbdofgrqfli`, schemas `["public"]`, verbose `true`.

Expected: Both `members` and `expenses` tables visible with correct columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260406120000_create_tables.sql
git commit -m "feat: add members and expenses tables with RLS"
```

---

### Task 2: Seed Historical Data

**Files:**

- Create: `supabase/migrations/20260406120001_seed_data.sql`

- [ ] **Step 1: Create seed migration file**

⚠️ **IMPORTANT:** Replace the three email placeholders below with the actual Gmail addresses of the three roommates before applying.

```sql
-- Seed: Import historical expense data from Google Sheets
-- All "儲值" records excluded. Latest 2 expenses are unsettled.

-- Insert members (replace emails with actual values)
insert into public.members (name, email) values
  ('詹詠翔', 'REPLACE_WITH_ACTUAL_EMAIL_1'),
  ('蔡雨恩', 'REPLACE_WITH_ACTUAL_EMAIL_2'),
  ('邱彥銘', 'REPLACE_WITH_ACTUAL_EMAIL_3');

-- Insert historical expenses
-- member_id references: 1=詹詠翔, 2=蔡雨恩, 3=邱彥銘
insert into public.expenses (member_id, title, amount, settled, created_at) values
  (1, '衛生紙', 799, true, '2025-06-27T15:07:31+08:00'),
  (2, '洗碗精+保鮮膜+菜瓜布+廚房紙巾', 211, true, '2025-06-27T15:08:20+08:00'),
  (2, 'ikea用品', 1581, true, '2025-06-27T15:08:58+08:00'),
  (2, '網路費兩年', 8900, true, '2025-06-30T20:26:09+08:00'),
  (1, '管理費', 8061, true, '2025-07-01T22:58:30+08:00'),
  (2, '濾水器濾芯', 3500, true, '2025-07-11T19:44:23+08:00'),
  (2, '水費', 192, true, '2025-07-11T19:44:38+08:00'),
  (2, '電費', 2099, true, '2025-08-02T12:39:05+08:00'),
  (2, '水費', 417, true, '2025-09-03T21:16:30+08:00'),
  (2, '保鮮膜', 169, true, '2025-09-11T17:19:59+08:00'),
  (2, '菜瓜布（放洗手台下面）', 60, true, '2025-09-11T17:41:05+08:00'),
  (2, '114年七月到九月電費', 8227, true, '2025-09-20T12:49:41+08:00'),
  (3, '管理費', 8061, true, '2025-10-08T10:53:12+08:00'),
  (2, '衛生紙一箱', 739, true, '2025-10-12T21:19:42+08:00'),
  (2, '水費', 442, true, '2025-10-31T16:31:08+08:00'),
  (2, '1140909到1141110電費', 5258, true, '2025-11-25T11:53:35+08:00'),
  (2, '洗碗精', 65, true, '2025-12-22T20:12:49+08:00'),
  (2, '10到12月水費', 442, true, '2026-01-03T19:25:16+08:00'),
  (3, '管理費', 8589, true, '2026-01-14T15:10:42+08:00'),
  (2, '11月到1月的電費', 4054, true, '2026-01-21T00:57:19+08:00'),
  (2, '衛生紙', 799, true, '2026-02-05T19:14:01+08:00'),
  (3, '12月到2月水費', 459, true, '2026-02-27T21:49:25+08:00'),
  (2, '垃圾袋', 75, false, '2026-03-28T11:06:02+08:00'),
  (1, '電費', 4317, false, '2026-03-28T13:12:59+08:00');
```

Write this file to `supabase/migrations/20260406120001_seed_data.sql`.

- [ ] **Step 2: Get actual emails from user and update the file**

Ask the user for the three Gmail addresses and replace the `REPLACE_WITH_ACTUAL_EMAIL_*` placeholders.

- [ ] **Step 3: Apply seed migration via Supabase MCP**

Run: `mcp__plugin_supabase_supabase__apply_migration` with the updated SQL.

- [ ] **Step 4: Verify data**

Run: `mcp__plugin_supabase_supabase__execute_sql` with:

```sql
select m.name, count(e.id) as expense_count
from public.members m
left join public.expenses e on e.member_id = m.id
group by m.name;
```

Expected: 詹詠翔=3, 蔡雨恩=18, 邱彥銘=3

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260406120001_seed_data.sql
git commit -m "feat: seed historical expense data from Google Sheets"
```

---

### Task 3: Install shadcn Components + Root Middleware

**Files:**

- Create: `middleware.ts`
- Components installed by shadcn CLI

- [ ] **Step 1: Install shadcn components**

```bash
cd /Users/loki/1909.zyx.tw
bunx shadcn@latest add card input label badge separator -y
```

- [ ] **Step 2: Create root middleware**

Create `middleware.ts` at project root:

```typescript
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts components/ui/
git commit -m "feat: add root middleware and shadcn components"
```

---

### Task 4: Auth Pages

**Files:**

- Create: `app/auth/login/page.tsx`
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create login page**

Create `app/auth/login/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  async function signIn() {
    "use server"
    const supabase = await createClient()
    const origin = (await headers()).get("origin")
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
    if (data.url) {
      redirect(data.url)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-lg font-medium">1909</h1>
        <form action={signIn}>
          <Button type="submit" variant="outline">
            Sign in with Google
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create OAuth callback route**

Create `app/auth/callback/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
```

- [ ] **Step 3: Verify auth flow**

Run: `cd /Users/loki/1909.zyx.tw && bun run build`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/auth/
git commit -m "feat: add Google OAuth login and callback"
```

---

### Task 5: Types + Balance Calculation

**Files:**

- Create: `lib/types.ts`
- Create: `lib/calc.ts`
- Create: `lib/calc.test.ts`

- [ ] **Step 1: Create types**

Create `lib/types.ts`:

```typescript
export type Member = {
  id: number
  name: string
  email: string
}

export type Expense = {
  id: number
  member_id: number
  title: string
  amount: number
  settled: boolean
  created_at: string
  member?: Member
}

export type Debt = {
  from: string
  to: string
  amount: number
}
```

- [ ] **Step 2: Write failing test for balance calculation**

Create `lib/calc.test.ts`:

```typescript
import { describe, test, expect } from "bun:test"
import { calculateDebts } from "./calc"
import type { Member, Expense } from "./types"

const members: Member[] = [
  { id: 1, name: "A", email: "a@test.com" },
  { id: 2, name: "B", email: "b@test.com" },
  { id: 3, name: "C", email: "c@test.com" },
]

describe("calculateDebts", () => {
  test("no expenses = no debts", () => {
    expect(calculateDebts([], members)).toEqual([])
  })

  test("single expense split 3 ways", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 900 },
    ]
    const debts = calculateDebts(expenses, members)
    expect(debts).toEqual([
      { from: "B", to: "A", amount: 300 },
      { from: "C", to: "A", amount: 300 },
    ])
  })

  test("multiple expenses, net out", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 900 },
      { member_id: 2, amount: 900 },
      { member_id: 3, amount: 900 },
    ]
    const debts = calculateDebts(expenses, members)
    expect(debts).toEqual([])
  })

  test("two payers, one debtor", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 600 },
      { member_id: 2, amount: 300 },
    ]
    // Total: 900, share: 300 each
    // A net: +300, B net: 0, C net: -300
    const debts = calculateDebts(expenses, members)
    expect(debts).toEqual([{ from: "C", to: "A", amount: 300 }])
  })

  test("handles non-divisible amounts with rounding", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 100 },
    ]
    const debts = calculateDebts(expenses, members)
    // 100/3 = 33.33, A net: +66.67, B: -33.33, C: -33.33
    expect(debts[0].from).toBe("B")
    expect(debts[0].to).toBe("A")
    expect(debts[0].amount).toBe(33)
    expect(debts[1].from).toBe("C")
    expect(debts[1].to).toBe("A")
    expect(debts[1].amount).toBe(33)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /Users/loki/1909.zyx.tw && bun test lib/calc.test.ts`

Expected: FAIL — `calculateDebts` not found.

- [ ] **Step 4: Implement balance calculation**

Create `lib/calc.ts`:

```typescript
import type { Member, Debt } from "./types"

export function calculateDebts(
  expenses: Pick<{ member_id: number; amount: number }, "member_id" | "amount">[],
  members: Member[],
): Debt[] {
  if (expenses.length === 0) return []

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const share = total / members.length

  const nets = members
    .map((m) => {
      const paid = expenses
        .filter((e) => e.member_id === m.id)
        .reduce((sum, e) => sum + e.amount, 0)
      return { name: m.name, net: paid - share }
    })
    .filter((n) => Math.abs(n.net) >= 1)

  const debtors = nets.filter((n) => n.net < 0).sort((a, b) => a.net - b.net)
  const creditors = nets.filter((n) => n.net > 0).sort((a, b) => b.net - a.net)

  const debts: Debt[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].net, creditors[j].net)
    if (Math.round(amount) > 0) {
      debts.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(amount),
      })
    }
    debtors[i].net += amount
    creditors[j].net -= amount
    if (Math.abs(debtors[i].net) < 1) i++
    if (Math.abs(creditors[j].net) < 1) j++
  }

  return debts
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/loki/1909.zyx.tw && bun test lib/calc.test.ts`

Expected: All 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/calc.ts lib/calc.test.ts
git commit -m "feat: add types and balance calculation with tests"
```

---

### Task 6: Server Actions

**Files:**

- Create: `app/actions.ts`

- [ ] **Step 1: Create server actions**

Create `app/actions.ts`:

```typescript
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const title = formData.get("title") as string
  const amount = parseInt(formData.get("amount") as string, 10)

  if (!title || !amount || amount <= 0) return

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("email", user.email!)
    .single()

  if (!member) return

  await supabase.from("expenses").insert({
    member_id: member.id,
    title,
    amount,
  })

  revalidatePath("/")
}

export async function toggleSettle(expenseId: number) {
  const supabase = await createClient()

  const { data: expense } = await supabase
    .from("expenses")
    .select("settled")
    .eq("id", expenseId)
    .single()

  if (!expense) return

  await supabase
    .from("expenses")
    .update({ settled: !expense.settled })
    .eq("id", expenseId)

  revalidatePath("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
```

- [ ] **Step 2: Commit**

```bash
git add app/actions.ts
git commit -m "feat: add server actions for expenses and auth"
```

---

### Task 7: Dashboard Components

**Files:**

- Create: `components/user-nav.tsx`
- Create: `components/balance-summary.tsx`
- Create: `components/expense-form.tsx`
- Create: `components/expense-list.tsx`

- [ ] **Step 1: Create user nav component**

Create `components/user-nav.tsx`:

```tsx
import { signOut } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function UserNav({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{name}</span>
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit">
          登出
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create balance summary component**

Create `components/balance-summary.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card"
import type { Debt } from "@/lib/types"

export function BalanceSummary({ debts }: { debts: Debt[] }) {
  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          目前沒有未核銷的欠款
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {debts.map((debt, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm">
              <span className="font-medium">{debt.from}</span>
              {" 欠 "}
              <span className="font-medium">{debt.to}</span>
            </span>
            <span className="font-medium tabular-nums">
              ${debt.amount.toLocaleString()}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create expense form component**

Create `components/expense-form.tsx`:

```tsx
"use client"

import { useRef } from "react"
import { addExpense } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await addExpense(formData)
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
      <Input name="title" placeholder="項目名稱" required className="flex-1" />
      <Input
        name="amount"
        type="number"
        placeholder="金額"
        min={1}
        required
        className="w-28"
      />
      <Button type="submit">新增</Button>
    </form>
  )
}
```

- [ ] **Step 4: Create expense list component**

Create `components/expense-list.tsx`:

```tsx
"use client"

import { toggleSettle } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import type { Expense } from "@/lib/types"

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">尚無紀錄</p>
    )
  }

  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <button
          key={expense.id}
          onClick={() => toggleSettle(expense.id)}
          className="flex w-full items-center gap-3 px-1 py-3 text-left text-sm transition-colors hover:bg-muted/50"
        >
          <span className="w-12 shrink-0 text-muted-foreground">
            {new Date(expense.created_at).toLocaleDateString("zh-TW", {
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
          <span className="w-16 shrink-0 font-medium">
            {expense.member?.name}
          </span>
          <span className="min-w-0 flex-1 truncate">{expense.title}</span>
          <span className="shrink-0 tabular-nums">
            ${expense.amount.toLocaleString()}
          </span>
          <Badge variant={expense.settled ? "secondary" : "default"}>
            {expense.settled ? "已核銷" : "未核銷"}
          </Badge>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/user-nav.tsx components/balance-summary.tsx components/expense-form.tsx components/expense-list.tsx
git commit -m "feat: add dashboard components"
```

---

### Task 8: Dashboard Page

**Files:**

- Modify: `app/layout.tsx`
- Rewrite: `app/page.tsx`

- [ ] **Step 1: Update layout with metadata**

Modify `app/layout.tsx` — add metadata export:

```tsx
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "1909",
  description: "竹科潤隆 A 棟 19 樓之 9",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, "font-mono", geistMono.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Rewrite dashboard page**

Rewrite `app/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { calculateDebts } from "@/lib/calc"
import type { Member, Expense } from "@/lib/types"
import { UserNav } from "@/components/user-nav"
import { BalanceSummary } from "@/components/balance-summary"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { Separator } from "@/components/ui/separator"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .returns<Member[]>()

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, member:members(*)")
    .order("created_at", { ascending: false })
    .returns<Expense[]>()

  const currentMember = members?.find((m) => m.email === user.email)
  if (!currentMember) redirect("/auth/login")

  const unsettled = (expenses ?? []).filter((e) => !e.settled)
  const debts = calculateDebts(unsettled, members ?? [])

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-medium">1909</h1>
        <UserNav name={currentMember.name} />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">欠款摘要</h2>
        <BalanceSummary debts={debts} />
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">新增支出</h2>
        <ExpenseForm />
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">支出紀錄</h2>
        <ExpenseList expenses={expenses ?? []} />
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

Run: `cd /Users/loki/1909.zyx.tw && bun run build`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: implement dashboard page with balance summary and expense list"
```

---

### Task 9: Verify End-to-End

- [ ] **Step 1: Run type check**

Run: `cd /Users/loki/1909.zyx.tw && bun run typecheck`

Expected: No type errors.

- [ ] **Step 2: Run tests**

Run: `cd /Users/loki/1909.zyx.tw && bun test`

Expected: All tests pass.

- [ ] **Step 3: Run build**

Run: `cd /Users/loki/1909.zyx.tw && bun run build`

Expected: Build succeeds.

- [ ] **Step 4: Manual smoke test**

Run: `cd /Users/loki/1909.zyx.tw && bun run dev`

Test flow:

1. Visit `http://localhost:3000` → should redirect to `/auth/login`
2. Click "Sign in with Google" → should redirect to Google OAuth
3. After login → should redirect to `/` with dashboard
4. Verify balance summary shows debts from unsettled expenses
5. Add a test expense → should appear in list
6. Click an expense to toggle settled → badge should update
7. Click "登出" → should redirect to login
