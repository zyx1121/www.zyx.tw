"use client"

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
    return <p className="text-center text-sm text-muted-foreground">尚無紀錄</p>
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
