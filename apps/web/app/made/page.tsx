import { MadeExperience } from "@/components/made-experience"
import { MADE } from "@/lib/made"
import { pageMetadata } from "@/lib/site"

export const dynamic = "force-static"
export const metadata = pageMetadata({
  title: "Made",
  path: "/made",
  description: MADE.description,
})

export default function Made() {
  return <MadeExperience />
}
