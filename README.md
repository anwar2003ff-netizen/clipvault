# ClipVault

A local-first, mobile video clip library for organizing, tagging, searching, and
ranking short animal clips into projects like "Top 5 Fat Cats." Built to be
developed and run entirely from an Android phone (Termux), with no PC,
backend, or paid API required.

## 1. Architecture summary

**Stack:** React + TypeScript + Vite + Tailwind CSS, Dexie.js (IndexedDB) for
local storage, Capacitor for packaging the web app into an Android APK.

**Why this stack for a phone-only, GitHub-based workflow:**
- No native Android toolchain needed on-device — you write React/TS in
  Termux, and the actual Android build happens on GitHub Actions (cloud).
- IndexedDB via Dexie is a real embedded database (not localStorage), fast
  enough for thousands of rows, and needs zero server.
- Capacitor is the thinnest, most stable way to wrap a web app as an
  installable APK while still allowing native file access later.

**Data model** (`src/types/index.ts`):
- `Clip` — id, `uri` (reference to the file on-device, never a copy),
  fileName, title, thumbnail (small base64 JPEG), duration, tags[],
  category, favorite, notes, isNew, useCount.
- `TagUsage` — tag name + count, powers autocomplete/reuse.
- `Project` — id, name, ordered `slots` (`{ rank, clipId }[]`), notes, and
  reserved fields (`transition`, `effect`, `commentaryText`) for a future
  video-automation pipeline.

**Storage principle:** ClipVault never copies or stores video bytes. Every
`Clip.uri` is a reference to the original file. Deleting a clip's metadata
never deletes the underlying video.

**Screens → files:**
```
Home        → src/components/Home/HomeScreen.tsx
Library     → src/components/Library/{LibraryScreen,ClipCard,FilterPanel,SelectionBar}.tsx
Favorites   → src/components/Favorites/FavoritesScreen.tsx
Projects    → src/components/Projects/{ProjectsScreen,ProjectEditor}.tsx
Settings    → src/components/Settings/SettingsScreen.tsx
Clip detail → src/components/ClipDetails/ClipDetailsScreen.tsx
New Clips   → src/components/NewClips/NewClipsInbox.tsx
```

**Modular core logic** (no UI dependencies, easy to unit test or reuse):
```
src/db/db.ts            Dexie schema
src/lib/search.ts        free-text search + multi-tag AND filtering
src/lib/similarity.ts    "Find Similar" — tag-overlap scoring (v1, no AI)
src/lib/fileHandling.ts  file picker abstraction (web vs. native)
src/lib/thumbnails.ts    on-device thumbnail generation via canvas
src/hooks/useClips.ts    all clip reads/mutations, incl. batch operations
src/hooks/useProjects.ts project CRUD + ranking mutations
src/utils/export.ts      project JSON export + full metadata backup
```

## 2. Development phases (status)

- ✅ **Phase 1** — Mobile UI shell, local storage, import clips, library grid, video preview
- ✅ **Phase 2** — Tags, categories, search, filters, favorites
- ✅ **Phase 3** — Batch tagging, New Clips inbox, Find Similar, fast tagging workflow
- ✅ **Phase 4** — Projects, #N → #1 ranking, project management
- ✅ **Phase 5** — JSON export, metadata backup/import
- 🔶 **Phase 6 (partial)** — Error handling for missing/corrupt files is in place
  (see `fileMissing` on `Clip`, error state in `VideoPlayer`), and native file
  picking with persistent URIs is wired up (see section 5). Remaining
  follow-up:
  1. **Virtualized grid for very large libraries.** The Library grid renders
     with plain CSS grid + `loading="lazy"` images today, which comfortably
     handles hundreds of clips. If your library grows into the low
     thousands and scrolling gets janky, swap the grid in
     `LibraryScreen.tsx` for `react-window`'s `FixedSizeGrid` — the data
     layer underneath doesn't change.

## 3. Setup — from your Android phone (Termux)

```bash
pkg install nodejs-lts git
git clone <your-repo-url> clipvault
cd clipvault
npm install
npm run dev
```

Open the URL Vite prints (something like `http://localhost:5173`) in Chrome
on your phone. Because `server.host: true` is set in `vite.config.ts`, you
can also open it from another device on the same Wi-Fi using your phone's
local IP.

> Note: file picking during `npm run dev` uses the browser's file picker
> (works fully for testing tagging, search, filters, projects — just not
> persistent across restarts, see Phase 6 note above).

## 4. Building the Android APK — no PC required

The APK is built by GitHub Actions in the cloud (`.github/workflows/build-android.yml`).

1. Push this repo to GitHub (from Termux: `git remote add origin <url>`, then
   `git push -u origin main`).
2. On github.com (or the GitHub mobile app), go to **Actions → Build Android
   APK → Run workflow**.
3. Wait for the run to finish (a few minutes).
4. Open the completed run → **Artifacts** → download `clipvault-debug-apk`.
5. Unzip it on your phone and tap the `.apk` to install (you'll need to allow
   "install unknown apps" for your file manager/browser once).

This workflow runs `npm ci`, `npm run build`, `npx cap add android`,
`npx cap sync android`, then `./gradlew assembleDebug` — the same steps
you'd run locally, just executed on GitHub's servers instead of your phone.

To build a **release** (signed) APK instead of a debug one, you'll need a
signing keystore stored as a GitHub Actions secret — ask me when you're
ready for that and I'll add the signing step.

## 5. Native file access

Implemented in `src/lib/fileHandling.ts` using `@capawesome/capacitor-file-picker`
(SAF-based, MIT licensed). On a native Android build, tapping **+ Add Clips**
opens the system file picker; the returned native path is stored as
`Clip.uri` and converted on demand to a WebView-loadable URL via
`toPlayableSrc()` (used everywhere a clip is actually played or
thumbnailed — the video player, the New Clips inbox preview, and thumbnail
generation). Nothing else in the app needed to change since `Clip.uri` was
always treated as an opaque reference.

If you add or change native plugins like this one, remember to run
`npx cap sync android` (the GitHub Actions workflow already does this on
every build) so the native project picks up the new dependency.

**If Add Clips ever appears to do nothing again:** the button now always
shows a status line — "Imported N clips," a per-file error, or nothing if
you simply cancelled the picker — instead of failing silently. If you see
an error message there, send it over and it's a quick fix.

## 6. Dependency list

Runtime: `react`, `react-dom`, `dexie`, `dexie-react-hooks`, `@capacitor/core`, `@capacitor/filesystem`
Build/dev: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `@capacitor/android`, `@capacitor/cli`, ESLint tooling

No paid APIs, no AI services, no backend server, no user accounts.

## 7. Project structure

```
clipvault/
├── .github/workflows/build-android.yml   # cloud APK build
├── capacitor.config.ts
├── index.html
├── package.json
├── src/
│   ├── main.tsx / App.tsx / index.css
│   ├── types/index.ts                    # data model
│   ├── db/db.ts                          # Dexie schema
│   ├── lib/                              # search, similarity, files, thumbnails
│   ├── hooks/                            # useClips, useTags, useProjects
│   ├── utils/export.ts                   # JSON export + backup
│   └── components/                       # Home, Library, Favorites, Projects,
│                                          # Settings, ClipDetails, NewClips, shared, Layout
└── README.md
```

## 8. Known Android considerations

- **Storage permissions**: on Android 13+, video access uses the
  `READ_MEDIA_VIDEO` runtime permission rather than broad storage access —
  the native file-picker plugin recommended above handles this.
- **Large libraries**: metadata-only storage keeps the DB small (a few KB
  per clip); thumbnails are capped at 320px wide JPEGs (~10–25KB each).
- **Corrupted/moved files**: `Clip.fileMissing` and the `VideoPlayer` error
  state are already wired up so one bad reference never crashes the app.
- **WebView video codecs**: Capacitor renders through Android's system
  WebView, which supports standard H.264/VP9 MP4 — matches what your
  RankTrue pipeline already outputs.
