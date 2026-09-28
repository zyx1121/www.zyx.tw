import { defineEnvironment, gainMapFiles } from "../registry"

/** Made with OpenAI image generation (via Codex), upscaled with Real-ESRGAN. */
export const crystal = defineEnvironment({
  id: "crystal",
  label: "Crystal cave",
  files: gainMapFiles("crystal-cave"),
})
