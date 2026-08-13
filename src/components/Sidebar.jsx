import { useAppData } from '../context/AppDataContext'
import { levelTitle } from '../utils/helpers'

const items = [
  { name: 'Dashboard', icon: '📊' },
  { name: 'Projects', icon: '🎯' },
  { name: 'Calendar', icon: '🗓️' },
  { name: 'Timeline', icon: '🛤️' },
  { name: 'Progress', icon: '🏆' },
]

export default function Sidebar({ active, onNavigate }) {
  const { derived, state } = useAppData()
  const cfg = state.config
  return (
    <aside className="bg-gradient-to-b from-lav-900 to-lav-800 text-white flex flex-col w-56 shrink-0">
      <div className="flex items-center justify-between px-4 h-14 border-b border-lav-700/40">
        <span className="font-bold text-lg tracking-tight flex items-center gap-2">🧩 Projectify</span>
      </div>
      <div className="px-4 py-2 border-b border-lav-700/40 bg-lav-800/40">
        <p className="text-[11px] text-lav-200 uppercase tracking-wider">Lv {derived.level}</p>
        <p className="text-sm font-semibold text-white">{levelTitle(cfg, derived.level)} · {derived.xp} XP</p>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {items.map(item => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
              active === item.name ? 'bg-lav-600 text-white font-medium' : 'text-lav-200 hover:text-white hover:bg-lav-700/50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="border-t border-lav-700/40 p-4 text-xs text-lav-200">
        <span className="block">{derived.projectsCount} projects · {derived.milestonesDone} milestones</span>
        <span className="block text-lav-300/60 mt-1">v0.1.0</span>
      </div>
    </aside>
  )
}
