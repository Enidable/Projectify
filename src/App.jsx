import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Calendar from './pages/Calendar'
import Timeline from './pages/Timeline'
import Progress from './pages/Progress'
import { AppDataProvider, useAppData } from './context/AppDataContext'

const pages = {
  Dashboard: { component: Dashboard, title: 'Dashboard', subtitle: 'Your projects at a glance' },
  Projects: { component: Projects, title: 'Projects', subtitle: 'Create projects and checkpoints' },
  Calendar: { component: Calendar, title: 'Planner', subtitle: 'Schedule work on your days' },
  Timeline: { component: Timeline, title: 'Timeline', subtitle: 'Project start & target dates' },
  Progress: { component: Progress, title: 'Progress', subtitle: 'XP, levels, badges & streaks' },
}

function Shell() {
  const [active, setActive] = useState('Dashboard')
  const { state } = useAppData()
  const [showHelp, setShowHelp] = useState(false)

  const firstRun = state.projects.length === 0 && Object.keys(state.calendar).length === 0
  useEffect(() => {
    if (firstRun) setShowHelp(true)
  }, [firstRun])

  const { component: Page, title, subtitle } = pages[active]
  return (
    <div className="flex h-screen bg-paper">
      <Sidebar active={active} onNavigate={setActive} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} onShowHelp={() => setShowHelp(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Page />
        </main>
      </div>
      <HelpModal open={!!showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}

export default function App() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  )
}
