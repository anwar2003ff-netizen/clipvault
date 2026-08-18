import { useState } from 'react'
import Header from '@/components/Layout/Header'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  useProject,
  setProjectSlot,
  swapProjectRanks,
  renameProject,
  deleteProject,
} from '@/hooks/useProjects'
import { useClips, useClip } from '@/hooks/useClips'
import { searchClips } from '@/lib/search'
import { buildProjectExport, downloadJSON } from '@/utils/export'

export default function ProjectEditor({
  projectId,
  onBack,
}: {
  projectId: string
  onBack: () => void
}) {
  const project = useProject(projectId)
  const allClips = useClips()
  const [pickerRank, setPickerRank] = useState<number | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState('')

  if (!project) {
    return (
      <div>
        <Header title="Project" onBack={onBack} />
        <p className="px-4 py-8 text-center text-sm text-vault-muted">Loading…</p>
      </div>
    )
  }

  const sortedSlots = [...project.slots].sort((a, b) => b.rank - a.rank) // #N ... #1
  const pickerResults = pickerQuery.trim()
    ? searchClips(allClips ?? [], pickerQuery)
    : allClips ?? []

  const handleExport = async () => {
    const json = await buildProjectExport(project)
    const safeName = project.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
    downloadJSON(`${safeName || 'project'}.json`, json)
  }

  return (
    <div className="pb-8">
      <Header
        title={project.name}
        onBack={onBack}
        right={
          <button
            onClick={() => {
              setName(project.name)
              setRenaming(true)
            }}
            className="text-xs text-vault-gold"
          >
            Rename
          </button>
        }
      />

      <div className="px-4 pt-3">
        <div className="flex flex-col gap-2">
          {sortedSlots.map((slot, i) => (
            <RankRow
              key={slot.rank}
              rank={slot.rank}
              clipId={slot.clipId}
              onPick={() => setPickerRank(slot.rank)}
              onClear={() => setProjectSlot(project.id, slot.rank, null)}
              onMoveUp={
                i > 0 ? () => swapProjectRanks(project.id, slot.rank, sortedSlots[i - 1].rank) : undefined
              }
              onMoveDown={
                i < sortedSlots.length - 1
                  ? () => swapProjectRanks(project.id, slot.rank, sortedSlots[i + 1].rank)
                  : undefined
              }
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80"
          >
            Export JSON
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-card border border-vault-danger px-4 py-3 text-sm text-vault-danger active:opacity-70"
          >
            Delete
          </button>
        </div>
      </div>

      {pickerRank !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setPickerRank(null)}
        >
          <div
            className="flex h-[80vh] w-full max-w-md flex-col rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-base font-semibold text-vault-text">
              Pick clip for #{pickerRank}
            </h2>
            <input
              autoFocus
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="🔍 Search clips..."
              className="mt-3 w-full rounded-card border border-vault-border bg-vault-surface2 px-3 py-2.5 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
            />
            <div className="mt-3 grid flex-1 grid-cols-3 gap-2 overflow-y-auto">
              {pickerResults.map((c) => (
                <button
                  key={c.id}
                  onClick={async () => {
                    await setProjectSlot(project.id, pickerRank, c.id)
                    setPickerRank(null)
                    setPickerQuery('')
                  }}
                  className="aspect-[9/16] overflow-hidden rounded-card border border-vault-border bg-vault-surface2 active:opacity-70"
                >
                  {c.thumbnailDataUrl && (
                    <img src={c.thumbnailDataUrl} className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {renaming && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setRenaming(false)}
        >
          <div
            className="w-full max-w-md rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-base font-semibold text-vault-text">
              Rename project
            </h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-3 w-full rounded-card border border-vault-border bg-vault-surface2 px-3 py-2.5 text-sm text-vault-text focus:border-vault-gold focus:outline-none"
            />
            <button
              onClick={async () => {
                if (name.trim()) await renameProject(project.id, name.trim())
                setRenaming(false)
              }}
              className="mt-4 w-full rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this project?"
        message="The ranking and its notes will be removed. Clips themselves are not affected."
        confirmLabel="Delete project"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteProject(project.id)
          setConfirmDelete(false)
          onBack()
        }}
      />
    </div>
  )
}

function RankRow({
  rank,
  clipId,
  onPick,
  onClear,
  onMoveUp,
  onMoveDown,
}: {
  rank: number
  clipId: string | null
  onPick: () => void
  onClear: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const clip = useClip(clipId ?? undefined)
  return (
    <div className="flex items-center gap-3 rounded-card border border-vault-border bg-vault-surface p-2.5">
      <span className="font-display w-8 text-center text-lg font-bold text-vault-gold">
        #{rank}
      </span>
      <button
        onClick={onPick}
        className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-card border border-vault-border bg-vault-surface2 active:opacity-70"
      >
        {clip?.thumbnailDataUrl ? (
          <img src={clip.thumbnailDataUrl} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-vault-muted">+</div>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-vault-text">
          {clip ? clip.title || clip.fileName : 'Tap to choose a clip'}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="text-xs text-vault-muted disabled:opacity-20"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="text-xs text-vault-muted disabled:opacity-20"
        >
          ▼
        </button>
      </div>
      {clip && (
        <button onClick={onClear} className="text-xs text-vault-muted">
          ✕
        </button>
      )}
    </div>
  )
}
