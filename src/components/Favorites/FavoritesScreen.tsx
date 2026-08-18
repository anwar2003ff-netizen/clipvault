import { useMemo, useState } from 'react'
import { useFavoriteClips } from '@/hooks/useClips'
import ClipCard from '@/components/Library/ClipCard'
import EmptyState from '@/components/shared/EmptyState'

type SortMode = 'recent' | 'duration' | 'name' | 'mostUsed'

const SORT_LABELS: Record<SortMode, string> = {
  recent: 'Recently added',
  duration: 'Duration',
  name: 'Name',
  mostUsed: 'Most used',
}

export default function FavoritesScreen({ onOpenClip }: { onOpenClip: (id: string) => void }) {
  const favorites = useFavoriteClips()
  const [sort, setSort] = useState<SortMode>('recent')

  const sorted = useMemo(() => {
    const list = [...(favorites ?? [])]
    switch (sort) {
      case 'duration':
        return list.sort((a, b) => (b.durationSec ?? 0) - (a.durationSec ?? 0))
      case 'name':
        return list.sort((a, b) => (a.title ?? a.fileName).localeCompare(b.title ?? b.fileName))
      case 'mostUsed':
        return list.sort((a, b) => b.useCount - a.useCount)
      case 'recent':
      default:
        return list.sort((a, b) => b.dateAdded - a.dateAdded)
    }
  }, [favorites, sort])

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-xl font-bold text-vault-text">Favorites</h1>

      {sorted.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                sort === mode
                  ? 'border-vault-gold bg-vault-gold/15 text-vault-gold'
                  : 'border-vault-border text-vault-muted'
              }`}
            >
              {SORT_LABELS[mode]}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="No favorites yet"
          subtitle="Tap the heart on any clip to add it here."
        />
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 pb-24">
          {sorted.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              onOpen={() => onOpenClip(clip.id)}
              selectionMode={false}
              selected={false}
              onToggleSelect={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
