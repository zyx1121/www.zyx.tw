import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { CarrelStory } from "@/components/carrel-story"
import { MadeExperience } from "@/components/made-experience"
import { asset, getProduct } from "@/lib/made"
import { pageMetadata } from "@/lib/site"

import "./carrel.css"

const product = getProduct("carrel")
const baseMetadata = pageMetadata({
  title: `${product.name}, ${product.purpose}`,
  path: "/made/carrel",
  description: product.description,
  image: {
    url: asset(product.id, "-hero.webp"),
    width: 1920,
    height: 1080,
    alt: product.imageAlt,
  },
})

export default function Page() {
  return (
    <MadeExperience product="carrel">
      <CarrelStory />
    </MadeExperience>
  )
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/made/carrel")
}
