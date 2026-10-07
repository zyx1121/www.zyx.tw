"use client"

import { cornerLink } from "@workspace/ui/components/corners"
import { Button } from "@workspace/ui/components/ui/button"
import { Input } from "@workspace/ui/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/ui/dialog"

import { useExpenseForm } from "@/hooks/use-expense-form"

export function ExpenseForm() {
  const { formRef, open, setOpen, handleSubmit } = useExpenseForm()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className={cornerLink} />}>
        新增支出
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
