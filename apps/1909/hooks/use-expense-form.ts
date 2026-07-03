"use client"

import { useRef, useState } from "react"
import { addExpense } from "@/app/actions"

export function useExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addExpense(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  return { formRef, open, setOpen, handleSubmit }
}
