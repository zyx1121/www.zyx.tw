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
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-medium">1909</h1>
        <div className="flex items-center gap-3">
          <ExpenseForm />
          <UserNav name={currentMember.name} />
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">欠款摘要</h2>
        <BalanceSummary debts={debts} />
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">支出紀錄</h2>
        <ExpenseList
          expenses={expenses ?? []}
          currentMemberId={currentMember.id}
        />
      </section>
    </div>
  )
}
