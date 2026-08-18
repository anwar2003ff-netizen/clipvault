export default function TagChip({
  label,
  selected = false,
  onClick,
  onRemove,
}: {
  label: string
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
}) {
  const interactive = Boolean(onClick)
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${
        selected
          ? 'border-vault-gold bg-vault-gold/15 text-vault-gold'
          : 'border-vault-border bg-vault-surface2 text-vault-muted'
      } ${interactive ? 'active:opacity-70' : ''}`}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 text-vault-muted"
          aria-label={`Remove ${label}`}
        >
          ✕
        </button>
      )}
    </span>
  )
}
