"use client"

import JSConfetti from "js-confetti"
import { useActionState, useEffect, useRef } from "react"

import { Button } from "@workspace/ui/components/ui/button"
import { Input } from "@workspace/ui/components/ui/input"

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
        <Input
          ref={inputRef}
          name="url"
          type="url"
          aria-label="URL to shorten"
          placeholder="https://your-very-long-url.com/goes/here"
          required
          disabled={isPending}
          className="h-auto rounded-none border-0 bg-transparent p-0 text-center font-mono text-xl text-foreground focus-visible:ring-0 disabled:bg-transparent md:text-xl dark:bg-transparent dark:disabled:bg-transparent"
        />
        <Button
          type="submit"
          variant="ghost"
          disabled={isPending}
          aria-label={isPending ? "Shortening URL" : "Shorten URL"}
          className="h-auto p-0 text-3xl transition-opacity hover:bg-transparent hover:opacity-80 disabled:opacity-40 dark:hover:bg-transparent"
        >
          <span aria-hidden="true">{isPending ? "⏳" : "🔥"}</span>
        </Button>
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
            className="font-mono text-xl hover:underline"
          >
            {state.shortUrl}
          </a>
          <Button
            variant="ghost"
            onClick={handleCopy}
            aria-label="Copy short URL"
            className="h-auto p-0 text-3xl transition-opacity hover:bg-transparent hover:opacity-80 dark:hover:bg-transparent"
          >
            <span aria-hidden="true">📋</span>
          </Button>
        </div>
      )}
    </main>
  )
}
