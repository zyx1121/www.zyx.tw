"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/ui/dialog"

import type { BlockKind } from "@/components/block"
import { createClient } from "@/utils/supabase/client"

const URL_RE = /^https?:\/\/\S+$/

type Draft = {
  kind: BlockKind
  title: string
  content: string
  tags: string
  is_public: boolean
  metadata: Record<string, unknown>
}

const EMPTY_DRAFT: Draft = {
  kind: "text",
  title: "",
  content: "",
  tags: "",
  is_public: true,
  metadata: {},
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/30 focus:outline-none"

function detectKind(value: string): BlockKind {
  return URL_RE.test(value.trim()) ? "link" : "text"
}

function readImageDims(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(dims)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

async function uploadImage(file: File): Promise<{
  url: string
  width: number | null
  height: number | null
}> {
  const supabase = createClient()
  const dims = await readImageDims(file)
  const ext = file.name.split(".").pop() ?? "png"
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from("things")
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from("things").getPublicUrl(path)
  return {
    url: data.publicUrl,
    width: dims?.width ?? null,
    height: dims?.height ?? null,
  }
}

export function NewBlockShell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlightUpload = useRef(false)

  const openWithDraft = useCallback((next: Partial<Draft>) => {
    setDraft({ ...EMPTY_DRAFT, ...next })
    setError(null)
    setOpen(true)
  }, [])

  const ingestText = useCallback(
    (text: string) => {
      if (!text) return
      openWithDraft({ kind: detectKind(text), content: text })
    },
    [openWithDraft]
  )

  const ingestFile = useCallback(
    async (file: File) => {
      if (file.type.startsWith("image/")) {
        if (inFlightUpload.current) return
        inFlightUpload.current = true
        setBusy(true)
        setError(null)
        try {
          const { url, width, height } = await uploadImage(file)
          const metadata: Record<string, unknown> = {
            size: file.size,
            type: file.type,
          }
          if (width) metadata.width = width
          if (height) metadata.height = height
          openWithDraft({
            kind: "image",
            title: file.name,
            content: url,
            metadata,
          })
        } catch (e) {
          setError(e instanceof Error ? e.message : "upload failed")
          setOpen(true)
        } finally {
          setBusy(false)
          inFlightUpload.current = false
        }
        return
      }
      if (file.type.startsWith("video/")) {
        setError(
          "Direct video upload isn't wired up yet — paste a YouTube / Vimeo URL instead."
        )
        setOpen(true)
        return
      }
      // text/markdown/plain — read as text
      const text = await file.text()
      openWithDraft({
        kind: "text",
        title: file.name,
        content: text,
      })
    },
    [openWithDraft]
  )

  // Drop zone on the document — anywhere on the page accepts a drop.
  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (!e.dataTransfer) return
      const types = e.dataTransfer.types
      if (
        types.includes("Files") ||
        types.includes("text/uri-list") ||
        types.includes("text/plain")
      ) {
        e.preventDefault()
      }
    }
    async function onDrop(e: DragEvent) {
      if (!e.dataTransfer) return
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        await ingestFile(file)
        return
      }
      const url = e.dataTransfer.getData("text/uri-list")
      if (url) {
        ingestText(url)
        return
      }
      const text = e.dataTransfer.getData("text/plain")
      if (text) ingestText(text)
    }
    document.addEventListener("dragover", onDragOver)
    document.addEventListener("drop", onDrop)
    return () => {
      document.removeEventListener("dragover", onDragOver)
      document.removeEventListener("drop", onDrop)
    }
  }, [ingestFile, ingestText])

  // Paste anywhere on the page (skip when typing inside a form input).
  useEffect(() => {
    async function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable=true], dialog"))
        return
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            await ingestFile(file)
            return
          }
        }
      }
      const text = e.clipboardData?.getData("text") ?? ""
      if (text.trim()) {
        e.preventDefault()
        ingestText(text)
      }
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [ingestFile, ingestText])

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: draft.kind,
          title: draft.title.trim() || null,
          content: draft.content,
          metadata: draft.metadata,
          tags: draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          is_public: draft.is_public,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      setOpen(false)
      setDraft(EMPTY_DRAFT)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          openWithDraft({ kind: "text", content: "", is_public: true })
        }
        aria-label="New block"
        className="fixed top-4 right-4 z-50 cursor-pointer font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        new
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>new {draft.kind}</DialogTitle>
            <DialogDescription>
              drop a file, paste anywhere, or fill in by hand.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-1.5 text-xs">
              {(["text", "link", "image", "video"] as BlockKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, kind: k }))}
                  className={`rounded-full border px-3 py-1 transition-colors ${
                    draft.kind === k
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <input
              placeholder="title (optional)"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              className={inputClass}
            />

            {draft.kind === "image" && draft.content ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.content}
                alt="preview"
                className="max-h-64 w-full rounded-lg border border-border object-contain"
              />
            ) : (
              <textarea
                placeholder={
                  draft.kind === "link"
                    ? "https://..."
                    : draft.kind === "image"
                      ? "image URL"
                      : draft.kind === "video"
                        ? "https://youtube.com/watch?v=..."
                        : "what's worth keeping?"
                }
                rows={5}
                value={draft.content}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, content: e.target.value }))
                }
                className={`${inputClass} resize-none`}
              />
            )}

            <input
              placeholder="tags, comma, separated"
              value={draft.tags}
              onChange={(e) =>
                setDraft((d) => ({ ...d, tags: e.target.value }))
              }
              className={inputClass}
            />

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.is_public}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, is_public: e.target.checked }))
                }
              />
              public
            </label>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy || !draft.content.trim()}
              className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
            >
              {busy ? "saving…" : "save"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
