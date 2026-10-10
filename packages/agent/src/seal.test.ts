import { describe, expect, test } from "bun:test"

import { open, redact, seal, SealError, sealKey } from "./seal"

const key = sealKey("x".repeat(32))

describe("seal and open", () => {
  test("round trip", () => {
    const values = { USERNAME: "loki", PASSWORD: "p@ss word" }
    expect(open<typeof values>(key, seal(key, values))).toEqual(values)
  })
  test("a fresh iv every time", () => {
    expect(seal(key, { a: "1" }).equals(seal(key, { a: "1" }))).toBe(false)
  })
  test("a wrong key, a changed byte or a short value throw SealError", () => {
    const sealed = seal(key, { a: "1" })
    expect(() => open(sealKey("y".repeat(32)), sealed)).toThrow(SealError)
    const changed = Buffer.from(sealed)
    changed[changed.length - 1]! ^= 1
    expect(() => open(key, changed)).toThrow(SealError)
    expect(() => open(key, sealed.subarray(0, 20))).toThrow(SealError)
  })
  test("the secret must be long enough", () => {
    expect(() => sealKey("short")).toThrow()
    expect(() => sealKey(undefined)).toThrow()
  })
})

describe("redact", () => {
  const secrets = { DB_PASSWORD: 'p"a/ss w0rd', TOKEN: "abcd1234", PIN: "123" }
  test("strings, nested values and keys", () => {
    expect(redact('login with p"a/ss w0rd', secrets)).toBe(
      "login with [DB_PASSWORD]"
    )
    expect(
      redact<unknown>({ list: ["abcd1234"], abcd1234: 1, n: 5 }, secrets)
    ).toEqual({
      list: ["[TOKEN]"],
      "[TOKEN]": 1,
      n: 5,
    })
  })
  test("the forms a value takes in JSON text and URLs", () => {
    expect(redact('{"password":"p\\"a/ss w0rd"}', secrets)).toBe(
      '{"password":"[DB_PASSWORD]"}'
    )
    expect(redact("https://x.test/?p=p%22a%2Fss%20w0rd", secrets)).toBe(
      "https://x.test/?p=[DB_PASSWORD]"
    )
  })
  test("form encoding, lowercase escapes, base64 and numbers", () => {
    expect(redact("p=p%22a%2Fss+w0rd", secrets)).toBe("p=[DB_PASSWORD]")
    expect(redact("p=p%22a%2fss%20w0rd", secrets)).toBe("p=[DB_PASSWORD]")
    expect(redact(Buffer.from('p"a/ss w0rd').toString("base64"), secrets)).toBe(
      "[DB_PASSWORD]"
    )
    expect(redact<unknown>({ pin: 123456 }, { PIN: "123456" })).toEqual({
      pin: "[PIN]",
    })
    expect(redact<unknown>({ n: 7 }, { PIN: "123456" })).toEqual({ n: 7 })
  })
  test("values too short to be secrets are left alone", () => {
    expect(redact("call 123", secrets)).toBe("call 123")
  })
  test("a secret inside another is replaced whole", () => {
    expect(
      redact("abcd12345678", { SHORT: "abcd", LONG: "abcd12345678" })
    ).toBe("[LONG]")
  })
})
