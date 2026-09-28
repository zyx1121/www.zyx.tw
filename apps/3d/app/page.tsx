import { EditorLoader } from "@/components/editor-loader"
import { SITE_DESC, SITE_NAME } from "@/lib/site"

export default function Home() {
  return (
    <>
      <h1 className="sr-only">{SITE_NAME}</h1>
      <p className="sr-only">{SITE_DESC}</p>
      <EditorLoader />
    </>
  )
}
