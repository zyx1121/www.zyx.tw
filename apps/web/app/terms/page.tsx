import { LegalPage } from "@/components/legal-page"
import { pageMetadata } from "@/lib/site"
import { TERMS } from "@/lib/terms"

export const metadata = pageMetadata({ title: TERMS.title, path: "/terms" })

export const dynamic = "force-static"

export default function Terms() {
  return <LegalPage doc={TERMS} />
}
