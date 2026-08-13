import { useAppData } from '../context/AppDataContext'
import { progressToNext, levelTitle, projectColor, computeStreak } from '../utils/helpers'
import { energyInfo, todayStr } from '../data/defaults'

export default function Dashboard() {
  const { state, derived } = useAppData()
  const cfg = state.config
  const prog = progressToNext(cfg, derived.xp)
  const streak = computeStreak(derived.dayWins)
  const today = todayStr()
  const todayDay = state.calendar[today]

  const totalMilestones = state.projects.reduce((s, p) => s + p.milestones.length, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Level" value={`${levelTitle(cfg, derived.level)} · Lv${derived.level}`} sub={`${derived.xp} XP total`} />
        <Stat label="Projects" value={state.projects.length} sub={`${totalMilestones} checkpoints`} />
        <Stat label="Milestones done" value={derived.milestonesDone} sub={`of ${totalMilestones}`} />
        <Stat label="Best streak" value={`🔥 ${streak}`} sub={`${derived.gamesWon} days won`} />
      </div>

      <div className="bg-white rounded-xl border border-blush-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lav-900">XP — {levelTitle(cfg, derived.level)}</h2>
          <span className="text-xs text-lav-700/50">{derived.xp} / {prog.next} to Lv {derived.level + 1} ({Math.round(prog.pct)}%)</span>
        </div>
        <div className="h-3 bg-lav-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blush-400 to-lav-500 rounded-full transition-all" style={{ width: `${Math.min(100, prog.pct)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-blush-100 p-5">
          <h2 className="font-semibold text-lav-900 mb-4">Projects</h2>
          {state.projects.length === 0 ? (
            <p className="text-sm text-lav-700/50">No projects yet. Head to the Projects page.</p>
          ) : (
            <div className="space-y-3">
              {state.projects.map(p => {
                const pr = derived.perProject[p.id] || { done: 0, total: 0 }
                const pct = pr.total ? Math.round((pr.done / pr.total) * 100) : 0
                const c = projectColor(p.color)
                const e = energyInfo(p.energy)
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-lav-900">
                        <span>{p.icon}</span>
                        <span className="truncate">{p.name}</span>
                        <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${e.cls}`}>{e.label}</span>
                      </span>
                      <span className="text-xs text-lav-700/50 shrink-0">{pr.done}/{pr.total}</span>
                    </div>
                    <div className="h-2 bg-lav-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ backgroundColor: c.hex, width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-blush-100 p-5">
          <h2 className="font-semibold text-lav-900 mb-3">Today</h2>
          {!todayDay || (todayDay.blocks || []).length === 0 ? (
            <p className="text-sm text-lav-700/50">Nothing planned for today. Add a day in the Planner.</p>
          ) : (
            <div className="space-y-2">
              {todayDay.blocks.map(b => {
                const proj = state.projects.find(p => p.id === b.projectId)
                const c = proj ? projectColor(proj.color) : null
                return (
                  <div key={b.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c ? c.hex : '#8d7cbd' }} />
                    <span className="text-xs font-mono text-lav-700/40 w-9">{b.time}</span>
                    <span className={`flex-1 truncate ${b.done ? 'line-through text-lav-700/40' : 'text-lav-900'}`}>{b.label}</span>
                    {proj && <span className="text-xs shrink-0">{proj.icon}</span>}
                  </div>
                )
              })}
              <div className="h-2 bg-lav-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-sage-500 rounded-full" style={{ width: `${(todayDay.blocks.filter(x => x.done).length / todayDay.blocks.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-blush-100 p-5">
      <p className="text-xs text-lav-700/60 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-lav-900 mt-1 truncate">{value}</p>
      <p className="text-xs text-lav-700/50 mt-1">{sub}</p>
    </div>
  )
}
