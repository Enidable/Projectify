import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Calendar from './pages/Calendar'
import Timeline from './pages/Timeline'
import Progress from './pages/Progress'
import { AppDataProvider } from './context/AppDataContext'

const pages = {
  Dashboard: { component: Dashboard, title: 'Dashboard', subtitle: 'Your projects at a glance' },
  Projects: { component: Projects, title: 'Projects', subtitle: 'Create projects and checkpoints' },
  Calendar: { component: Calendar, title: 'Planner', subtitle: 'Schedule work on your days' },
  Timeline: { component: Timeline, title: 'Timeline', subtitle: 'Project start & target dates' },
  Progress: { component: Progress, title: 'Progress', subtitle: 'XP, levels, badges & streaks' },
}

function Shell() {
  const [active, setActive] = useState('Dashboard')
  const { component: Page, title, subtitle } = pages[active]
  return (
    <div className="flex h-screen bg-paper">
      <Sidebar active={active} onNavigate={setActive} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Page />
        </main>
      </div>
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
