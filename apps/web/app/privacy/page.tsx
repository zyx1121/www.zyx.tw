import { LegalPage } from "@/components/legal-page"
import { PRIVACY } from "@/lib/privacy"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: PRIVACY.title,
  path: "/privacy",
})

export const dynamic = "force-static"

export default function Privacy() {
  return <LegalPage doc={PRIVACY} />
}
