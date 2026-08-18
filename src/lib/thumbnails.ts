const THUMB_WIDTH = 320 // keeps the DB small: ~10-25KB per thumbnail as base64 JPEG

/**
 * Loads a video from `uri`, seeks to ~10% in (skips black opening frames
 * common in raw phone clips), captures a frame, and returns a small
 * base64 JPEG plus the clip duration. Runs entirely on-device.
 */
export function generateThumbnail(
  uri: string,
): Promise<{ thumbnailDataUrl: string; durationSec: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'
    video.src = uri

    const cleanup = () => {
      video.src = ''
      video.load()
    }

    video.onloadedmetadata = () => {
      const seekTo = Math.min(video.duration * 0.1, 1)
      video.currentTime = Number.isFinite(seekTo) ? seekTo : 0
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        const scale = THUMB_WIDTH / video.videoWidth
        canvas.width = THUMB_WIDTH
        canvas.height = Math.round(video.videoHeight * scale) || THUMB_WIDTH
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.6)
        const durationSec = Number.isFinite(video.duration) ? video.duration : 0
        cleanup()
        resolve({ thumbnailDataUrl, durationSec })
      } catch (err) {
        cleanup()
        reject(err)
      }
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Could not load video for thumbnail generation'))
    }
  })
}
