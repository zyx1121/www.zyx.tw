import { trace } from "@opentelemetry/api"
import { headers } from "next/headers"

import { getClientAttributionAttributes } from "./attribution"

/**
 * Root-layout helper: tags the current request's active span with
 * `client.address`/`geo.*` attributes (see attribution.ts for the fixed
 * key contract). Call from each app's `async` root layout — it must be a
 * Node.js Server Component, not middleware/proxy.ts, because on Vercel
 * that runs in the Edge sandbox, isolated from the Node.js OTel context
 * `registerSensorium()` registers, so `trace.getActiveSpan()` there would
 * never be the span Sensorium receives.
 *
 * Caveat (verified locally via `next build && next start` on ai.winlab.tw,
 * Next 16.2.6): this only fires on requests that actually invoke the
 * render function. For static/ISR pages, Next.js keeps serving cached HTML
 * without re-running the layout component, so those pages don't get
 * per-visitor attribution — only the rare ISR background regeneration hits
 * this line. `headers()` did not force static routes to dynamic in that
 * build. Not supported at all under `output: "export"` (fully static —
 * `headers()` is a build error there); skip this helper for such apps.
 */
export async function attributeRootLayoutRequest(): Promise<void> {
  trace
    .getActiveSpan()
    ?.setAttributes(getClientAttributionAttributes(await headers()))
}
