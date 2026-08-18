import type { ReactNode } from 'react'

export default function Header({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-vault-border bg-vault-bg/95 px-4 py-3 backdrop-blur">
      {onBack && (
        <button onClick={onBack} className="text-xl text-vault-muted active:opacity-60" aria-label="Back">
          ←
        </button>
      )}
      <h1 className="font-display flex-1 truncate text-lg font-semibold text-vault-text">
        {title}
      </h1>
      {right}
    </header>
  )
}
