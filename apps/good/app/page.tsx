import { Good } from "@/components/good"
import { SITE_DESC, SITE_NAME } from "@/lib/site"

export default function Home() {
  return (
    <main className="h-dvh w-dvw">
      <h1 className="sr-only">{SITE_NAME}</h1>
      <p className="sr-only">{SITE_DESC}</p>
      <Good />
    </main>
  )
}
