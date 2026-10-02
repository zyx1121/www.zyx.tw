import { describe, expect, mock, test } from "bun:test"
import {
  cookieDomain,
  localeCookie,
  localeUrl,
  mergeMessages,
  resolveLocale,
  translator,
} from "./i18n"
import { localeProxy } from "./i18n-proxy"
import { NextRequest } from "next/server"

mock.module("next/headers", () => ({
  headers: async () => new Headers({ "x-zyx-locale": "zh-TW" }),
  cookies: async () => ({ get: () => undefined }),
}))
const { localizedMetadata } = await import("./i18n-server")

describe("shared language contract", () => {
  test("page metadata inherits omitted layout fields and preserves explicit overrides", async () => {
    const page = await localizedMetadata(
      { alternates: { canonical: "/" } },
      {},
      "/"
    )
    expect(page).not.toHaveProperty("title")
    expect(page).not.toHaveProperty("description")
    expect(page.alternates.canonical).toBe("/")
    const explicit = await localizedMetadata(
      { title: "Example", description: null },
      { "zh-TW": { Example: "範例" } }
    )
    expect(explicit.title).toBe("範例")
    expect(explicit.description).toBeNull()
  })
  test("explicit supported language wins; otherwise use cookie then Traditional Chinese", () => {
    expect(resolveLocale()).toBe("zh-TW")
    expect(resolveLocale("fr", "en")).toBe("en")
    expect(resolveLocale("en", "zh-TW")).toBe("en")
    expect(resolveLocale("zh-TW", "en")).toBe("zh-TW")
    expect(resolveLocale("zh", "fr")).toBe("zh-TW")
  })
  test("the shared cookie is restricted to the owned domain boundary", () => {
    for (const host of ["zyx.tw", "www.zyx.tw", "book.dev.zyx.tw"])
      expect(cookieDomain(host)).toBe(".zyx.tw")
    for (const host of ["localhost", "evilzyx.tw", "zyx.tw.attacker.test"])
      expect(cookieDomain(host)).toBeUndefined()
    expect(localeCookie("en", "ui.zyx.tw", true)).toContain(
      "; Domain=.zyx.tw; Secure"
    )
    expect(localeCookie("en", "localhost", false)).not.toContain("Domain=")
  })
  test("switching preserves unrelated query values and fragment", () => {
    expect(localeUrl("/made/carrel?mode=photo&lang=zh-TW#story", "en")).toBe(
      "/made/carrel?mode=photo&lang=en#story"
    )
    expect(localeUrl("https://plump.zyx.tw/?scene=a%2Bb#edit", "zh-TW")).toBe(
      "https://plump.zyx.tw/?scene=a%2Bb&lang=zh-TW#edit"
    )
  })
  test("interpolation keeps values verbatim and dictionaries do not leak across requests", () => {
    const messages = mergeMessages({
      "zh-TW": { "Hello {name}": "你好，{name}" },
    })
    expect(
      translator("zh-TW", messages)("Hello {name}", { name: "Save" })
    ).toBe("你好，Save")
    expect(translator("en", messages)("Hello {name}", { name: "儲存" })).toBe(
      "Hello 儲存"
    )
    expect(translator("zh-TW", messages)("unknown {value}")).toBe(
      "unknown {value}"
    )
  })
  test("the proxy rejects spoofed headers and persists only explicit supported selections", () => {
    const req = new NextRequest("https://www.zyx.tw/?lang=en", {
      headers: { cookie: "zyx_locale=zh-TW", "x-zyx-locale": "fr" },
    })
    const res = localeProxy(req)
    expect(res.headers.get("x-middleware-request-x-zyx-locale")).toBe("en")
    expect(res.headers.get("content-language")).toBe("en")
    expect(res.headers.get("set-cookie")).toContain("Domain=.zyx.tw")
    const invalid = localeProxy(
      new NextRequest("https://www.zyx.tw/?lang=fr", {
        headers: { "x-zyx-locale": "en" },
      })
    )
    expect(invalid.headers.get("x-middleware-request-x-zyx-locale")).toBe(
      "zh-TW"
    )
    expect(invalid.headers.get("set-cookie")).toBeNull()
  })
})
