import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'

/** All tags that exist across the library, most-used first — powers autocomplete. */
export function useAllTags() {
  return useLiveQuery(
    async () => (await db.tags.toArray()).sort((a, b) => b.count - a.count),
    [],
    [],
  )
}
