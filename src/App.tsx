import { useState } from 'react'
import BottomNav from '@/components/Layout/BottomNav'
import HomeScreen from '@/components/Home/HomeScreen'
import LibraryScreen from '@/components/Library/LibraryScreen'
import FavoritesScreen from '@/components/Favorites/FavoritesScreen'
import ProjectsScreen from '@/components/Projects/ProjectsScreen'
import SettingsScreen from '@/components/Settings/SettingsScreen'
import ClipDetailsScreen from '@/components/ClipDetails/ClipDetailsScreen'
import NewClipsInbox from '@/components/NewClips/NewClipsInbox'
import ProjectEditor from '@/components/Projects/ProjectEditor'

export type Tab = 'home' | 'library' | 'favorites' | 'projects' | 'settings'

// A tiny hand-rolled navigation stack. A dedicated router is unnecessary
// for a 5-tab app plus a couple of modal-style detail screens, and this
// keeps the dependency list (and bundle size) minimal, per the project's
// "avoid unnecessary dependencies" requirement.
export type Route =
  | { name: 'tab'; tab: Tab }
  | { name: 'clipDetails'; clipId: string; from: Tab }
  | { name: 'newClipsInbox' }
  | { name: 'projectEditor'; projectId: string }

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'tab', tab: 'home' })
  const activeTab = route.name === 'tab' ? route.tab : route.name === 'clipDetails' ? route.from : 'projects'

  const openClip = (clipId: string) =>
    setRoute({ name: 'clipDetails', clipId, from: activeTab })
  const openNewClipsInbox = () => setRoute({ name: 'newClipsInbox' })
  const openProject = (projectId: string) => setRoute({ name: 'projectEditor', projectId })
  const goToTab = (tab: Tab) => setRoute({ name: 'tab', tab })

  return (
    <div className="flex h-screen flex-col bg-vault-bg text-vault-text safe-top">
      <main className="flex-1 overflow-y-auto pb-20">
        {route.name === 'tab' && route.tab === 'home' && (
          <HomeScreen onOpenClip={openClip} onOpenNewClips={openNewClipsInbox} onGoToTab={goToTab} />
        )}
        {route.name === 'tab' && route.tab === 'library' && (
          <LibraryScreen onOpenClip={openClip} />
        )}
        {route.name === 'tab' && route.tab === 'favorites' && (
          <FavoritesScreen onOpenClip={openClip} />
        )}
        {route.name === 'tab' && route.tab === 'projects' && (
          <ProjectsScreen onOpenProject={openProject} />
        )}
        {route.name === 'tab' && route.tab === 'settings' && <SettingsScreen />}

        {route.name === 'clipDetails' && (
          <ClipDetailsScreen
            clipId={route.clipId}
            onBack={() => goToTab(route.from)}
            onOpenClip={openClip}
          />
        )}
        {route.name === 'newClipsInbox' && (
          <NewClipsInbox onDone={() => goToTab('home')} />
        )}
        {route.name === 'projectEditor' && (
          <ProjectEditor projectId={route.projectId} onBack={() => goToTab('projects')} />
        )}
      </main>

      {route.name !== 'clipDetails' && route.name !== 'newClipsInbox' && route.name !== 'projectEditor' && (
        <BottomNav active={activeTab} onChange={goToTab} />
      )}
    </div>
  )
}
