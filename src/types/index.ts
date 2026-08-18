/**
 * Core data model for ClipVault.
 *
 * IMPORTANT: Clips never store the video file itself, only a reference
 * (`uri`) to the original file on the device, plus lightweight metadata.
 * This keeps the local database small even with thousands of clips.
 */

export interface Clip {
  id: string // uuid, generated on import
  uri: string // persistent content:// URI (native) or object URL (web dev preview)
  fileName: string
  title?: string // user-editable custom title, falls back to fileName
  thumbnailDataUrl?: string // small base64 JPEG, generated on import
  durationSec?: number
  sizeBytes?: number
  dateAdded: number // epoch ms
  tags: string[] // free-form, lowercase, deduplicated
  category?: string // one of QUICK_CATEGORIES.id or a custom string
  favorite: boolean
  notes?: string
  isNew: boolean // true until the user tags/reviews it via the New Clips inbox
  useCount: number // incremented each time the clip is added to a project
  fileMissing?: boolean // set true if the original file could not be resolved on load
}

export interface TagUsage {
  name: string // lowercase tag text, primary key
  count: number
}

export interface ProjectSlot {
  rank: number // 1 = top rank, position in the countdown
  clipId: string | null
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  notes?: string
  slots: ProjectSlot[] // ordered #N -> #1
  // Reserved for the future video-automation pipeline (Phase 6+).
  // Never required for JSON export to work; always safe to be undefined.
  transition?: string
  effect?: string
  commentaryText?: string
}

export interface QuickCategory {
  id: string
  label: string
  icon: string
}

export const QUICK_CATEGORIES: QuickCategory[] = [
  { id: 'cats', label: 'Cats', icon: '🐱' },
  { id: 'dogs', label: 'Dogs', icon: '🐶' },
  { id: 'funny', label: 'Funny', icon: '😂' },
  { id: 'fat', label: 'Fat', icon: '🍔' },
  { id: 'weird', label: 'Weird', icon: '😱' },
  { id: 'cute', label: 'Cute', icon: '❤️' },
]

export const SUGGESTED_TAG_GROUPS: { label: string; tags: string[] }[] = [
  { label: 'Animal', tags: ['cat', 'dog', 'rabbit', 'other'] },
  { label: 'Type', tags: ['funny', 'cute', 'weird', 'scary', 'fail', 'unexpected'] },
  {
    label: 'Characteristics',
    tags: ['fat', 'small', 'big', 'black', 'white', 'orange', 'long hair', 'hairless'],
  },
  {
    label: 'Actions',
    tags: [
      'walking',
      'running',
      'jumping',
      'falling',
      'sleeping',
      'eating',
      'fighting',
      'dancing',
      'looking',
      'making sounds',
    ],
  },
]

export interface ExportedProjectJSON {
  project: string
  createdAt: string
  clips: {
    rank: number
    clipId: string
    fileName: string
    title: string
    tags: string[]
  }[]
}
