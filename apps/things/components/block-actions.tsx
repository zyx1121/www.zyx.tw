"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/ui/dialog"

import type { Block } from "@/components/block"

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/30 focus:outline-none"

export function BlockActions({ block }: { block: Block }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(block.title ?? "")
  const [content, setContent] = useState(block.content)
  const [tags, setTags] = useState(block.tags.join(", "))
  const [isPublic, setIsPublic] = useState(block.is_public)

  async function save(refreshOg: boolean = false) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          content,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          is_public: isPublic,
          refresh_og: refreshOg,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      setEditOpen(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed")
    } finally {
      setBusy(false)
    }
  }

  async function destroy() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/blocks/${block.id}`, { method: "DELETE" })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      router.push("/")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete failed")
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="transition-colors hover:text-foreground"
        >
          edit
        </button>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="transition-colors hover:text-destructive"
        >
          delete
        </button>
        {block.kind === "link" ? (
          <>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={busy}
              className="transition-colors hover:text-foreground disabled:opacity-50"
            >
              {busy ? "refreshing…" : "refresh og"}
            </button>
          </>
        ) : null}
        <span aria-hidden>·</span>
        <span>{block.is_public ? "public" : "private"}</span>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>edit {block.kind}</DialogTitle>
            <DialogDescription>
              kind is fixed. content, title, tags, visibility are fair game.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <input
              placeholder="title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClass} resize-none`}
            />
            <input
              placeholder="tags, comma, separated"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputClass}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              public
            </label>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={() => save(false)}
              disabled={busy || !content.trim()}
              className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
            >
              {busy ? "saving…" : "save"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>delete this block?</DialogTitle>
            <DialogDescription>
              gone for good. files in storage stay until you cleanup manually.
            </DialogDescription>
          </DialogHeader>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={destroy}
              disabled={busy}
              className="text-destructive-foreground rounded-lg bg-destructive px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {busy ? "deleting…" : "delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
