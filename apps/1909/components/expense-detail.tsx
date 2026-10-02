"use client"
import { T, useT, useLocale } from "@workspace/ui/components/locale-provider"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogClose,
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
  const locale = useLocale()
  const t = useT()

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
      <DialogContent showCloseButton={false}>
        <DialogClose
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md"
          aria-label={t("Close")}
        >
          <span aria-hidden="true">×</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>
            {editing ? <T>{"編輯支出"}</T> : expense?.title}
          </DialogTitle>
        </DialogHeader>
        {expense && !editing && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                <T>{"付款人"}</T>
              </span>
              <span>{expense.member?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                <T>{"金額"}</T>
              </span>
              <span className="tabular-nums">
                ${expense.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                <T>{"日期"}</T>
              </span>
              <span className="tabular-nums">
                <T>{new Date(expense.created_at).toLocaleDateString(locale)}</T>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                <T>{"狀態"}</T>
              </span>
              <Badge variant={expense.settled ? "secondary" : "default"}>
                <T>{expense.settled ? "已核銷" : "未核銷"}</T>
              </Badge>
            </div>
            {isOwner && (
              <div className="mt-2 flex gap-2">
                <Button
                  variant={expense.settled ? "outline" : "default"}
                  className="flex-1"
                  onClick={onToggle}
                >
                  <T>{expense.settled ? "取消核銷" : "標記已核銷"}</T>
                </Button>
                <Button variant="outline" onClick={startEdit}>
                  <T>{"編輯"}</T>
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                  <T>{"刪除"}</T>
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
              placeholder={t("項目名稱")}
              required
            />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t("金額")}
              min={1}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onEdit(false)}>
                <T>{"取消"}</T>
              </Button>
              <Button
                onClick={() => {
                  const parsed = parseInt(amount, 10)
                  if (title && parsed > 0) onUpdate(title, parsed)
                }}
              >
                <T>{"儲存"}</T>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
