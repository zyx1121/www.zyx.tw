import { defineEnvironment, gainMapFiles } from "../registry"

/** Made with OpenAI image generation (via Codex), upscaled with Real-ESRGAN. */
export const castle = defineEnvironment({
  id: "castle",
  label: "Pink castle",
  files: gainMapFiles("castle"),
})
