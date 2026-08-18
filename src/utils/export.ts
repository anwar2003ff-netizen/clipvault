import { db } from '@/db/db'
import type { ExportedProjectJSON, Project } from '@/types'

export async function buildProjectExport(project: Project): Promise<ExportedProjectJSON> {
  const rankedSlots = [...project.slots].sort((a, b) => b.rank - a.rank)
  const clips = []
  for (const slot of rankedSlots) {
    if (!slot.clipId) continue
    const clip = await db.clips.get(slot.clipId)
    if (!clip) continue
    clips.push({
      rank: slot.rank,
      clipId: clip.id,
      fileName: clip.fileName,
      title: clip.title ?? clip.fileName,
      tags: clip.tags,
    })
  }
  return {
    project: project.name,
    createdAt: new Date(project.createdAt).toISOString(),
    clips,
  }
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Full metadata backup: tags, categories, favorites, projects, notes, clip references. Never includes video bytes. */
export async function buildFullBackup() {
  const [clips, tags, projects] = await Promise.all([
    db.clips.toArray(),
    db.tags.toArray(),
    db.projects.toArray(),
  ])
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    clips: clips.map(({ thumbnailDataUrl: _thumbnailDataUrl, ...rest }) => rest), // omit heavy thumbnails from backup by default
    tags,
    projects,
  }
}
