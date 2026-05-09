import { ImageResponse } from "next/og"

import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  ZyxOgImage,
} from "@workspace/ui/components/og-image"

export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return new ImageResponse(<ZyxOgImage />, OG_SIZE)
}
