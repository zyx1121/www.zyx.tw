// Runs under Node (tsx --test), where the undici dispatcher drives fetch.
import assert from "node:assert/strict"
import { createServer, type Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, describe, test } from "node:test"

import {
  FetchRefused,
  isPrivateAddress,
  publicFetch,
  publicLookup,
} from "./public-fetch"

describe("isPrivateAddress", () => {
  test("private, loopback and special ranges in any notation", () => {
    for (const address of [
      "127.0.0.1",
      "10.1.2.3",
      "172.16.0.1",
      "192.168.1.48",
      "169.254.169.254",
      "100.64.0.1",
      "0.0.0.0",
      "::1",
      "::",
      "fe80::1",
      "fc00::1",
      "::ffff:127.0.0.1",
      "::ffff:7f00:1",
      "64:ff9b::a00:1",
      "2002:a00:1::",
      "2001:0:4136:e378::1",
      "2001:db8::1",
      "fec0::1",
      "not an address",
    ])
      assert.equal(isPrivateAddress(address), true, address)
  })
  test("public addresses", () => {
    for (const address of [
      "140.113.194.229",
      "1.1.1.1",
      "2606:4700:4700::1111",
      "::ffff:8.8.8.8",
      "64:ff9b::808:808",
    ])
      assert.equal(isPrivateAddress(address), false, address)
  })
})

describe("publicLookup", () => {
  const lookup = (answers: string[], allow: string[] = []) =>
    new Promise<unknown>((resolve) =>
      publicLookup(new Set(allow), (_host, callback) =>
        callback(
          null,
          answers.map((address) => ({
            address,
            family: address.includes(":") ? 6 : 4,
          }))
        )
      )("site.test", { all: true }, (error, addresses) =>
        resolve(error ?? addresses)
      )
    )
  test("answers with the addresses it checked", async () => {
    assert.deepEqual(await lookup(["1.1.1.1"]), [
      { address: "1.1.1.1", family: 4 },
    ])
  })
  test("refuses a name with any private answer", async () => {
    assert.ok((await lookup(["1.1.1.1", "10.0.0.1"])) instanceof FetchRefused)
  })
  test("an allowed name or address passes", async () => {
    assert.ok(Array.isArray(await lookup(["10.0.0.1"], ["site.test"])))
    assert.ok(Array.isArray(await lookup(["10.0.0.1"], ["10.0.0.1"])))
  })
})

describe("publicFetch", () => {
  let first: Server
  let second: Server
  let firstPort = 0
  let secondPort = 0
  before(async () => {
    second = createServer((request, response) =>
      response.end(
        JSON.stringify({ auth: request.headers.authorization ?? null })
      )
    )
    first = createServer((request, response) => {
      if (request.url === "/slow") return
      if (request.url === "/late") {
        setTimeout(() => {
          response.writeHead(302, { location: "/" })
          response.end()
        }, 600)
        return
      }
      if (request.url === "/away") {
        response.writeHead(302, { location: `http://localhost:${secondPort}/` })
        return response.end()
      }
      response.end(
        JSON.stringify({ auth: request.headers.authorization ?? null })
      )
    })
    await Promise.all([
      new Promise<void>((r) => first.listen(0, "127.0.0.1", r)),
      new Promise<void>((r) => second.listen(0, "127.0.0.1", r)),
    ])
    firstPort = (first.address() as AddressInfo).port
    secondPort = (second.address() as AddressInfo).port
  })
  after(() => {
    first.close()
    second.close()
  })

  test("refuses literal private addresses and other schemes", async () => {
    await assert.rejects(
      publicFetch(`http://127.0.0.1:${firstPort}/`),
      FetchRefused
    )
    await assert.rejects(
      publicFetch("http://[::ffff:127.0.0.1]/"),
      FetchRefused
    )
    await assert.rejects(publicFetch("file:///etc/passwd"), FetchRefused)
  })
  test("refuses a name that resolves to a private address, at connect time", async () => {
    await assert.rejects(
      publicFetch(`http://localhost:${firstPort}/`),
      (error: unknown) =>
        error instanceof FetchRefused &&
        error.reason === "private" &&
        error.host === "localhost"
    )
  })
  test("a name that does not resolve is refused as unresolved", async () => {
    await assert.rejects(
      publicFetch("http://nothing-here.invalid/"),
      (error: unknown) =>
        error instanceof FetchRefused && error.reason === "unresolved"
    )
  })
  test("a request whose dispatcher is evicted from the pool still finishes, redirect included", async () => {
    const late = publicFetch(
      `http://localhost:${firstPort}/late`,
      {},
      { allow: ["localhost"] }
    )
    // 16 more allow lists push the localhost dispatcher out of the pool.
    await Promise.all(
      Array.from({ length: 16 }, (_, i) =>
        publicFetch(
          `http://localhost:${firstPort}/`,
          {},
          { allow: ["localhost", `other-${i}.test`] }
        ).then((r) => r.text())
      )
    )
    const response = await late
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { auth: null })
  })
  test("the timeout holds even when the caller passes a signal", async () => {
    const caller = new AbortController()
    await assert.rejects(
      publicFetch(
        `http://localhost:${firstPort}/slow`,
        { signal: caller.signal },
        { allow: ["localhost"], timeoutMs: 300 }
      ),
      (error: Error) =>
        error.name === "TimeoutError" || String(error.cause).includes("Timeout")
    )
  })
  test("an allowed host connects, and credentials do not follow a redirect to another origin", async () => {
    const init = { headers: { authorization: "Bearer secret" } }
    const direct = await publicFetch(`http://localhost:${firstPort}/`, init, {
      allow: ["localhost"],
    })
    assert.deepEqual(await direct.json(), { auth: "Bearer secret" })
    const moved = await publicFetch(
      `http://localhost:${firstPort}/away`,
      init,
      { allow: ["localhost"] }
    )
    assert.deepEqual(await moved.json(), { auth: null })
  })
})
