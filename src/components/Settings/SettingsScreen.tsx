import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { db } from '@/db/db'
import { buildFullBackup, downloadJSON } from '@/utils/export'

export default function SettingsScreen() {
  const [confirmReset, setConfirmReset] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBackup = async () => {
    const backup = await buildFullBackup()
    downloadJSON(`clipvault_backup_${Date.now()}.json`, backup)
    setStatus('Backup exported.')
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!parsed.clips || !parsed.tags || !parsed.projects) {
        throw new Error('This file does not look like a ClipVault backup.')
      }
      await db.transaction('rw', db.clips, db.tags, db.projects, async () => {
        for (const clip of parsed.clips) await db.clips.put(clip)
        for (const tag of parsed.tags) await db.tags.put(tag)
        for (const project of parsed.projects) await db.projects.put(project)
      })
      setStatus(`Imported ${parsed.clips.length} clip records.`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      e.target.value = ''
    }
  }

  const handleReset = async () => {
    await db.transaction('rw', db.clips, db.tags, db.projects, async () => {
      await db.clips.clear()
      await db.tags.clear()
      await db.projects.clear()
    })
    setConfirmReset(false)
    setStatus('All ClipVault metadata was reset. Your video files were not touched.')
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <h1 className="font-display text-xl font-bold text-vault-text">Settings</h1>

      <Section title="Appearance">
        <p className="text-sm text-vault-muted">
          Dark mode is the only theme in this version — matches how the app is designed to look
          on an OLED phone screen at night, which is when most tagging happens.
        </p>
      </Section>

      <Section title="Metadata backup">
        <p className="mb-3 text-sm text-vault-muted">
          Exports tags, categories, favorites, projects, and notes as JSON. Video files are never
          included.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleBackup}
            className="flex-1 rounded-card bg-vault-gold py-2.5 text-sm font-semibold text-vault-bg active:opacity-80"
          >
            Export backup
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 rounded-card border border-vault-border py-2.5 text-sm text-vault-text active:opacity-70"
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </Section>

      <Section title="Danger zone">
        <button
          onClick={() => setConfirmReset(true)}
          className="w-full rounded-card border border-vault-danger py-2.5 text-sm text-vault-danger active:opacity-70"
        >
          Reset app data
        </button>
        <p className="mt-2 text-xs text-vault-muted">
          Clears all ClipVault tags, favorites, and projects. Your original video files on the
          device are never deleted.
        </p>
      </Section>

      {status && <p className="mt-4 text-xs text-vault-teal">{status}</p>}

      <ConfirmDialog
        open={confirmReset}
        title="Reset all app data?"
        message="This permanently deletes every clip's tags, favorites, notes, and all projects from ClipVault. This cannot be undone. Your original video files are never touched."
        confirmLabel="Reset data"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-card border border-vault-border bg-vault-surface p-4">
      <p className="mb-2 text-xs uppercase tracking-wide text-vault-muted">{title}</p>
      {children}
    </div>
  )
}
