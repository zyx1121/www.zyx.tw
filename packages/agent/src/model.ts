// The model behind an agent: any OpenAI-compatible endpoint (llm.winlab.tw,
// OpenRouter, a local vLLM), through the Responses API or Chat Completions,
// traced and patient with rate limits.

import { AsyncLocalStorage } from "node:async_hooks"

import { createOpenAI } from "@ai-sdk/openai"
import { trace } from "@opentelemetry/api"
import type { LanguageModel } from "ai"

import { tracedFetch } from "./telemetry"

export type ModelConfig = {
  baseUrl: string
  model: string
  apiKey: string
  api: "responses" | "chat"
  /** Extra request headers. Some endpoints put credentials here, so they are never logged. */
  headers: Record<string, string>
}

function required(env: Record<string, string | undefined>, name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`${name} is not set`)
  return value
}

/**
 * Reads `<prefix>MODEL_BASE_URL`, `<prefix>MODEL_API_KEY`, `<prefix>MODEL`,
 * `<prefix>MODEL_API` ("responses" or "chat", default "chat": most gateways
 * have no Responses API) and `<prefix>MODEL_HEADERS` (a JSON object).
 */
export function modelConfigFromEnv(
  prefix = "",
  env: Record<string, string | undefined> = process.env
): ModelConfig {
  const api = env[`${prefix}MODEL_API`] || "chat"
  if (api !== "responses" && api !== "chat")
    throw new Error(`${prefix}MODEL_API must be "responses" or "chat"`)
  let headers: unknown
  try {
    headers = JSON.parse(env[`${prefix}MODEL_HEADERS`] || "{}")
  } catch {
    // The parser's message can quote the value, which may hold a key.
    throw new Error(`${prefix}MODEL_HEADERS is not valid JSON`)
  }
  if (
    typeof headers !== "object" ||
    headers === null ||
    Array.isArray(headers) ||
    !Object.values(headers).every((value) => typeof value === "string")
  )
    throw new Error(`${prefix}MODEL_HEADERS must be a JSON object of strings`)
  return {
    baseUrl: required(env, `${prefix}MODEL_BASE_URL`),
    model: required(env, `${prefix}MODEL`),
    apiKey: required(env, `${prefix}MODEL_API_KEY`),
    api,
    headers: headers as Record<string, string>,
  }
}

/**
 * Who hears that a model call is waiting out a rate limit, for example a
 * chat that tells the person how long:
 * `modelWaits.run((ms) => write({ type: "data-status", ... }), () => streamText(...))`.
 */
export const modelWaits = new AsyncLocalStorage<(waitMs: number) => void>()

const RESETS_AT =
  /resets at:?\s*(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s*UTC/i

/** How long a 429 asks to wait: Retry-After, else a "resets at ... UTC" time in the body. */
export async function rateLimitWait(
  response: Response,
  now = Date.now()
): Promise<number | null> {
  const header = response.headers.get("retry-after")
  if (header) {
    const seconds = Number(header)
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
    const at = Date.parse(header)
    if (!Number.isNaN(at)) return Math.max(0, at - now)
  }
  const body = await response
    .clone()
    .text()
    .catch(() => "")
  const match = RESETS_AT.exec(body)
  if (match)
    return Math.max(0, Date.parse(`${match[1]!.replace(" ", "T")}Z`) - now)
  return null
}

type Fetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>

/**
 * A gateway with a token budget per minute answers 429 until the minute
 * resets, which outlasts the SDK's quick retries. Wait for the reset, up to
 * maxWaitMs in all, then hand the 429 to the SDK.
 */
export function waitOutRateLimits(
  inner: Fetch,
  options: {
    maxWaitMs?: number
    sleep?: (ms: number, signal?: AbortSignal | null) => Promise<void>
  } = {}
): typeof fetch {
  const maxWaitMs = options.maxWaitMs ?? 180_000
  const sleep =
    options.sleep ??
    ((ms, signal) =>
      new Promise<void>((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason)
        const timer = setTimeout(resolve, ms)
        signal?.addEventListener(
          "abort",
          () => (clearTimeout(timer), reject(signal.reason)),
          { once: true }
        )
      }))
  return (async (input: string | URL | Request, init?: RequestInit) => {
    let waited = 0
    for (;;) {
      const response = await inner(input, init)
      if (response.status !== 429) return response
      const wait =
        Math.min((await rateLimitWait(response)) ?? 15_000, 90_000) + 1_000
      if (waited + wait > maxWaitMs) return response
      trace
        .getActiveSpan()
        ?.addEvent("model.rate_limited", { "model.wait_ms": wait })
      modelWaits.getStore()?.(wait)
      await response.body?.cancel().catch(() => {})
      await sleep(wait, init?.signal)
      waited += wait
    }
  }) as typeof fetch
}

/** The AI SDK model for a config, with traced requests and rate-limit waits. */
export function buildModel(
  config: ModelConfig,
  options: { fetch?: typeof fetch } = {}
): LanguageModel {
  const provider = createOpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    headers: config.headers,
    fetch: waitOutRateLimits(options.fetch ?? tracedFetch),
  })
  return config.api === "chat"
    ? provider.chat(config.model)
    : provider.responses(config.model)
}
