import { useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  batchAddTags,
  batchRemoveTags,
  batchSetFavorite,
  batchDeleteMetadata,
} from '@/hooks/useClips'

export default function SelectionBar({
  count,
  selectedIds,
  onClear,
}: {
  count: number
  selectedIds: string[]
  onClear: () => void
}) {
  const [tagPromptOpen, setTagPromptOpen] = useState<'add' | 'remove' | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const applyTags = async () => {
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (tags.length === 0) return
    if (tagPromptOpen === 'add') await batchAddTags(selectedIds, tags)
    else await batchRemoveTags(selectedIds, tags)
    setTagInput('')
    setTagPromptOpen(null)
  }

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-20 flex items-center gap-2 border-t border-vault-border bg-vault-surface px-3 py-2.5 safe-bottom">
        <span className="mr-1 text-xs text-vault-muted">{count} selected</span>
        <button
          onClick={() => setTagPromptOpen('add')}
          className="rounded-full bg-vault-gold px-3 py-1.5 text-xs font-medium text-vault-bg active:opacity-80"
        >
          + Tags
        </button>
        <button
          onClick={() => setTagPromptOpen('remove')}
          className="rounded-full border border-vault-border px-3 py-1.5 text-xs text-vault-text active:opacity-70"
        >
          − Tags
        </button>
        <button
          onClick={() => batchSetFavorite(selectedIds, true)}
          className="rounded-full border border-vault-border px-3 py-1.5 text-xs text-vault-text active:opacity-70"
        >
          ❤️
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="rounded-full border border-vault-danger px-3 py-1.5 text-xs text-vault-danger active:opacity-70"
        >
          Delete
        </button>
        <div className="flex-1" />
        <button onClick={onClear} className="text-xs text-vault-muted">
          Cancel
        </button>
      </div>

      {tagPromptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setTagPromptOpen(null)}
        >
          <div
            className="w-full max-w-md rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-base font-semibold text-vault-text">
              {tagPromptOpen === 'add' ? 'Add tags' : 'Remove tags'} to {count} clip
              {count === 1 ? '' : 's'}
            </h2>
            <input
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="cat, fat, funny"
              className="mt-3 w-full rounded-card border border-vault-border bg-vault-surface2 px-3 py-2.5 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
            />
            <p className="mt-1 text-xs text-vault-muted">Separate multiple tags with commas.</p>
            <button
              onClick={applyTags}
              className="mt-4 w-full rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete metadata for selected clips?"
        message="This removes tags, favorites, and notes for these clips from ClipVault. Your original video files on the device are never touched."
        confirmLabel="Delete metadata"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await batchDeleteMetadata(selectedIds)
          setConfirmDelete(false)
          onClear()
        }}
      />
    </>
  )
}
