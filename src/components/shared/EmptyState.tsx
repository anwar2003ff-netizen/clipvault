import type { ReactNode } from 'react'

export default function EmptyState({
  icon = '🎬',
  title,
  subtitle,
  action,
}: {
  icon?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-8 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-display text-base font-semibold text-vault-text">{title}</p>
      {subtitle && <p className="text-sm text-vault-muted">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
