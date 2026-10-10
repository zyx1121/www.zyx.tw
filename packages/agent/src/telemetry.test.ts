import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { trace } from "@opentelemetry/api"
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base"

import { tracedFetch } from "./telemetry"

const exporter = new InMemorySpanExporter()
const realFetch = globalThis.fetch

beforeAll(() => {
  trace.setGlobalTracerProvider(
    new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    })
  )
  globalThis.fetch = (async () =>
    new Response('data: {"provider":"Groq","choices":[]}\n\n', {
      status: 200,
    })) as unknown as typeof fetch
})
afterAll(() => {
  globalThis.fetch = realFetch
})

describe("tracedFetch", () => {
  test("ends the span when the body is read, with the upstream provider", async () => {
    exporter.reset()
    const response = await tracedFetch(
      "https://llm.example/v1/chat/completions?key=secret"
    )
    await response.text()
    const [span] = exporter.getFinishedSpans()
    expect(span?.name).toBe("model.http")
    expect(span?.attributes["model.upstream"]).toBe("Groq")
    expect(span?.attributes["url.path"]).toBe("/v1/chat/completions")
    expect(JSON.stringify(span?.attributes)).not.toContain("secret")
  })
  test("ends the span when the body is cancelled", async () => {
    exporter.reset()
    const response = await tracedFetch(
      "https://llm.example/v1/chat/completions"
    )
    await response.body?.cancel()
    expect(exporter.getFinishedSpans().length).toBe(1)
  })
})
