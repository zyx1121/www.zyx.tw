import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { LegalPage } from "@/components/legal-page"
import { PRIVACY } from "@/lib/privacy"
import { pageMetadata } from "@/lib/site"

const baseMetadata = pageMetadata({
  title: PRIVACY.title,
  path: "/privacy",
})

export default function Privacy() {
  return <LegalPage doc={PRIVACY} />
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/privacy")
}
