import { Corner } from "@workspace/ui/components/corners"

import { calculateDebts } from "@/lib/calc"
import { db } from "@/lib/db"
import { requireMember } from "@/lib/member"
import type { Member, Expense } from "@/lib/types"
import { UserNav } from "@/components/user-nav"
import { BalanceSummary } from "@/components/balance-summary"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { Separator } from "@/components/ui/separator"

export default async function Page() {
  const currentMember = await requireMember()
  const sql = db()

  const members = (await sql`
    select id, name, email from app_1909.members order by id
  `) as Member[]

  // created_at as ISO text and member as an object, the shape PostgREST gave.
  const expenses = (await sql`
    select e.id, e.member_id, e.title, e.amount, e.settled,
      to_json(e.created_at) #>> '{}' as created_at,
      json_build_object('id', m.id, 'name', m.name, 'email', m.email) as member
    from app_1909.expenses e
    join app_1909.members m on m.id = e.member_id
    order by e.created_at desc
  `) as Expense[]

  const unsettled = expenses.filter((e) => !e.settled)
  const debts = calculateDebts(unsettled, members)

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 px-6 pt-20 pb-25">
      <Corner at="top-right">
        <ExpenseForm />
        <UserNav name={currentMember.name} />
      </Corner>
      <h1 className="font-medium">1909</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">欠款摘要</h2>
        <BalanceSummary debts={debts} />
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">支出紀錄</h2>
        <ExpenseList expenses={expenses} currentMemberId={currentMember.id} />
      </section>
    </div>
  )
}
