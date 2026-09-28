"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireMember } from "@/lib/member"

// The database has no RLS: every action checks the flatmate here first.

export async function addExpense(formData: FormData) {
  const member = await requireMember()

  const title = formData.get("title") as string
  const amount = parseInt(formData.get("amount") as string, 10)

  if (!title || !amount || amount <= 0) return

  await db()`
    insert into app_1909.expenses (member_id, title, amount)
    values (${member.id}, ${title}, ${amount})
  `

  revalidatePath("/")
}

export async function toggleSettle(expenseId: number) {
  await requireMember()

  await db()`
    update app_1909.expenses set settled = not coalesce(settled, false)
    where id = ${expenseId}
  `

  revalidatePath("/")
}

export async function updateExpense(
  expenseId: number,
  title: string,
  amount: number
) {
  await requireMember()

  await db()`
    update app_1909.expenses set title = ${title}, amount = ${amount}
    where id = ${expenseId}
  `

  revalidatePath("/")
}

export async function deleteExpense(expenseId: number) {
  const member = await requireMember()

  // Same rule as the old RLS policy: flatmates only delete their own expenses.
  await db()`
    delete from app_1909.expenses
    where id = ${expenseId} and member_id = ${member.id}
  `

  revalidatePath("/")
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() })
  redirect("/auth/login")
}
