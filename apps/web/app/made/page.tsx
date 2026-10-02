import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { MadeExperience } from "@/components/made-experience"
import { MADE } from "@/lib/made"
import { pageMetadata } from "@/lib/site"

const baseMetadata = pageMetadata({
  title: "Made",
  path: "/made",
  description: MADE.description,
})

export default function Made() {
  return <MadeExperience />
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/made")
}
