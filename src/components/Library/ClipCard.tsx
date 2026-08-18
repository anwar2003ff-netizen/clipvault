import type { Clip } from '@/types'
import { toggleFavorite } from '@/hooks/useClips'

function formatDuration(sec?: number) {
  if (!sec || !Number.isFinite(sec)) return '--:--'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ClipCard({
  clip,
  onOpen,
  selectionMode,
  selected,
  onToggleSelect,
}: {
  clip: Clip
  onOpen: () => void
  selectionMode: boolean
  selected: boolean
  onToggleSelect: () => void
}) {
  const handlePress = () => {
    if (selectionMode) onToggleSelect()
    else onOpen()
  }

  return (
    <div
      onClick={handlePress}
      onContextMenu={(e) => {
        e.preventDefault()
        onToggleSelect()
      }}
      className={`relative aspect-[9/16] overflow-hidden rounded-card border bg-vault-surface2 active:opacity-80 ${
        selected ? 'border-vault-gold' : 'border-vault-border'
      }`}
    >
      {clip.thumbnailDataUrl ? (
        <img
          src={clip.thumbnailDataUrl}
          alt={clip.title ?? clip.fileName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl text-vault-muted">
          🎬
        </div>
      )}

      {clip.fileMissing && (
        <div className="absolute inset-x-0 top-0 bg-vault-danger/90 py-0.5 text-center text-[10px] text-white">
          File missing
        </div>
      )}

      {selectionMode ? (
        <div
          className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${
            selected ? 'border-vault-gold bg-vault-gold text-vault-bg' : 'border-white/80 bg-black/30 text-transparent'
          }`}
        >
          ✓
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(clip.id, !clip.favorite)
          }}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-sm"
        >
          {clip.favorite ? '❤️' : '🤍'}
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1.5">
        <span className="text-[10px] text-white">{formatDuration(clip.durationSec)}</span>
        {clip.tags.length > 0 && (
          <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
            {clip.tags.length} tag{clip.tags.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {clip.isNew && (
        <span className="absolute left-2 top-2 rounded-full bg-vault-teal px-1.5 py-0.5 text-[9px] font-semibold text-vault-bg">
          NEW
        </span>
      )}
    </div>
  )
}
