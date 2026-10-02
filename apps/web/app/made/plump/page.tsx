import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { MadeExperience } from "@/components/made-experience"
import { asset, getProduct } from "@/lib/made"
import { pageMetadata } from "@/lib/site"

const product = getProduct("plump")
const baseMetadata = pageMetadata({
  title: `${product.name}, ${product.purpose}`,
  path: "/made/plump",
  description: product.description,
  image: {
    url: asset(product.id, "-hero.webp"),
    width: 1920,
    height: 1080,
    alt: product.imageAlt,
  },
})

export default function Page() {
  return <MadeExperience product="plump" />
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/made/plump")
}
