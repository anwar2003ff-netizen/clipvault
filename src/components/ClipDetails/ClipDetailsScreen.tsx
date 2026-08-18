import { useEffect, useState } from 'react'
import Header from '@/components/Layout/Header'
import VideoPlayer from '@/components/shared/VideoPlayer'
import TagChip from '@/components/shared/TagChip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  useClip,
  useClips,
  toggleFavorite,
  updateClipTags,
  updateClipMeta,
  deleteClipMetadata,
} from '@/hooks/useClips'
import { useAllTags } from '@/hooks/useTags'
import { useProjects, setProjectSlot } from '@/hooks/useProjects'
import { findSimilarClips } from '@/lib/similarity'

export default function ClipDetailsScreen({
  clipId,
  onBack,
  onOpenClip,
}: {
  clipId: string
  onBack: () => void
  onOpenClip: (id: string) => void
}) {
  const clip = useClip(clipId)
  const allClips = useClips()
  const allTags = useAllTags()
  const projects = useProjects()

  const [tagInput, setTagInput] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [addToProjectOpen, setAddToProjectOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)

  useEffect(() => {
    if (clip) {
      setTitle(clip.title ?? '')
      setNotes(clip.notes ?? '')
    }
  }, [clip?.id])

  if (!clip) {
    return (
      <div>
        <Header title="Clip" onBack={onBack} />
        <p className="px-4 py-8 text-center text-sm text-vault-muted">Loading…</p>
      </div>
    )
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (!t) return
    updateClipTags(clip.id, [...clip.tags, t])
    setTagInput('')
  }

  const similar = showSimilar ? findSimilarClips(clip, allClips ?? []) : []

  return (
    <div className="pb-8">
      <Header title={clip.title || clip.fileName} onBack={onBack} />

      <div className="px-4 pt-3">
        <VideoPlayer uri={clip.uri} poster={clip.thumbnailDataUrl} />

        <div className="mt-3 flex items-center justify-between text-xs text-vault-muted">
          <span>{clip.fileName}</span>
          <span>{new Date(clip.dateAdded).toLocaleDateString()}</span>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => updateClipMeta(clip.id, { title: title.trim() || undefined })}
          placeholder="Custom title"
          className="mt-3 w-full rounded-card border border-vault-border bg-vault-surface px-3 py-2.5 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => updateClipMeta(clip.id, { notes: notes.trim() || undefined })}
          placeholder="Notes"
          rows={2}
          className="mt-2 w-full rounded-card border border-vault-border bg-vault-surface px-3 py-2.5 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
        />

        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-vault-muted">Tags</p>
          <div className="flex flex-wrap gap-2">
            {clip.tags.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                onRemove={() => updateClipTags(clip.id, clip.tags.filter((t) => t !== tag))}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add a tag…"
              list="tag-suggestions"
              className="flex-1 rounded-card border border-vault-border bg-vault-surface px-3 py-2 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
            />
            <datalist id="tag-suggestions">
              {(allTags ?? []).map((t) => (
                <option key={t.name} value={t.name} />
              ))}
            </datalist>
            <button
              onClick={addTag}
              className="rounded-card bg-vault-gold px-4 text-sm font-semibold text-vault-bg active:opacity-80"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => toggleFavorite(clip.id, !clip.favorite)}
            className="rounded-card border border-vault-border py-2.5 text-sm text-vault-text active:opacity-70"
          >
            {clip.favorite ? '❤️ Favorited' : '🤍 Favorite'}
          </button>
          <button
            onClick={() => setAddToProjectOpen(true)}
            className="rounded-card border border-vault-border py-2.5 text-sm text-vault-text active:opacity-70"
          >
            ☰ Add to Project
          </button>
          <button
            onClick={() => setShowSimilar((s) => !s)}
            className="rounded-card border border-vault-border py-2.5 text-sm text-vault-text active:opacity-70"
          >
            🔗 Find Similar
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-card border border-vault-danger py-2.5 text-sm text-vault-danger active:opacity-70"
          >
            🗑 Delete Metadata
          </button>
        </div>

        {showSimilar && (
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-vault-muted">
              Similar clips ({similar.length})
            </p>
            {similar.length === 0 ? (
              <p className="text-sm text-vault-muted">
                No similar clips found — add more tags to improve matches.
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {similar.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onOpenClip(s.id)}
                    className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-card border border-vault-border bg-vault-surface2 active:opacity-70"
                  >
                    {s.thumbnailDataUrl && (
                      <img src={s.thumbnailDataUrl} className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {addToProjectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setAddToProjectOpen(false)}
        >
          <div
            className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-base font-semibold text-vault-text">
              Add to project
            </h2>
            {(projects ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-vault-muted">
                No projects yet. Create one from the Projects tab first.
              </p>
            ) : (
              (projects ?? []).map((p) => (
                <div key={p.id} className="mt-3">
                  <p className="mb-1 text-sm text-vault-text">{p.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.slots.map((slot) => (
                      <button
                        key={slot.rank}
                        onClick={async () => {
                          await setProjectSlot(p.id, slot.rank, clip.id)
                          setAddToProjectOpen(false)
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs ${
                          slot.clipId === clip.id
                            ? 'border-vault-gold bg-vault-gold/15 text-vault-gold'
                            : 'border-vault-border text-vault-muted'
                        }`}
                      >
                        #{slot.rank}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this clip's metadata?"
        message="Tags, favorite status, and notes will be removed from ClipVault. The original video file on your device is never deleted."
        confirmLabel="Delete metadata"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteClipMetadata(clip.id)
          setConfirmDelete(false)
          onBack()
        }}
      />
    </div>
  )
}
