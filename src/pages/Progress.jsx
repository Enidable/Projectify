import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { levelTitle, progressToNext, configCurve, computeBadges, computeStreak, milestoneXp } from '../utils/helpers'
import { fmtShort } from '../data/defaults'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Progress() {
  const { state, derived } = useAppData()
  const cfg = state.config
  const prog = progressToNext(cfg, derived.xp)
  const badges = computeBadges({ ...derived, projectsCount: state.projects.length })
  const streak = computeStreak(derived.dayWins)
  const earnedBadges = badges.filter(b => b.earned).length

  const xpBreakdown = useMemo(() => {
    let milestones = 0
    for (const p of state.projects) {
      p.milestones.forEach((m, idx) => { if (m.done) milestones += milestoneXp(cfg, idx) })
    }
    const blocks = Math.max(0, derived.xp - milestones)
    return { milestones, blocks, total: derived.xp }
  }, [state.projects, cfg, derived.xp, derived.milestonesDone]) // milestonesDone to recalc when toggled

  const curve = configCurve(cfg)
  const ladder = useMemo(() => {
    const rows = []
    for (let l = derived.level + 1; l <= derived.level + 5; l++) {
      const req = curve[l - 1] != null ? curve[l - 1] : (rows.length ? rows[rows.length - 1].req + 300 : curve[derived.level - 1] + 300)
      rows.push({ level: l, title: levelTitle(cfg, l), req })
    }
    return rows
  }, [cfg, derived.level, curve])

  const chartData = useMemo(() => {
    const days = Object.keys(state.calendar).sort()
    let xp = 0
    return days.map(date => {
      const day = state.calendar[date]
      for (const b of day.blocks || []) {
        if (b.done) xp += 4
      }
      return { date: fmtShort(date), xp }
    })
  }, [state.calendar])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-lav-800 to-blush-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-lav-200">Level {derived.level}</p>
            <h2 className="text-3xl font-bold mt-1">{levelTitle(cfg, derived.level)}</h2>
            <p className="text-sm text-lav-100 mt-1">{derived.xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">🔥 {streak}</p>
            <p className="text-xs text-lav-100">day streak</p>
          </div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, prog.pct)}%` }} />
        </div>
        <p className="text-xs text-lav-100 mt-2">
          {Math.round(prog.pct)}% to Level {derived.level + 1} · next title: <span className="font-semibold text-white">{levelTitle(cfg, derived.level + 1)}</span> at {prog.next} XP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-blush-100 p-5">
          <h2 className="font-semibold text-lav-900 mb-3">Where your XP comes from</h2>
          <p className="text-xs text-lav-700/50 mb-3">{xpBreakdown.total} XP total</p>
          <div className="space-y-3">
            <BreakdownBar label="Milestones" value={xpBreakdown.milestones} total={xpBreakdown.total} color="#5d4fb8" />
            <BreakdownBar label="Completed planned blocks" value={xpBreakdown.blocks} total={xpBreakdown.total} color="#2d948c" />
          </div>
          <div className="h-2 bg-lav-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-lav-500 to-peri-400 rounded-full transition-all" style={{ width: `${Math.min(100, prog.pct)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blush-100 p-5">
          <h2 className="font-semibold text-lav-900 mb-3">Next titles</h2>
          <div className="space-y-1.5">
            {ladder.map(row => (
              <div key={row.level} className="flex items-center justify-between text-xs rounded-lg border border-blush-100 bg-lav-50/60 px-3 py-2">
                <span className="text-lav-700">Lv {row.level}</span>
                <span className="font-medium text-lav-900">{row.title}</span>
                <span className="text-lav-700/50">{row.req} XP</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-lav-700/50 mt-3">Titles live in the level curve — edit them under config in defaults.js.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-blush-100 p-5">
          <h2 className="font-semibold text-lav-900 mb-3">XP Journey</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="xpg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8d7cbd" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8d7cbd" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#b8717e' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#b8717e' }} tickLine={false} axisLine={false} width={34} />
                <Tooltip />
                <Area type="monotone" dataKey="xp" stroke="#8d7cbd" strokeWidth={2} fill="url(#xpg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blush-100 p-5">
          <h2 className="font-semibold text-lav-900 mb-3">Badges <span className="text-xs font-normal text-lav-700/50">({earnedBadges}/{badges.length})</span></h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.map(b => (
              <div key={b.id} className={`rounded-xl border p-3 ${b.earned ? 'border-blush-200 bg-blush-50' : 'border-blush-100 bg-lav-50 opacity-50'}`}>
                <div className="text-2xl">{b.icon}</div>
                <p className="text-sm font-medium text-lav-900 mt-1">{b.name}</p>
                <p className="text-[11px] text-lav-700/50">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BreakdownBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-lav-700">{label}</span>
        <span className="text-lav-900 font-medium">{value} XP <span className="text-lav-700/50">· {pct}%</span></span>
      </div>
      <div className="h-2 bg-lav-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }} />
      </div>
    </div>
  )
}
