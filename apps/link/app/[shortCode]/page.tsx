import { notFound, redirect } from "next/navigation"

import { db } from "@/utils/db"

export const dynamic = "force-dynamic"

export default async function ShortCodePage({
  params,
}: {
  params: Promise<{ shortCode: string }>
}) {
  const { shortCode } = await params
  const sql = db()

  const [row] = await sql`
    select url from link.redirects where short_code = ${shortCode}
  `

  if (!row?.url) {
    notFound()
  }

  redirect(row.url as string)
}
