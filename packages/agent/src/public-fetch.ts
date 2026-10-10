// Requests the server makes on an agent's behalf (a webhook, a page to read,
// an API to probe) may reach public addresses only. The address is checked
// inside the connection's own DNS lookup, so the address that passed is the
// address connected to: a name cannot answer public for the check and
// private for the connection (DNS rebinding). Node.js only.

import { lookup as dnsLookup, type LookupAddress } from "node:dns"
import { isIP } from "node:net"

import { Agent, fetch, Headers, type RequestInit, type Response } from "undici"

/** Why a request was refused, so an app can say it in its own words. */
export type RefusedReason = "scheme" | "private" | "unresolved" | "redirects"

export class FetchRefused extends Error {
  override name = "FetchRefused"
  constructor(
    message: string,
    readonly reason: RefusedReason,
    readonly host?: string
  ) {
    super(message)
  }
}

function ipv4Bytes(address: string): number[] | null {
  const parts = address.split(".")
  if (parts.length !== 4 || !parts.every((part) => /^\d{1,3}$/.test(part)))
    return null
  const bytes = parts.map(Number)
  return bytes.every((byte) => byte <= 255) ? bytes : null
}

/** An IPv6 address as 16 bytes, in any textual form (compressed, zoned, dotted IPv4 tail). */
function ipv6Bytes(address: string): number[] | null {
  let text = address
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/%.*$/, "")
  const tail: number[] = []
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(text)
  if (dotted) {
    const v4 = ipv4Bytes(dotted[1]!)
    if (!v4) return null
    tail.push(...v4)
    text = text.slice(0, -dotted[1]!.length) + "0:0"
  }
  const halves = text.split("::")
  if (halves.length > 2) return null
  const words = (part: string) => (part === "" ? [] : part.split(":"))
  const head = words(halves[0]!)
  const rest = halves.length === 2 ? words(halves[1]!) : []
  const missing = 8 - head.length - rest.length
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null
  const all = [
    ...head,
    ...Array<string>(halves.length === 2 ? missing : 0).fill("0"),
    ...rest,
  ]
  if (all.length !== 8 || !all.every((word) => /^[0-9a-f]{1,4}$/.test(word)))
    return null
  const bytes = all.flatMap((word) => [
    parseInt(word, 16) >> 8,
    parseInt(word, 16) & 0xff,
  ])
  if (tail.length) bytes.splice(12, 4, ...tail)
  return bytes
}

function privateV4([a, b, c]: number[]): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a! >= 224 ||
    (a === 100 && b! >= 64 && b! <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b! >= 16 && b! <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  )
}

/**
 * Loopback, private, link-local, carrier-grade NAT, multicast, documentation
 * and other non-public ranges, in any notation. An IPv4 address carried in
 * IPv6 (mapped, compatible, NAT64, 6to4) is judged as that IPv4 address;
 * Teredo is refused outright, and so is anything that does not parse.
 */
export function isPrivateAddress(address: string): boolean {
  const v4 = ipv4Bytes(address)
  if (v4) return privateV4(v4)
  const b = ipv6Bytes(address)
  if (!b) return true
  const zeros = (from: number, to: number) =>
    b.slice(from, to).every((x) => x === 0)
  const embedded = b.slice(12, 16)
  if (zeros(0, 10) && b[10] === 0xff && b[11] === 0xff)
    return privateV4(embedded) // ::ffff:a.b.c.d
  if (zeros(0, 8) && b[8] === 0xff && b[9] === 0xff && zeros(10, 12))
    return privateV4(embedded) // ::ffff:0:a.b.c.d
  if (zeros(0, 12)) return zeros(12, 15) ? true : privateV4(embedded) // ::, ::1, ::a.b.c.d
  if (b[0] === 0x00 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b)
    return zeros(4, 12) ? privateV4(embedded) : true // NAT64
  if (b[0] === 0x20 && b[1] === 0x02) return privateV4(b.slice(2, 6)) // 6to4
  if (b[0] === 0x20 && b[1] === 0x01 && b[2] === 0x00 && b[3] === 0x00)
    return true // Teredo
  if (b[0] === 0x20 && b[1] === 0x01 && b[2] === 0x0d && b[3] === 0xb8)
    return true // documentation
  if (b[0] === 0x01 && zeros(1, 8)) return true // discard-only 100::/64
  return (
    (b[0]! & 0xfe) === 0xfc ||
    (b[0] === 0xfe && (b[1]! & 0xc0) === 0x80) ||
    (b[0] === 0xfe && (b[1]! & 0xc0) === 0xc0) ||
    b[0] === 0xff
  )
}

type Resolve = (
  hostname: string,
  callback: (error: Error | null, addresses: LookupAddress[]) => void
) => void

const resolveAll: Resolve = (hostname, callback) =>
  dnsLookup(hostname, { all: true, verbatim: true }, callback)

const normalize = (host: string) => host.toLowerCase().replace(/^\[|\]$/g, "")

/**
 * A net.connect lookup that answers only when every address the name
 * resolves to is public (or the name or address is allowed). The connection
 * then uses those same addresses.
 */
export function publicLookup(
  allow: Set<string>,
  resolve: Resolve = resolveAll
) {
  return (
    hostname: string,
    options: { all?: boolean },
    callback: (
      error: Error | null,
      address: string | LookupAddress[],
      family?: number
    ) => void
  ) => {
    resolve(hostname, (error, addresses) => {
      if (error) return callback(error, "")
      if (addresses.length === 0)
        return callback(
          new FetchRefused(
            `${hostname} does not resolve`,
            "unresolved",
            hostname
          ),
          ""
        )
      const blocked = addresses.filter(
        (entry) =>
          !allow.has(normalize(hostname)) &&
          !allow.has(normalize(entry.address)) &&
          isPrivateAddress(entry.address)
      )
      if (blocked.length > 0)
        return callback(
          new FetchRefused(
            `${hostname} is not a public address`,
            "private",
            hostname
          ),
          ""
        )
      if (options.all) return callback(null, addresses)
      callback(null, addresses[0]!.address, addresses[0]!.family)
    })
  }
}

const BUN_REFUSAL =
  "agent-public-fetch needs Node.js: Bun's fetch ignores the undici dispatcher, so private addresses would not be refused"

/**
 * An undici dispatcher whose every connection goes through publicLookup.
 * Node.js only: under Bun it throws, because Bun's fetch would ignore it.
 */
export function publicAgent(
  options: { allow?: Iterable<string>; resolve?: Resolve } = {}
) {
  if (process.versions.bun) throw new Error(BUN_REFUSAL)
  const allow = new Set([...(options.allow ?? [])].map(normalize))
  return new Agent({
    connect: { lookup: publicLookup(allow, options.resolve) },
  })
}

// One dispatcher per allow list, so connections are pooled. Allow lists come
// from configuration, so there are few; past 16 the least recently used is
// closed.
// close() lets requests already sent finish, and publicFetch looks its
// dispatcher up again on every redirect, so a closed one is never reused.
const agents = new Map<string, Agent>()

function agentFor(allow: Set<string>) {
  const key = [...allow].sort().join(",")
  let agent = agents.get(key)
  // Map order is the eviction order: a dispatcher in use moves to the back.
  if (agent) {
    agents.delete(key)
    agents.set(key, agent)
  } else {
    if (agents.size >= 16) {
      const [oldest, closing] = agents.entries().next().value!
      agents.delete(oldest)
      void closing.close().catch(() => {})
    }
    agents.set(key, (agent = publicAgent({ allow })))
  }
  return agent
}

const DNS_FAILURES = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "EAI_NODATA",
  "EAI_NONAME",
])

/**
 * fetch to public addresses only, following up to maxRedirects redirects that
 * stay public. allow names hosts or exact addresses the operator permits
 * although they are private. Node.js only: Bun's fetch ignores the undici
 * dispatcher, so the pinned lookup would never run; under Bun it throws.
 */
export async function publicFetch(
  target: string | URL,
  init: RequestInit = {},
  options: { timeoutMs?: number; maxRedirects?: number; allow?: string[] } = {}
): Promise<Response> {
  if (process.versions.bun) throw new Error(BUN_REFUSAL)
  const allow = new Set((options.allow ?? []).map(normalize))
  // One deadline for the request and every redirect it follows, and the
  // caller's own signal too.
  const timeout = AbortSignal.timeout(options.timeoutMs ?? 20_000)
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
  let url = new URL(target)
  let request: RequestInit = { ...init, headers: new Headers(init.headers) }
  for (let hop = 0; ; hop++) {
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new FetchRefused(
        "only http and https URLs can be fetched",
        "scheme"
      )
    // A literal address never reaches the lookup, so it is checked here.
    const host = normalize(url.hostname)
    if (isIP(host) && isPrivateAddress(host) && !allow.has(host))
      throw new FetchRefused(`${host} is not a public address`, "private", host)
    const response = await fetch(url, {
      ...request,
      redirect: "manual",
      dispatcher: agentFor(allow),
      signal,
    }).catch((error: Error) => {
      // A refusal from the lookup arrives wrapped in fetch's TypeError, and
      // so does a name that does not resolve.
      const cause = error.cause as (Error & { code?: string }) | undefined
      if (cause instanceof FetchRefused) throw cause
      if (cause?.code && DNS_FAILURES.has(cause.code))
        throw new FetchRefused(`${host} does not resolve`, "unresolved", host)
      throw error
    })
    const location = response.headers.get("location")
    if (response.status < 300 || response.status >= 400 || !location)
      return response
    if (hop >= (options.maxRedirects ?? 5)) {
      await response.body?.cancel()
      throw new FetchRefused("too many redirects", "redirects")
    }
    await response.body?.cancel()
    const next = new URL(location, url)
    // Authorization, Cookie and Proxy-Authorization never follow a redirect
    // to another site. Other headers (an x-api-key) and a 307/308 body do,
    // as in fetch itself: put such credentials only on requests that do not
    // redirect, or pass maxRedirects: 0.
    if (next.origin !== url.origin) {
      const headers = new Headers(request.headers)
      for (const name of ["authorization", "cookie", "proxy-authorization"])
        headers.delete(name)
      request = { ...request, headers }
    }
    const post = request.method?.toUpperCase() === "POST"
    if (
      response.status === 303 ||
      ((response.status === 301 || response.status === 302) && post)
    )
      request = { ...request, method: "GET", body: undefined }
    url = next
  }
}
