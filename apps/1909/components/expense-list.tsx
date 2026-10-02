"use client"
import { T, useLocale } from "@workspace/ui/components/locale-provider"

import { useExpenseDetail } from "@/hooks/use-expense-detail"
import { Badge } from "@/components/ui/badge"
import { ExpenseDetail } from "@/components/expense-detail"
import type { Expense } from "@/lib/types"

export function ExpenseList({
  expenses,
  currentMemberId,
}: {
  expenses: Expense[]
  currentMemberId: number
}) {
  const locale = useLocale()
  const {
    selected,
    setSelected,
    editing,
    setEditing,
    isOwner,
    handleToggle,
    handleUpdate,
    handleDelete,
    close,
  } = useExpenseDetail(currentMemberId)

  if (expenses.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        <T>{"尚無紀錄"}</T>
      </p>
    )
  }

  return (
    <>
      <div className="divide-y">
        {expenses.map((expense) => (
          <button
            key={expense.id}
            onClick={() => setSelected(expense)}
            className="flex w-full items-center gap-3 px-1 py-3 text-left text-sm transition-colors hover:bg-muted/50"
          >
            <span className="w-12 shrink-0 text-muted-foreground tabular-nums">
              <T>
                {new Date(expense.created_at).toLocaleDateString(locale, {
                  month: "2-digit",
                  day: "2-digit",
                })}
              </T>
            </span>
            <span className="w-16 shrink-0 font-medium">
              {expense.member?.name}
            </span>
            <span className="min-w-0 flex-1 truncate">{expense.title}</span>
            <span className="shrink-0 tabular-nums">
              ${expense.amount.toLocaleString()}
            </span>
            <Badge variant={expense.settled ? "secondary" : "default"}>
              <T>{expense.settled ? "已核銷" : "未核銷"}</T>
            </Badge>
          </button>
        ))}
      </div>

      <ExpenseDetail
        expense={selected}
        isOwner={isOwner}
        editing={editing}
        onEdit={setEditing}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={close}
      />
    </>
  )
}
