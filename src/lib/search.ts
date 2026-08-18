import type { Clip } from '@/types'

/**
 * Tokenizes a free-text query into lowercase words.
 * "fat cat" -> ["fat", "cat"], "funny walking cat" -> ["funny", "walking", "cat"]
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function haystackFor(clip: Clip): string {
  return [clip.fileName, clip.title, clip.category, clip.notes, ...clip.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/**
 * Ranks clips against a free-text query. A clip matches if it contains
 * ALL query tokens somewhere in its searchable fields (name, title,
 * category, tags, notes). Results are ordered by number of tokens that
 * matched a *tag* exactly (highest relevance), then recency.
 */
export function searchClips(clips: Clip[], query: string): Clip[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return clips

  const scored: { clip: Clip; score: number }[] = []

  for (const clip of clips) {
    const haystack = haystackFor(clip)
    const matchesAll = tokens.every((t) => haystack.includes(t))
    if (!matchesAll) continue

    let score = 0
    for (const t of tokens) {
      if (clip.tags.some((tag) => tag === t)) score += 3
      else if (clip.tags.some((tag) => tag.includes(t))) score += 2
      else if ((clip.title ?? clip.fileName).toLowerCase().includes(t)) score += 1
    }
    scored.push({ clip, score })
  }

  scored.sort((a, b) => b.score - a.score || b.clip.dateAdded - a.clip.dateAdded)
  return scored.map((s) => s.clip)
}

export interface ActiveFilters {
  tags: string[] // AND-combined: a clip must have every selected tag
  category?: string
  favoritesOnly?: boolean
}

export function filterClips(clips: Clip[], filters: ActiveFilters): Clip[] {
  return clips.filter((clip) => {
    if (filters.favoritesOnly && !clip.favorite) return false
    if (filters.category && clip.category !== filters.category) return false
    if (filters.tags.length > 0) {
      const clipTagSet = new Set(clip.tags)
      const hasAll = filters.tags.every((t) => clipTagSet.has(t))
      if (!hasAll) return false
    }
    return true
  })
}
