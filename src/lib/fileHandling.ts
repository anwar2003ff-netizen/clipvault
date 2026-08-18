import { Capacitor } from '@capacitor/core'

export interface PickedFile {
  uri: string // playable src for <video>, and the value stored as Clip.uri
  fileName: string
  sizeBytes?: number
}

/**
 * Opens the platform's file/media picker and returns references to the
 * selected videos WITHOUT copying them into the app's storage.
 *
 * - Web (npm run dev, used for fast iteration/testing from Termux + a
 *   phone browser): uses <input type="file">. The browser gives back a
 *   blob: URL. That URL is only valid for the current page session —
 *   fine for building/testing the UI, but on a real device install you
 *   want the native branch below for URIs that survive app restarts.
 *
 * - Native (Capacitor Android build): should use a Storage Access
 *   Framework picker that takes a *persistable* URI permission, so the
 *   content:// URI keeps working after the app restarts and after
 *   reboots, without ClipVault ever holding a copy of the video bytes.
 *   Recommended plugin: @capawesome/capacitor-file-picker (MIT,
 *   actively maintained). See README "Native file access" section for
 *   the exact wiring — left as a clearly-scoped follow-up so Phase 1
 *   isn't blocked on a native build.
 */
export async function pickVideoFiles(): Promise<PickedFile[]> {
  if (Capacitor.isNativePlatform()) {
    return pickVideoFilesNative()
  }
  return pickVideoFilesWeb()
}

function pickVideoFilesWeb(): Promise<PickedFile[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files ?? [])
      const picked: PickedFile[] = files.map((f) => ({
        uri: URL.createObjectURL(f),
        fileName: f.name,
        sizeBytes: f.size,
      }))
      resolve(picked)
    }
    // If the user cancels, no 'change' event fires; resolve empty after a tick
    // so callers never hang. This is a pragmatic tradeoff of the web File API.
    input.click()
    window.addEventListener(
      'focus',
      () => setTimeout(() => resolve((input.files?.length ?? 0) > 0 ? [] : []), 300),
      { once: true },
    )
  })
}

async function pickVideoFilesNative(): Promise<PickedFile[]> {
  throw new Error(
    'Native file picking is not wired up yet. Install @capawesome/capacitor-file-picker ' +
      'and implement this branch — see README "Native file access". Until then, build ' +
      'and test ClipVault in the browser (npm run dev) where the web picker works fully.',
  )
}
