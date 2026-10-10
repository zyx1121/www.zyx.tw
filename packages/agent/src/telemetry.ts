// Traces for an agent app, sent over OTLP/HTTP to Sensorium (or any collector)
// when OTEL_EXPORTER_OTLP_ENDPOINT is set; otherwise every call here is a
// no-op. The exporter also reads OTEL_EXPORTER_OTLP_HEADERS.
//
// Spans carry names, ids, counts and timings, never prompts, file content or
// credentials: whatever a span holds leaves the host.

import {
  type Attributes,
  type Span,
  SpanKind,
  SpanStatusCode,
  context,
  trace,
} from "@opentelemetry/api"

const tracer = trace.getTracer("agent")

/**
 * Start exporting spans; call it once at startup (Next.js: `register()` in
 * instrumentation.ts, when NEXT_RUNTIME is "nodejs"). Returns the function
 * that flushes and stops, or null when no endpoint is set. Skip it when the
 * app already registers a tracer provider, such as @vercel/otel.
 */
export async function registerTelemetry(
  options: { serviceName: string; version?: string },
  env: Record<string, string | undefined> = process.env
): Promise<(() => Promise<void>) | null> {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) return null
  // Next.js dev reloads modules and calls register() again.
  const flag = globalThis as { agentTelemetry?: () => Promise<void> }
  if (flag.agentTelemetry) return flag.agentTelemetry
  // Loaded here, so code that only creates spans never pulls in the SDK.
  const { BasicTracerProvider, BatchSpanProcessor } =
    await import("@opentelemetry/sdk-trace-base")
  const { OTLPTraceExporter } =
    await import("@opentelemetry/exporter-trace-otlp-http")
  const { resourceFromAttributes } = await import("@opentelemetry/resources")
  const { AsyncLocalStorageContextManager } =
    await import("@opentelemetry/context-async-hooks")
  const provider = new BasicTracerProvider({
    resource: resourceFromAttributes({
      "service.name": env.OTEL_SERVICE_NAME || options.serviceName,
      ...(options.version && { "service.version": options.version }),
    }),
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
  })
  context.setGlobalContextManager(
    new AsyncLocalStorageContextManager().enable()
  )
  trace.setGlobalTracerProvider(provider)
  flag.agentTelemetry = () => provider.shutdown()
  return flag.agentTelemetry
}

/** Mark a span as failed with the error's name only: messages may quote content. */
export function failed(span: Span, error: unknown): void {
  const name = error instanceof Error ? error.name : typeof error
  span.setStatus({ code: SpanStatusCode.ERROR, message: name })
  span.setAttribute("error.type", name)
}

/** Run fn in a new active span; an exception marks it failed and is rethrown. */
export function inSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => Promise<T>,
  kind: SpanKind = SpanKind.INTERNAL
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes, kind }, async (span) => {
    try {
      return await fn(span)
    } catch (error) {
      failed(span, error)
      throw error
    } finally {
      span.end()
    }
  })
}

// A router such as OpenRouter names the provider that served a request in
// its response; the span records it as model.upstream.
const UPSTREAM = /"provider"\s*:\s*"([^"\\]{1,100})"/

/**
 * fetch for model endpoints, traced as one model.http client span that ends
 * when the body ends, so it covers the whole stream. Records the host, path
 * and status, never the request or response body.
 */
export const tracedFetch = (async (
  input: string | URL | Request,
  init?: RequestInit
) => {
  const url = new URL(
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url
  )
  const span = tracer.startSpan("model.http", {
    kind: SpanKind.CLIENT,
    attributes: {
      "http.request.method": init?.method ?? "GET",
      "server.address": url.host,
      "url.path": url.pathname,
    },
  })
  let response: Response
  try {
    response = await fetch(input, init)
  } catch (error) {
    failed(span, error)
    span.end()
    throw error
  }
  span.setAttribute("http.response.status_code", response.status)
  if (!response.ok)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `HTTP ${response.status}`,
    })
  if (!response.body) {
    span.end()
    return response
  }
  let ended = false
  const end = () => {
    if (!ended) span.end()
    ended = true
  }
  init?.signal?.addEventListener("abort", end, { once: true })
  const decoder = new TextDecoder()
  let head = ""
  let found = false
  const body = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        if (!found && head.length < 65_536) {
          head += decoder.decode(chunk, { stream: true })
          const match = UPSTREAM.exec(head)
          if (match) {
            span.setAttribute("model.upstream", match[1]!)
            found = true
            head = ""
          }
        }
        controller.enqueue(chunk)
      },
      flush: end,
    })
  )
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}) as typeof fetch
