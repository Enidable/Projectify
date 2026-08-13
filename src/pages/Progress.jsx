import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { levelTitle, progressToNext, computeBadges, computeStreak } from '../utils/helpers'
import { fmtShort } from '../data/defaults'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Progress() {
  const { state, derived } = useAppData()
  const cfg = state.config
  const prog = progressToNext(cfg, derived.xp)
  const badges = computeBadges({ ...derived, projectsCount: state.projects.length })
  const streak = computeStreak(derived.dayWins)
  const earnedBadges = badges.filter(b => b.earned).length

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
        <p className="text-xs text-lav-100 mt-2">{Math.round(prog.pct)}% to Level {derived.level + 1} ({prog.next} XP)</p>
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
