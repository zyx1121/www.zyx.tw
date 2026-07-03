"use client"

import { useState } from "react"
import { toggleSettle, updateExpense, deleteExpense } from "@/app/actions"
import type { Expense } from "@/lib/types"

export function useExpenseDetail(currentMemberId: number) {
  const [selected, setSelected] = useState<Expense | null>(null)
  const [editing, setEditing] = useState(false)

  const isOwner = selected?.member_id === currentMemberId

  async function handleToggle() {
    if (!selected) return
    await toggleSettle(selected.id)
    setSelected(null)
  }

  async function handleUpdate(title: string, amount: number) {
    if (!selected) return
    await updateExpense(selected.id, title, amount)
    setSelected(null)
    setEditing(false)
  }

  async function handleDelete() {
    if (!selected) return
    await deleteExpense(selected.id)
    setSelected(null)
  }

  function close() {
    setSelected(null)
    setEditing(false)
  }

  return {
    selected,
    setSelected,
    editing,
    setEditing,
    isOwner,
    handleToggle,
    handleUpdate,
    handleDelete,
    close,
  }
}
