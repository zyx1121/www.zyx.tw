/** Copy shared by the product story and its Markdown twin. */
export const PLUMP = {
  name: "Plump",
  purpose: "SVG to 3D",
  tagline: "Your SVG, with a little more body.",
  description:
    "Turn an SVG into a 3D object. Give it depth, find a material, set the light and save a scene you can come back to.",
  href: "https://plump.zyx.tw",
  image: "/made/identities/plump-material.webp",
  imageAlt: "A silver four-lobed SVG shape given depth and soft edges in Plump",
  idea: {
    title: "Your shape. A new feeling.",
    body: "A logo, an icon, a small mark of your own. Plump gives the outlines you already have a physical presence, with soft edges, reflective surfaces and light you can change in your browser.",
  },
  demo: {
    title: "Same outline. Different character.",
    body: "Try this sample. Change its depth and move between metal, plastic and glass. This preview uses the same renderer as the editor.",
  },
  steps: [
    {
      title: "Bring a shape.",
      body: "Import an SVG with filled outlines. Start with a logo or icon; convert strokes and lettering to paths in your vector editor first.",
    },
    {
      title: "Give it volume.",
      body: "Adjust depth and bevel. Choose a material, then explore environments, backgrounds, camera staging and effects.",
    },
    {
      title: "Keep it editable.",
      body: "Export scene.json to keep your shape and settings together. Open that file in Plump to pick up where you left off.",
    },
  ],
  details: [
    { label: "Input", value: "SVG or a compatible scene.json" },
    { label: "Output", value: "Editable scene.json" },
    { label: "Runs in", value: "A browser with WebGL enabled" },
  ],
  storage:
    "Your working scene stays in this browser. Export a scene file to back it up or move it to another device.",
  closing: "Give your next mark some volume.",
  credit: "A product by Loki, made under zyx.",
} as const

/** Our sample is a filled vector outline, not generated raster artwork. */
export const PLUMP_SAMPLE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#111111" fill-rule="evenodd" d="M128 57 C149 24 179 20 201 41 C224 63 228 93 198 127 C229 153 226 189 204 211 C182 233 151 231 128 200 C103 231 72 233 49 211 C26 189 26 155 57 128 C27 103 28 71 50 48 C72 25 103 26 128 57 Z"/></svg>'
