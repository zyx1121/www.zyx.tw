import { defineEnvironment, gainMapFiles } from "../registry"

/** Made with OpenAI image generation (via Codex), upscaled with Real-ESRGAN. */
export const underwater = defineEnvironment({
  id: "underwater",
  label: "Underwater",
  files: gainMapFiles("underwater"),
})
