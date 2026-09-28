import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Member } from "@/lib/types"

/** The signed-in flatmate. Anyone else is sent back to the login page. */
export async function requireMember(): Promise<Member> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/login")

  const [member] = (await db()`
    select id, name, email from app_1909.members
    where email = ${session.user.email}
  `) as Member[]
  if (!member) redirect("/auth/login")

  return member
}
