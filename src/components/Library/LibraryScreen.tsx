import { useMemo, useState } from 'react'
import { useClips, importClips } from '@/hooks/useClips'
import { searchClips, filterClips, type ActiveFilters } from '@/lib/search'
import ClipCard from './ClipCard'
import FilterPanel from './FilterPanel'
import SelectionBar from './SelectionBar'
import EmptyState from '@/components/shared/EmptyState'

export default function LibraryScreen({ onOpenClip }: { onOpenClip: (id: string) => void }) {
  const clips = useClips()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<ActiveFilters>({ tags: [] })
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)

  const visible = useMemo(() => {
    const base = clips ?? []
    const searched = query.trim() ? searchClips(base, query) : base
    return filterClips(searched, filters)
  }, [clips, query, filters])

  const activeFilterCount = filters.tags.length + (filters.favoritesOnly ? 1 : 0)

  const toggleSelect = (id: string) => {
    setSelectionMode(true)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearSelection = () => {
    setSelectionMode(false)
    setSelected(new Set())
  }

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
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search clips..."
          className="flex-1 rounded-card border border-vault-border bg-vault-surface px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
        />
        <button
          onClick={() => setFilterOpen(true)}
          className="relative rounded-card border border-vault-border bg-vault-surface px-3 py-2.5 text-sm text-vault-text active:opacity-70"
        >
          ▤
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-vault-gold text-[9px] font-bold text-vault-bg">
              {activeFilterCount}
            </span>
          )}
        </button>
        {!selectionMode && (clips?.length ?? 0) > 0 && (
          <button
            onClick={() => setSelectionMode(true)}
            className="rounded-card border border-vault-border bg-vault-surface px-3 py-2.5 text-sm text-vault-text active:opacity-70"
          >
            Select
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-vault-muted">
        {visible.length} clip{visible.length === 1 ? '' : 's'}
      </p>

      {clips && clips.length === 0 ? (
        <EmptyState
          title="Your library is empty"
          subtitle="Import videos from your device to get started."
          action={
            <button
              onClick={handleAddClips}
              disabled={importing}
              className="rounded-card bg-vault-gold px-5 py-2.5 text-sm font-semibold text-vault-bg active:opacity-80 disabled:opacity-50"
            >
              {importing ? 'Importing…' : '+ Add Clips'}
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon="🔍" title="No clips match" subtitle="Try a different search or clear filters." />
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2 pb-24">
          {visible.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              onOpen={() => onOpenClip(clip.id)}
              selectionMode={selectionMode}
              selected={selected.has(clip.id)}
              onToggleSelect={() => toggleSelect(clip.id)}
            />
          ))}
        </div>
      )}

      <FilterPanel
        open={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
      />

      {selectionMode && (
        <SelectionBar count={selected.size} selectedIds={[...selected]} onClear={clearSelection} />
      )}
    </div>
  )
}
