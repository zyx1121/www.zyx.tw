"use client"
import { T, useT } from "@workspace/ui/components/locale-provider"

import { cornerLink } from "@workspace/ui/components/corners"

import { useExpenseForm } from "@/hooks/use-expense-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ExpenseForm() {
  const t = useT()

  const { formRef, open, setOpen, handleSubmit } = useExpenseForm()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className={cornerLink} />}>
        <T>{"新增支出"}</T>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogClose
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md"
          aria-label={t("Close")}
        >
          <span aria-hidden="true">×</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>
            <T>{"新增支出"}</T>
          </DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Input name="title" placeholder={t("項目名稱")} required />
          <Input
            name="amount"
            type="number"
            placeholder={t("金額")}
            min={1}
            required
          />
          <Button type="submit" className="self-end">
            <T>{"新增"}</T>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
