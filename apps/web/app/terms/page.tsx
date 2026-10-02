import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { LegalPage } from "@/components/legal-page"
import { pageMetadata } from "@/lib/site"
import { TERMS } from "@/lib/terms"

const baseMetadata = pageMetadata({ title: TERMS.title, path: "/terms" })

export default function Terms() {
  return <LegalPage doc={TERMS} />
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/terms")
}
