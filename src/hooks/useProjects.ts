import { useLiveQuery } from 'dexie-react-hooks'
import { db, makeId } from '@/db/db'
import type { Project, ProjectSlot } from '@/types'

export function useProjects() {
  return useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), [], [])
}

export function useProject(id: string | undefined) {
  return useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id])
}

/** Creates a project with an empty #N -> #1 ranking ladder of the given size. */
export async function createProject(name: string, rankCount = 5): Promise<string> {
  const id = makeId('proj')
  const now = Date.now()
  const slots: ProjectSlot[] = Array.from({ length: rankCount }, (_, i) => ({
    rank: rankCount - i,
    clipId: null,
  }))
  const project: Project = { id, name, createdAt: now, updatedAt: now, slots }
  await db.projects.put(project)
  return id
}

export async function setProjectSlot(projectId: string, rank: number, clipId: string | null) {
  const project = await db.projects.get(projectId)
  if (!project) return
  const slots = project.slots.map((s) => (s.rank === rank ? { ...s, clipId } : s))
  await db.projects.update(projectId, { slots, updatedAt: Date.now() })
  if (clipId) {
    const clip = await db.clips.get(clipId)
    if (clip) await db.clips.update(clipId, { useCount: clip.useCount + 1 })
  }
}

/** Swaps two ranks' clips — used by the Move Up / Move Down buttons (drag-and-drop is unreliable on some Android WebViews, so this is the dependable fallback). */
export async function swapProjectRanks(projectId: string, rankA: number, rankB: number) {
  const project = await db.projects.get(projectId)
  if (!project) return
  const slots = project.slots.map((s) => {
    if (s.rank === rankA) return { ...s, rank: rankB }
    if (s.rank === rankB) return { ...s, rank: rankA }
    return s
  })
  await db.projects.update(projectId, { slots, updatedAt: Date.now() })
}

export async function renameProject(projectId: string, name: string) {
  await db.projects.update(projectId, { name, updatedAt: Date.now() })
}

export async function updateProjectNotes(projectId: string, notes: string) {
  await db.projects.update(projectId, { notes, updatedAt: Date.now() })
}

export async function deleteProject(projectId: string) {
  await db.projects.delete(projectId)
}
