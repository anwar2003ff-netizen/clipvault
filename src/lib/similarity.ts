import type { Clip } from '@/types'

/**
 * v1 similarity: Jaccard overlap of tag sets, with a small bonus for
 * sharing a category. No AI, no network call — pure local computation,
 * so it stays instant even with thousands of clips.
 *
 * To upgrade later to real visual/embedding similarity: implement a
 * second scorer with the same signature (Clip, Clip[]) => ranked Clip[],
 * and swap it in at the call site in ClipDetailsScreen. Nothing else
 * in the app needs to change.
 */
export function findSimilarClips(target: Clip, allClips: Clip[], limit = 20): Clip[] {
  const targetTags = new Set(target.tags)
  if (targetTags.size === 0) {
    // No tags to compare against — fall back to same category, most recent.
    return allClips
      .filter((c) => c.id !== target.id && c.category === target.category)
      .sort((a, b) => b.dateAdded - a.dateAdded)
      .slice(0, limit)
  }

  const scored = allClips
    .filter((c) => c.id !== target.id)
    .map((clip) => {
      const clipTags = new Set(clip.tags)
      const intersection = [...targetTags].filter((t) => clipTags.has(t)).length
      const union = new Set([...targetTags, ...clipTags]).size
      const jaccard = union === 0 ? 0 : intersection / union
      const categoryBonus = clip.category && clip.category === target.category ? 0.1 : 0
      return { clip, score: jaccard + categoryBonus, sharedTags: intersection }
    })
    .filter((s) => s.sharedTags > 0)

  scored.sort((a, b) => b.score - a.score || b.clip.dateAdded - a.clip.dateAdded)
  return scored.slice(0, limit).map((s) => s.clip)
}
