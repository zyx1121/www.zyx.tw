import { defineEnvironment, gainMapFiles } from "../registry"

/** Made with OpenAI image generation (via Codex), upscaled with Real-ESRGAN. */
export const garden = defineEnvironment({
  id: "garden",
  label: "Dream garden",
  files: gainMapFiles("dream-garden"),
})
