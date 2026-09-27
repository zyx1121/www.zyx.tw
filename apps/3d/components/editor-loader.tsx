"use client"

import dynamic from "next/dynamic"

// The editor reads localStorage for its first render and three.js needs the
// DOM, so it only ever renders in the browser.
const Editor = dynamic(
  () => import("@/components/editor").then((mod) => mod.Editor),
  { ssr: false, loading: () => <div className="h-dvh w-dvw bg-[#0a0a0a]" /> }
)

export function EditorLoader() {
  return <Editor />
}
