export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-base font-semibold text-vault-text">{title}</h2>
        <p className="mt-2 text-sm text-vault-muted">{message}</p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-card border border-vault-border py-3 text-sm text-vault-text active:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-card py-3 text-sm font-medium active:opacity-70 ${
              danger ? 'bg-vault-danger text-white' : 'bg-vault-gold text-vault-bg'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
