import { SUGGESTED_TAG_GROUPS } from '@/types'
import type { ActiveFilters } from '@/lib/search'
import TagChip from '@/components/shared/TagChip'

export default function FilterPanel({
  open,
  filters,
  onChange,
  onClose,
}: {
  open: boolean
  filters: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  onClose: () => void
}) {
  if (!open) return null

  const toggleTag = (tag: string) => {
    const has = filters.tags.includes(tag)
    onChange({
      ...filters,
      tags: has ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-vault-text">Filters</h2>
          <button
            onClick={() => onChange({ tags: [], favoritesOnly: false, category: undefined })}
            className="text-xs text-vault-gold"
          >
            Clear all
          </button>
        </div>

        <label className="mb-4 flex items-center gap-2 text-sm text-vault-text">
          <input
            type="checkbox"
            checked={!!filters.favoritesOnly}
            onChange={(e) => onChange({ ...filters, favoritesOnly: e.target.checked })}
            className="h-4 w-4 accent-vault-gold"
          />
          Favorites only
        </label>

        {SUGGESTED_TAG_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-vault-muted">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  selected={filters.tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80"
        >
          Show results
        </button>
      </div>
    </div>
  )
}
