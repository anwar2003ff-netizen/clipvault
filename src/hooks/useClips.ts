import { useLiveQuery } from 'dexie-react-hooks'
import { db, makeId } from '@/db/db'
import type { Clip } from '@/types'
import { pickVideoFiles } from '@/lib/fileHandling'
import { generateThumbnail } from '@/lib/thumbnails'

/** Live-updating list of every clip, newest first. Re-renders automatically on any DB change. */
export function useClips() {
  return useLiveQuery(() => db.clips.orderBy('dateAdded').reverse().toArray(), [], [])
}

export function useClip(id: string | undefined) {
  return useLiveQuery(() => (id ? db.clips.get(id) : undefined), [id])
}

// Booleans are indexed by Dexie but querying them with .equals() is a known
// footgun across browser IndexedDB implementations, so we filter in JS
// instead. At the scale this app targets (thousands, not millions, of
// clips) this stays effectively instant.
export function useNewClips() {
  return useLiveQuery(
    async () => (await db.clips.orderBy('dateAdded').reverse().toArray()).filter((c) => c.isNew),
    [],
    [],
  )
}

export function useFavoriteClips() {
  return useLiveQuery(
    async () =>
      (await db.clips.orderBy('dateAdded').reverse().toArray()).filter((c) => c.favorite),
    [],
    [],
  )
}

async function bumpTagUsage(tags: string[], delta: 1 | -1) {
  await db.transaction('rw', db.tags, async () => {
    for (const name of tags) {
      const existing = await db.tags.get(name)
      const nextCount = (existing?.count ?? 0) + delta
      if (nextCount <= 0) {
        await db.tags.delete(name)
      } else {
        await db.tags.put({ name, count: nextCount })
      }
    }
  })
}

/** Imports files picked from the device. Runs thumbnail generation per-file so one bad file can't block the rest. */
export async function importClips(onProgress?: (done: number, total: number) => void) {
  const picked = await pickVideoFiles()
  const total = picked.length
  let done = 0
  const results: { fileName: string; ok: boolean; error?: string }[] = []

  for (const file of picked) {
    try {
      const { thumbnailDataUrl, durationSec } = await generateThumbnail(file.uri)
      const clip: Clip = {
        id: makeId(),
        uri: file.uri,
        fileName: file.fileName,
        thumbnailDataUrl,
        durationSec,
        sizeBytes: file.sizeBytes,
        dateAdded: Date.now(),
        tags: [],
        favorite: false,
        isNew: true,
        useCount: 0,
      }
      await db.clips.put(clip)
      results.push({ fileName: file.fileName, ok: true })
    } catch (err) {
      results.push({
        fileName: file.fileName,
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error reading this file',
      })
    } finally {
      done += 1
      onProgress?.(done, total)
    }
  }

  return results
}

export async function toggleFavorite(id: string, favorite: boolean) {
  await db.clips.update(id, { favorite })
}

export async function updateClipTags(id: string, tags: string[]) {
  const clip = await db.clips.get(id)
  if (!clip) return
  const prevTags = clip.tags
  const nextTags = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))]
  await db.clips.update(id, { tags: nextTags, isNew: false })

  const added = nextTags.filter((t) => !prevTags.includes(t))
  const removed = prevTags.filter((t) => !nextTags.includes(t))
  if (added.length) await bumpTagUsage(added, 1)
  if (removed.length) await bumpTagUsage(removed, -1)
}

export async function updateClipMeta(
  id: string,
  patch: Partial<Pick<Clip, 'title' | 'notes' | 'category'>>,
) {
  await db.clips.update(id, patch)
}

export async function deleteClipMetadata(id: string) {
  const clip = await db.clips.get(id)
  if (clip?.tags.length) await bumpTagUsage(clip.tags, -1)
  await db.clips.delete(id)
  // Original video file on the device is never touched by this call.
}

/** Batch operations used by multi-select mode in the Library screen. */
export async function batchAddTags(ids: string[], tagsToAdd: string[]) {
  const clean = [...new Set(tagsToAdd.map((t) => t.trim().toLowerCase()).filter(Boolean))]
  if (clean.length === 0) return
  await db.transaction('rw', db.clips, db.tags, async () => {
    for (const id of ids) {
      const clip = await db.clips.get(id)
      if (!clip) continue
      const merged = [...new Set([...clip.tags, ...clean])]
      const added = clean.filter((t) => !clip.tags.includes(t))
      await db.clips.update(id, { tags: merged, isNew: false })
      if (added.length) await bumpTagUsage(added, 1)
    }
  })
}

export async function batchRemoveTags(ids: string[], tagsToRemove: string[]) {
  const clean = new Set(tagsToRemove.map((t) => t.trim().toLowerCase()))
  await db.transaction('rw', db.clips, db.tags, async () => {
    for (const id of ids) {
      const clip = await db.clips.get(id)
      if (!clip) continue
      const removed = clip.tags.filter((t) => clean.has(t))
      const remaining = clip.tags.filter((t) => !clean.has(t))
      await db.clips.update(id, { tags: remaining })
      if (removed.length) await bumpTagUsage(removed, -1)
    }
  })
}

export async function batchSetFavorite(ids: string[], favorite: boolean) {
  await db.transaction('rw', db.clips, async () => {
    for (const id of ids) await db.clips.update(id, { favorite })
  })
}

export async function batchSetCategory(ids: string[], category: string) {
  await db.transaction('rw', db.clips, async () => {
    for (const id of ids) await db.clips.update(id, { category })
  })
}

export async function batchDeleteMetadata(ids: string[]) {
  await db.transaction('rw', db.clips, db.tags, async () => {
    for (const id of ids) await deleteClipMetadata(id)
  })
}
