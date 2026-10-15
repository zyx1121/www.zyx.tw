import { HomeStage } from "@/components/home-stage"
import { HOME } from "@/lib/copy"
import sceneFile from "@/lib/home-scene.json"
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
 * The home is the 3D mark alone, on a stage that fills the viewport under
 * the corners. Everything else about Loki is on About.
 */
export default function Home() {
  return (
    // Bliss behind a transparent scene, over the scene's background color,
    // which shows while the image loads. The root layout paints the
    // scrollbar gutter beside it that color.
    <main
      data-stage
      className="fixed inset-0"
      style={{
        background: `url(/bliss.webp) center / cover, ${sceneFile.staging.background}`,
      }}
    >
      <h1 className="sr-only">{HOME.title}</h1>
      <p className="sr-only">{SITE_DESCRIPTION}</p>
      <HomeStage />
    </main>
  )
}
