import { describe, expect, test } from "bun:test"

import { modelConfigFromEnv, rateLimitWait, waitOutRateLimits } from "./model"

describe("modelConfigFromEnv", () => {
  test("reads the prefixed variables and defaults to chat", () => {
    const config = modelConfigFromEnv("HANDY_", {
      HANDY_MODEL_BASE_URL: "https://llm.example/v1",
      HANDY_MODEL_API_KEY: "key",
      HANDY_MODEL: "qwen",
      HANDY_MODEL_HEADERS: '{"X-Title":"Handy"}',
    })
    expect(config).toEqual({
      baseUrl: "https://llm.example/v1",
      apiKey: "key",
      model: "qwen",
      api: "chat",
      headers: { "X-Title": "Handy" },
    })
  })

  test("rejects a missing value, an unknown API and non-string headers", () => {
    const base = { MODEL_BASE_URL: "u", MODEL_API_KEY: "k", MODEL: "m" }
    expect(() => modelConfigFromEnv("", { ...base, MODEL: "" })).toThrow(
      "MODEL is not set"
    )
    expect(() => modelConfigFromEnv("", { ...base, MODEL_API: "x" })).toThrow(
      "MODEL_API"
    )
    expect(() =>
      modelConfigFromEnv("", { ...base, MODEL_HEADERS: '{"a":1}' })
    ).toThrow("MODEL_HEADERS")
  })
})

describe("rateLimitWait", () => {
  const now = Date.parse("2026-10-10T00:00:00Z")
  test("Retry-After in seconds or as a date", async () => {
    expect(
      await rateLimitWait(
        new Response("", { status: 429, headers: { "retry-after": "7" } }),
        now
      )
    ).toBe(7000)
    expect(
      await rateLimitWait(
        new Response("", {
          status: 429,
          headers: { "retry-after": "Sat, 10 Oct 2026 00:00:30 GMT" },
        }),
        now
      )
    ).toBe(30_000)
  })
  test("a resets-at time in the body, or nothing", async () => {
    expect(
      await rateLimitWait(
        new Response("limit resets at: 2026-10-10 00:01:00 UTC", {
          status: 429,
        }),
        now
      )
    ).toBe(60_000)
    expect(
      await rateLimitWait(new Response("slow down", { status: 429 }), now)
    ).toBeNull()
  })
})

describe("waitOutRateLimits", () => {
  test("waits for the reset, then returns the next answer", async () => {
    const answers = [
      new Response("", { status: 429, headers: { "retry-after": "2" } }),
      new Response("ok"),
    ]
    const slept: number[] = []
    const fetch = waitOutRateLimits(async () => answers.shift()!, {
      sleep: async (ms) => void slept.push(ms),
    })
    const response = await fetch("https://llm.example/v1/chat/completions")
    expect(await response.text()).toBe("ok")
    expect(slept).toEqual([3000])
  })
  test("hands the 429 back once the waits would pass maxWaitMs", async () => {
    let calls = 0
    const fetch = waitOutRateLimits(
      async () => (
        calls++,
        new Response("", { status: 429, headers: { "retry-after": "60" } })
      ),
      { maxWaitMs: 100_000, sleep: async () => {} }
    )
    expect((await fetch("https://llm.example")).status).toBe(429)
    expect(calls).toBe(2)
  })
})
