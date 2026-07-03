"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const title = formData.get("title") as string
  const amount = parseInt(formData.get("amount") as string, 10)

  if (!title || !amount || amount <= 0) return

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("email", user.email!)
    .single()

  if (!member) return

  await supabase.from("expenses").insert({
    member_id: member.id,
    title,
    amount,
  })

  revalidatePath("/")
}

export async function toggleSettle(expenseId: number) {
  const supabase = await createClient()

  const { data: expense } = await supabase
    .from("expenses")
    .select("settled")
    .eq("id", expenseId)
    .single()

  if (!expense) return

  await supabase
    .from("expenses")
    .update({ settled: !expense.settled })
    .eq("id", expenseId)

  revalidatePath("/")
}

export async function updateExpense(
  expenseId: number,
  title: string,
  amount: number
) {
  const supabase = await createClient()

  await supabase.from("expenses").update({ title, amount }).eq("id", expenseId)

  revalidatePath("/")
}

export async function deleteExpense(expenseId: number) {
  const supabase = await createClient()

  await supabase.from("expenses").delete().eq("id", expenseId)

  revalidatePath("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
