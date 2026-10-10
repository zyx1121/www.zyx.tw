// Credentials an agent uses but never sees. Values are sealed with
// AES-256-GCM before they reach the database, opened only on the server when
// a step needs them, and scrubbed from anything the model, a page or a log
// gets back.

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto"

/** The shortest secret sealKey accepts. */
export const MIN_SECRET = 32

export class SealError extends Error {
  override name = "SealError"
}

/** The 32-byte key from a server secret (for example SEAL_SECRET). */
export function sealKey(secret: string | undefined): Buffer {
  if (!secret || secret.length < MIN_SECRET)
    throw new Error(`the seal secret needs at least ${MIN_SECRET} characters`)
  return createHash("sha256").update(secret).digest()
}

/** iv (12 bytes), tag (16), then the encrypted JSON. */
export function seal(key: Buffer, value: unknown): Buffer {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const body = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ])
  return Buffer.concat([iv, cipher.getAuthTag(), body])
}

/** The value seal stored; a wrong key or a changed byte throws SealError. */
export function open<T = Record<string, string>>(
  key: Buffer,
  sealed: Uint8Array
): T {
  const data = Buffer.from(sealed)
  try {
    if (data.length < 28) throw new Error("too short")
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      data.subarray(0, 12),
      {
        authTagLength: 16,
      }
    )
    decipher.setAuthTag(data.subarray(12, 28))
    const text = Buffer.concat([
      decipher.update(data.subarray(28)),
      decipher.final(),
    ]).toString("utf8")
    return JSON.parse(text) as T
  } catch {
    throw new SealError(
      "a sealed value could not be opened: is the key the one it was sealed with?"
    )
  }
}

// Shorter values would match ordinary text everywhere.
const MIN_REDACTED = 4

/**
 * Replace every secret value in a string, or in every string of a JSON-like
 * value (keys included), with [NAME]. Also catches the forms a value takes
 * inside JSON text and URLs. Longer values go first, so a secret that
 * contains another is replaced whole.
 */
export function redact<T>(value: T, secrets: Record<string, string>): T {
  const pairs: [string, string][] = []
  for (const [name, secret] of Object.entries(secrets)) {
    if (secret.length < MIN_REDACTED) continue
    const forms = new Set([
      secret,
      JSON.stringify(secret).slice(1, -1),
      encodeURIComponent(secret),
    ])
    for (const form of forms) pairs.push([form, `[${name}]`])
  }
  if (pairs.length === 0) return value
  pairs.sort((a, b) => b[0].length - a[0].length)
  const scrub = (text: string) =>
    pairs.reduce((out, [form, mask]) => out.split(form).join(mask), text)
  const walk = (item: unknown): unknown => {
    if (typeof item === "string") return scrub(item)
    if (Array.isArray(item)) return item.map(walk)
    if (item && typeof item === "object" && !(item instanceof Date))
      return Object.fromEntries(
        Object.entries(item).map(([key, inner]) => [scrub(key), walk(inner)])
      )
    return item
  }
  return walk(value) as T
}
