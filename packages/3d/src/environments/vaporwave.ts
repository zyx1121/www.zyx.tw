import { defineEnvironment, gainMapFiles } from "../registry"

/** Made with OpenAI image generation (via Codex), upscaled with Real-ESRGAN. */
export const vaporwave = defineEnvironment({
  id: "vaporwave",
  label: "Vaporwave",
  files: gainMapFiles("vaporwave"),
})
