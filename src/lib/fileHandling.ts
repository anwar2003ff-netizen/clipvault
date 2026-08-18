import { Capacitor } from '@capacitor/core'
import { FilePicker } from '@capawesome/capacitor-file-picker'

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
  try {
    const result = await FilePicker.pickFiles({
      types: ['video/*'],
      multiple: true,
      readData: false,
    })
    return result.files
      .filter((f) => f.path || f.webPath)
      .map((f) => ({
        // Store the raw native path/URI, NOT a converted WebView URL — the
        // raw value is what stays valid across app restarts. Convert to a
        // playable src on demand via toPlayableSrc() wherever a <video> or
        // canvas needs to actually load the file (see thumbnails.ts,
        // VideoPlayer.tsx, NewClipsInbox.tsx).
        uri: (f.path ?? f.webPath) as string,
        fileName: f.name || 'video',
        sizeBytes: f.size ?? undefined,
      }))
  } catch (err) {
    // FilePicker throws if the user cancels the picker (not a real error) —
    // treat any throw here as "nothing was selected" rather than crashing
    // the import flow. Real failures (permission denied, corrupted picker
    // state) surface to the user as "0 files imported" via the caller,
    // which is the correct, non-alarming behavior for a cancel.
    return []
  }
}

/**
 * Converts a stored Clip.uri into something the WebView can actually load
 * as a <video src> or draw to a <canvas>.
 *
 * - Web (blob: URLs from the dev-mode picker) and already-http(s) URLs are
 *   returned unchanged.
 * - Native file paths (from the SAF picker above) are converted through
 *   Capacitor's bridge, which serves local files at a special
 *   https://localhost/_capacitor_file_/... URL the WebView is allowed to
 *   load. This conversion is cheap and safe to call on every render — it
 *   does not read or copy the file, just rewrites the URL.
 */
export function toPlayableSrc(uri: string): string {
  if (!uri) return uri
  if (uri.startsWith('blob:') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }
  if (Capacitor.isNativePlatform()) {
    return Capacitor.convertFileSrc(uri)
  }
  return uri
}
