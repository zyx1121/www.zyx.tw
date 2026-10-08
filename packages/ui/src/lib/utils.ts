import type { CnFunction } from "cn"
import { createCn } from "cn/config"

// cn that knows the zyx type scale. Stock tailwind-merge rules read
// text-display, text-title, text-body and text-caption as colors, so
// cn("text-body", "text-foreground") would drop the size; registering them as
// font sizes keeps both.
export const cn: CnFunction = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "title", "body", "caption"] }],
    },
  },
})
