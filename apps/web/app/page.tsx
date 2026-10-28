import { HomeMark } from "@/components/home-mark"
import { HOME } from "@/lib/copy"
import { pageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const dynamic = "force-static"

// The home's canonical and Markdown alternate live here, not in the root
// layout, so the not-found page does not inherit them. The title is the site
// name alone, absolute because a layout's title template skips the page in
// its own segment.
export const metadata = {
  ...pageMetadata({ path: "/" }),
  title: { absolute: SITE_NAME },
}

/**
 * The home is the mark alone, in characters, over the pond that swims behind
 * the site, filling the viewport under the corners. Everything else about
 * Loki is on About.
 */
export default function Home() {
  return (
    <main className="fixed inset-0">
      <h1 className="sr-only">{HOME.title}</h1>
      <p className="sr-only">{SITE_DESCRIPTION}</p>
      <HomeMark />
    </main>
  )
}
