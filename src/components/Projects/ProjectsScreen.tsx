import { useState } from 'react'
import { useProjects, createProject } from '@/hooks/useProjects'
import EmptyState from '@/components/shared/EmptyState'

export default function ProjectsScreen({
  onOpenProject,
}: {
  onOpenProject: (id: string) => void
}) {
  const projects = useProjects()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [rankCount, setRankCount] = useState(5)

  const handleCreate = async () => {
    if (!name.trim()) return
    const id = await createProject(name.trim(), rankCount)
    setCreating(false)
    setName('')
    onOpenProject(id)
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-vault-text">Projects</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-card bg-vault-gold px-3 py-2 text-xs font-semibold text-vault-bg active:opacity-80"
        >
          + New
        </button>
      </div>

      {(projects ?? []).length === 0 ? (
        <EmptyState
          icon="☰"
          title="No projects yet"
          subtitle='Create a ranking project like "Top 5 Fat Cats".'
          action={
            <button
              onClick={() => setCreating(true)}
              className="rounded-card bg-vault-gold px-5 py-2.5 text-sm font-semibold text-vault-bg active:opacity-80"
            >
              + New Project
            </button>
          }
        />
      ) : (
        <div className="mt-4 flex flex-col gap-2 pb-8">
          {(projects ?? []).map((p) => {
            const filled = p.slots.filter((s) => s.clipId).length
            return (
              <button
                key={p.id}
                onClick={() => onOpenProject(p.id)}
                className="rounded-card border border-vault-border bg-vault-surface px-4 py-3 text-left active:opacity-70"
              >
                <p className="font-display text-sm font-semibold text-vault-text">{p.name}</p>
                <p className="mt-0.5 text-xs text-vault-muted">
                  {filled}/{p.slots.length} clips ranked · Updated{' '}
                  {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </button>
            )
          })}
        </div>
      )}

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setCreating(false)}
        >
          <div
            className="w-full max-w-md rounded-t-card border-t border-vault-border bg-vault-surface p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-base font-semibold text-vault-text">New project</h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Top 5 Fat Cats"
              className="mt-3 w-full rounded-card border border-vault-border bg-vault-surface2 px-3 py-2.5 text-sm text-vault-text placeholder:text-vault-muted focus:border-vault-gold focus:outline-none"
            />
            <p className="mt-3 mb-1 text-xs uppercase tracking-wide text-vault-muted">
              Ranking size
            </p>
            <div className="flex gap-2">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setRankCount(n)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    rankCount === n
                      ? 'border-vault-gold bg-vault-gold/15 text-vault-gold'
                      : 'border-vault-border text-vault-muted'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreate}
              className="mt-5 w-full rounded-card bg-vault-gold py-3 text-sm font-semibold text-vault-bg active:opacity-80"
            >
              Create project
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
