import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http"
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs"
import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel"

export interface RegisterSensoriumOptions {
  /**
   * Fallback `service.name` when `OTEL_SERVICE_NAME` is unset. Pass the
   * app's workspace name (web/good/link/temp/things/time/ui/1909) so traces
   * stay attributable even if the Vercel project's env var is missing.
   */
  defaultServiceName: string
}

/**
 * OpenTelemetry bootstrap shared by every app in this workspace — producer
 * for the Sensorium observability platform (sensorium.zyx.tw). Call from
 * each app's `instrumentation.ts` `register()` export. Sends request-span
 * traces (4xx/5xx included) plus explicit application log records
 * (server-side render errors, via `createOnRequestError`) over OTLP so
 * agents (kilo/noir) can query them via Sensorium's MCP.
 *
 * Everything here is env-driven; no endpoint/token is hardcoded.
 * `OTEL_SERVICE_NAME` sets `service.name` per-app; `OTEL_RESOURCE_ATTRIBUTES`
 * (e.g. `service.namespace=www-zyx`) is read automatically by
 * `@vercel/otel`'s default env resource detector.
 *
 * Protocol note: Sensorium's ingest only accepts OTLP/JSON — protobuf gets
 * a 415. `@vercel/otel`'s *default* trace exporter does honor the standard
 * `OTEL_EXPORTER_OTLP_PROTOCOL` env var, but rather than depend on that env
 * value being spelled exactly right in a manually configured Vercel
 * project, we import `OTLPHttpJsonTraceExporter` directly and use it
 * unconditionally — JSON is a code-level guarantee, not something a typo in
 * `OTEL_EXPORTER_OTLP_PROTOCOL` could silently flip to protobuf.
 * `@vercel/otel` ships this exporter itself, so this needs no extra
 * `@opentelemetry/exporter-trace-otlp-http` dependency.
 *
 * `spanProcessors: []` matters here: `@vercel/otel`'s default
 * `spanProcessors` is `["auto"]`, and that "auto" resolution *also* stands
 * up its own env-driven exporter independently of whatever `traceExporter`
 * is passed, whenever `OTEL_EXPORTER_OTLP_ENDPOINT` is set — verified
 * empirically (ai.winlab.tw) by pointing an app at a local HTTP sink:
 * without this override, every request produced TWO POSTs to `/v1/traces`,
 * one `application/x-protobuf` (the "auto" one) and one `application/json`
 * (ours). `spanProcessors: []` suppresses that auto processor so our
 * explicit JSON exporter is the *only* one registered — no duplicate
 * spans, no stray protobuf request hitting Sensorium's ingest.
 *
 * Logs follow the same "explicit, no auto-drain" shape: a
 * `BatchLogRecordProcessor` wrapping `@opentelemetry/exporter-logs-otlp-http`'s
 * `OTLPLogExporter`, whose Node implementation hardcodes
 * `JsonLogsSerializer` + `Content-Type: application/json` — JSON is a
 * code-level guarantee here too. Passing it via `logRecordProcessors` lets
 * `@vercel/otel` share the same env-detected `resource`
 * (service.namespace/service.name) between traces and logs.
 */
export function registerSensorium({
  defaultServiceName,
}: RegisterSensoriumOptions): void {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT

  // No collector configured (e.g. plain `bun run dev` locally) — skip
  // registering the SDK entirely. No throw, no background export attempts
  // against a phantom collector.
  if (!endpoint) return

  const trimmedEndpoint = endpoint.replace(/\/+$/, "")
  const headers = parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS)

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? defaultServiceName,
    spanProcessors: [],
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${trimmedEndpoint}/v1/traces`,
      headers,
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${trimmedEndpoint}/v1/logs`,
          headers,
        }),
      }),
    ],
  })
}

/**
 * Minimal parser for the OTLP `key1=value1,key2=value2` header env format
 * (e.g. `Authorization=Bearer <token>`). Doesn't percent-decode values —
 * fine for bearer tokens, which don't contain `,`/`=`.
 */
function parseOtlpHeaders(
  raw: string | undefined
): Record<string, string> | undefined {
  if (!raw) return undefined

  const headers: Record<string, string> = {}
  for (const pair of raw.split(",")) {
    const eq = pair.indexOf("=")
    if (eq === -1) continue
    const key = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    if (key) headers[key] = value
  }
  return headers
}
