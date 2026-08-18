import { useRef, useState } from 'react'

export default function VideoPlayer({ uri, poster }: { uri: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [error, setError] = useState(false)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const toggleFullscreen = () => {
    const v = videoRef.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
  }

  if (error) {
    return (
      <div className="flex aspect-[9/16] w-full items-center justify-center rounded-card bg-vault-surface2 text-center text-sm text-vault-muted">
        Couldn't load this video.
        <br />
        The original file may have been moved or deleted.
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-card bg-black">
      <video
        ref={videoRef}
        src={uri}
        poster={poster}
        muted={muted}
        playsInline
        className="max-h-[70vh] w-full"
        onClick={togglePlay}
        onError={() => setError(true)}
        onEnded={() => setPlaying(false)}
      />
      <div className="flex items-center gap-4 bg-vault-surface2 px-4 py-2.5">
        <button onClick={togglePlay} className="text-lg text-vault-text active:opacity-60">
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={toggleMute} className="text-lg text-vault-text active:opacity-60">
          {muted ? '🔇' : '🔊'}
        </button>
        <div className="flex-1" />
        <button onClick={toggleFullscreen} className="text-lg text-vault-text active:opacity-60">
          ⛶
        </button>
      </div>
    </div>
  )
}
