"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Expense } from "@/lib/types"

export function ExpenseDetail({
  expense,
  isOwner,
  editing,
  onEdit,
  onToggle,
  onUpdate,
  onDelete,
  onClose,
}: {
  expense: Expense | null
  isOwner: boolean
  editing: boolean
  onEdit: (editing: boolean) => void
  onToggle: () => void
  onUpdate: (title: string, amount: number) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")

  function startEdit() {
    if (!expense) return
    setTitle(expense.title)
    setAmount(String(expense.amount))
    onEdit(true)
  }

  return (
    <Dialog
      open={!!expense}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "編輯支出" : expense?.title}</DialogTitle>
        </DialogHeader>
        {expense && !editing && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">付款人</span>
              <span>{expense.member?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">金額</span>
              <span className="tabular-nums">
                ${expense.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">日期</span>
              <span>
                {new Date(expense.created_at).toLocaleDateString("zh-TW")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">狀態</span>
              <Badge variant={expense.settled ? "secondary" : "default"}>
                {expense.settled ? "已核銷" : "未核銷"}
              </Badge>
            </div>
            {isOwner && (
              <div className="mt-2 flex gap-2">
                <Button
                  variant={expense.settled ? "outline" : "default"}
                  className="flex-1"
                  onClick={onToggle}
                >
                  {expense.settled ? "取消核銷" : "標記已核銷"}
                </Button>
                <Button variant="outline" onClick={startEdit}>
                  編輯
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                  刪除
                </Button>
              </div>
            )}
          </div>
        )}
        {expense && editing && (
          <div className="flex flex-col gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="項目名稱"
              required
            />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="金額"
              min={1}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onEdit(false)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  const parsed = parseInt(amount, 10)
                  if (title && parsed > 0) onUpdate(title, parsed)
                }}
              >
                儲存
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
