import { useState } from 'react'
import type { Tab } from '@/App'
import { useClips, useNewClips, importClips } from '@/hooks/useClips'
import { useProjects } from '@/hooks/useProjects'
import { QUICK_CATEGORIES } from '@/types'
import { searchClips } from '@/lib/search'

export default function HomeScreen({
  onOpenClip,
  onOpenNewClips,
  onGoToTab,
}: {
  onOpenClip: (id: string) => void
  onOpenNewClips: () => void
  onGoToTab: (tab: Tab) => void
}) {
  const clips = useClips()
  const newClips = useNewClips()
  const projects = useProjects()
  const [query, setQuery] = useState('')
  const [importing, setImporting] = useState(false)

  const recent = (clips ?? []).slice(0, 6)
  const searchResults = query.trim() ? searchClips(clips ?? [], query) : []

  const handleAddClips = async () => {
    setImporting(true)
    try {
      await importClips()
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold text-vault-gold">ClipVault</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Search clips..."
        className="mt-4 w-full rounded-card border border-vault-border bg-vault-surface px-4 py-3 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
      />

      {query.trim() ? (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-vault-muted">
            {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
          </p>
          <ClipRow clips={searchResults} onOpenClip={onOpenClip} />
        </div>
      ) : (
        <>
          <button
            onClick={handleAddClips}
            disabled={importing}
            className="mt-4 w-full rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80 disabled:opacity-50"
          >
            {importing ? 'Importing…' : '+ Add Clips'}
          </button>

          {newClips && newClips.length > 0 && (
            <button
              onClick={onOpenNewClips}
              className="mt-3 flex w-full items-center justify-between rounded-card border border-vault-gold/40 bg-vault-gold/10 px-4 py-3 text-sm text-vault-gold active:opacity-70"
            >
              <span>🆕 {newClips.length} New Clips to tag</span>
              <span>→</span>
            </button>
          )}

          <section className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-wide text-vault-muted">
              Quick Categories
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onGoToTab('library')}
                  className="flex flex-col items-center gap-1 rounded-card border border-vault-border bg-vault-surface py-3 active:opacity-70"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs text-vault-text">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-vault-muted">Recent Clips</p>
              <button onClick={() => onGoToTab('library')} className="text-xs text-vault-gold">
                See all
              </button>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-vault-muted">
                No clips yet. Tap "+ Add Clips" to import your first videos.
              </p>
            ) : (
              <ClipRow clips={recent} onOpenClip={onOpenClip} />
            )}
          </section>

          <section className="mt-6 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-vault-muted">Recent Projects</p>
              <button onClick={() => onGoToTab('projects')} className="text-xs text-vault-gold">
                See all
              </button>
            </div>
            {(projects ?? []).length === 0 ? (
              <p className="text-sm text-vault-muted">
                No projects yet. Create one from the Projects tab.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {(projects ?? []).slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onGoToTab('projects')}
                    className="rounded-card border border-vault-border bg-vault-surface px-4 py-3 text-left text-sm text-vault-text active:opacity-70"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function ClipRow({
  clips,
  onOpenClip,
}: {
  clips: { id: string; thumbnailDataUrl?: string; title?: string; fileName: string }[]
  onOpenClip: (id: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {clips.map((clip) => (
        <button
          key={clip.id}
          onClick={() => onOpenClip(clip.id)}
          className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-card border border-vault-border bg-vault-surface2 active:opacity-70"
        >
          {clip.thumbnailDataUrl ? (
            <img
              src={clip.thumbnailDataUrl}
              alt={clip.title ?? clip.fileName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-vault-muted">
              🎬
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
