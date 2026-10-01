import { PLUMP_SAMPLE } from "@/lib/plump"

export const dynamic = "force-static"

export function GET() {
  return new Response(PLUMP_SAMPLE, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": 'attachment; filename="plump-sample.svg"',
    },
  })
}
