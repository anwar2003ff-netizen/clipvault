import Dexie, { type Table } from 'dexie'
import type { Clip, Project, TagUsage } from '@/types'

/**
 * ClipVaultDB — the single local database for the app.
 *
 * Everything here is metadata only. Original video files are never
 * duplicated into this database; `Clip.uri` is a reference to the
 * file's location on the device.
 *
 * Indexes are chosen to keep the two hottest operations fast even at
 * thousands of rows: (1) the Library grid (sorted by dateAdded), and
 * (2) tag/category filtering (multi-entry index on tags).
 */
class ClipVaultDB extends Dexie {
  clips!: Table<Clip, string>
  tags!: Table<TagUsage, string>
  projects!: Table<Project, string>

  constructor() {
    super('clipvault')
    this.version(1).stores({
      // '*tags' = multi-entry index, lets Dexie query clips by any single tag efficiently
      clips: 'id, dateAdded, favorite, isNew, category, *tags',
      tags: 'name, count',
      projects: 'id, createdAt, updatedAt',
    })
  }
}

export const db = new ClipVaultDB()

/** Generates a compact, sufficiently-unique id without extra dependencies. */
export function makeId(prefix = 'clip'): string {
  const rand = Math.random().toString(36).slice(2, 9)
  return `${prefix}_${Date.now().toString(36)}${rand}`
}
