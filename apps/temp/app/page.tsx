import { redirect } from "next/navigation"

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

export default function Home() {
  redirect(`/${generateId()}`)
}
