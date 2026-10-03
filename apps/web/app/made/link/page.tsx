import { MadeExperience } from "@/components/made-experience"
import { asset, getProduct } from "@/lib/made"
import { pageMetadata } from "@/lib/site"

const product = getProduct("link")
export const dynamic = "force-static"
export const metadata = pageMetadata({
  title: `${product.name}, ${product.purpose}`,
  path: "/made/link",
  description: product.description,
  image: {
    url: asset(product.id, "-hero.webp"),
    width: 1920,
    height: 1080,
    alt: product.imageAlt,
  },
})

export default function Page() {
  return <MadeExperience product="link" />
}
