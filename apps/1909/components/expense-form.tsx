"use client"

import { useExpenseForm } from "@/hooks/use-expense-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ExpenseForm() {
  const { formRef, open, setOpen, handleSubmit } = useExpenseForm()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          新增支出
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增支出</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Input name="title" placeholder="項目名稱" required />
          <Input
            name="amount"
            type="number"
            placeholder="金額"
            min={1}
            required
          />
          <Button type="submit" className="self-end">
            新增
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
