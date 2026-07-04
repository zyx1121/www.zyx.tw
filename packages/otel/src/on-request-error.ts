import { getClientAttributionAttributes } from "./attribution"
import { emitErrorLog } from "./log"

/**
 * Builds Next.js's server-side error-observability hook (the reserved
 * `onRequestError` export in `instrumentation.ts`): fires whenever an error
 * occurs on the server (Server Component render, Route Handlers, Server
 * Actions) — including the same errors that then surface to
 * `app/error.tsx` / `app/global-error.tsx`. Those two files are Client
 * Components (`"use client"`, error boundaries run in the browser after
 * hydration), so they have no access to the server-side OTel logger
 * `registerSensorium()` registers; this hook is the actual bridge that gets
 * those errors into Sensorium as log records, independent of the boundary
 * UI.
 *
 * Reserved export name — Next.js calls this automatically if present, no
 * wiring beyond `export const onRequestError = createOnRequestError(name)`.
 * No-op (via `emitErrorLog`'s built-in no-op fallback) when OTel was never
 * registered.
 */
export function createOnRequestError(loggerName: string) {
  return async function onRequestError(
    error: unknown,
    request: Readonly<{
      path: string
      method: string
      headers: NodeJS.Dict<string | string[]>
    }>,
    context: Readonly<{
      routerKind: "Pages Router" | "App Router"
      routePath: string
      routeType: "render" | "route" | "action" | "proxy"
      renderSource?:
        | "react-server-components"
        | "react-server-components-payload"
        | "server-rendering"
      revalidateReason: "on-demand" | "stale" | undefined
    }>
  ) {
    const message = error instanceof Error ? error.message : String(error)
    const digest =
      error instanceof Error
        ? (error as Error & { digest?: string }).digest
        : undefined

    emitErrorLog(loggerName, {
      message,
      digest,
      attributes: {
        "http.route": request.path,
        "http.request.method": request.method,
        "next.router_kind": context.routerKind,
        "next.route_type": context.routeType,
        ...getClientAttributionAttributes(request.headers),
      },
    })
  }
}
