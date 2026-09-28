import { defineEnvironment, gainMapFiles } from "../registry"

/** Made with OpenAI image generation (via Codex), upscaled with Real-ESRGAN. */
export const aurora = defineEnvironment({
  id: "aurora",
  label: "Aurora",
  files: gainMapFiles("aurora"),
})
