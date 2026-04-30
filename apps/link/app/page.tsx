"use client"

import JSConfetti from "js-confetti"
import { useActionState, useEffect, useRef } from "react"
import { createShortLink } from "./actions"

type ActionState =
  | { ok: true; shortCode: string; shortUrl: string }
  | { ok: false; error: string }
  | null

export default function HomePage() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    createShortLink,
    null
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiRef = useRef<JSConfetti | null>(null)

  useEffect(() => {
    confettiRef.current = new JSConfetti()
  }, [])

  useEffect(() => {
    if (!confettiRef.current) return

    if (isPending) {
      const rect = inputRef.current?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : undefined
      const y = rect ? rect.top + rect.height / 2 : undefined
      void confettiRef.current.addConfetti({
        emojis: ["🔥", "⚡", "✨", "💥"],
        emojiSize: 24,
        confettiNumber: 20,
        ...(x !== undefined && y !== undefined ? { x, y } : {}),
      })
    }
  }, [isPending])

  useEffect(() => {
    if (!confettiRef.current || !state) return

    if (!state.ok) {
      void confettiRef.current.addConfetti({
        emojis: ["💀", "😭", "🤡", "❌"],
        emojiSize: 28,
        confettiNumber: 20,
      })
    }
  }, [state])

  async function handleCopy() {
    if (!state?.ok) return
    await navigator.clipboard.writeText(state.shortUrl)
    void confettiRef.current?.addConfetti({
      emojis: ["📋", "✅", "🎉", "🥳"],
      emojiSize: 28,
      confettiNumber: 30,
    })
  }

  return (
    <main className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 px-4">
      <form
        action={action}
        className="flex w-full max-w-xl flex-col items-center gap-4"
      >
        <input
          ref={inputRef}
          name="url"
          type="url"
          placeholder="https://your-very-long-url.com/goes/here"
          required
          disabled={isPending}
          className="w-full border-0 bg-transparent text-center text-xl text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer border-0 bg-transparent text-3xl transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {isPending ? "⏳" : "🔥"}
        </button>
      </form>

      {state && !state.ok && (
        <p className="text-sm text-muted-foreground">{state.error}</p>
      )}

      {state?.ok && (
        <div className="flex items-center gap-3">
          <a
            href={state.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:underline"
          >
            {state.shortUrl}
          </a>
          <button
            onClick={handleCopy}
            className="cursor-pointer border-0 bg-transparent text-3xl transition-opacity hover:opacity-80"
          >
            📋
          </button>
        </div>
      )}
    </main>
  )
}
