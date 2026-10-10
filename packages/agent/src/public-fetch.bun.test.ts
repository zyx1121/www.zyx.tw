// Under Bun, fetch ignores the undici dispatcher, so publicFetch must refuse
// to run rather than fetch without the pinned lookup.
import { describe, expect, test } from "bun:test"

import { isPrivateAddress, publicFetch } from "./public-fetch"

describe("publicFetch under Bun", () => {
  test("refuses to run", async () => {
    await expect(publicFetch("http://localhost:1/")).rejects.toThrow(
      "needs Node.js"
    )
    await expect(publicFetch("https://example.com/")).rejects.toThrow(
      "needs Node.js"
    )
  })
  test("the address rules still work", () => {
    expect(isPrivateAddress("127.0.0.1")).toBe(true)
    expect(isPrivateAddress("fec0::1")).toBe(true)
    expect(isPrivateAddress("1.1.1.1")).toBe(false)
  })
})
