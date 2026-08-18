import { useState } from 'react'
import Header from '@/components/Layout/Header'
import { useNewClips, updateClipTags } from '@/hooks/useClips'
import { toPlayableSrc } from '@/lib/fileHandling'

const QUICK_TAGS = ['cat', 'dog', 'funny', 'fat', 'cute', 'weird', 'walking', 'sleeping']

export default function NewClipsInbox({ onDone }: { onDone: () => void }) {
  const newClips = useNewClips()
  const [index, setIndex] = useState(0)
  const [pending, setPending] = useState<string[]>([])

  const clip = newClips?.[index]

  if (newClips && newClips.length === 0) {
    return (
      <div>
        <Header title="New Clips" onBack={onDone} />
        <div className="px-4 py-16 text-center">
          <p className="text-4xl">✅</p>
          <p className="font-display mt-2 text-base font-semibold text-vault-text">
            All caught up
          </p>
          <p className="mt-1 text-sm text-vault-muted">Every clip has been reviewed.</p>
        </div>
      </div>
    )
  }

  if (!clip) {
    return (
      <div>
        <Header title="New Clips" onBack={onDone} />
        <p className="px-4 py-8 text-center text-sm text-vault-muted">Loading…</p>
      </div>
    )
  }

  const toggleTag = (tag: string) => {
    setPending((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const saveAndNext = async () => {
    await updateClipTags(clip.id, pending)
    setPending([])
    setIndex((i) => Math.min(i, (newClips?.length ?? 1) - 1)) // list shrinks as items leave "new"; stay at same position
  }

  const skip = () => {
    setPending([])
    setIndex((i) => i + 1)
  }

  return (
    <div>
      <Header
        title={`New Clips (${index + 1}/${newClips?.length ?? 0})`}
        onBack={onDone}
      />
      <div className="px-4 pt-3">
        <video
          src={toPlayableSrc(clip.uri)}
          poster={clip.thumbnailDataUrl}
          controls
          muted
          playsInline
          className="max-h-[45vh] w-full rounded-card bg-black"
        />

        <p className="mt-2 truncate text-xs text-vault-muted">{clip.fileName}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-4 py-2 text-sm ${
                pending.includes(tag)
                  ? 'border-vault-gold bg-vault-gold/15 text-vault-gold'
                  : 'border-vault-border text-vault-text'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={skip}
            className="flex-1 rounded-card border border-vault-border py-3 text-sm text-vault-text active:opacity-70"
          >
            Skip
          </button>
          <button
            onClick={saveAndNext}
            className="flex-1 rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80"
          >
            Save &amp; Next
          </button>
        </div>
      </div>
    </div>
  )
}
