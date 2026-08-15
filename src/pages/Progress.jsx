import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { levelTitle, progressToNext, configCurve, computeBadges, computeStreak, milestoneXp } from '../utils/helpers'
import { fmtShort, todayStr } from '../data/defaults'
import { ComposedChart, Bar, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Progress() {
  const { state, derived } = useAppData()
  const cfg = state.config
  const prog = progressToNext(cfg, derived.xp)
  const badges = computeBadges({ ...derived, projectsCount: state.projects.length })
  const streak = computeStreak(derived.dayWins)
  const earnedBadges = badges.filter(b => b.earned).length

  // XP from completed milestones, broken out per project.
  const milestoneBreakdown = useMemo(() => {
    const perProject = []
    let total = 0
    for (const p of state.projects) {
      let pxp = 0
      p.milestones.forEach((m, idx) => { if (m.done) pxp += milestoneXp(cfg, idx) })
      if (pxp > 0) perProject.push({ icon: p.icon, name: p.name, xp: pxp })
      total += pxp
    }
    return { perProject, total }
  }, [state.projects, cfg])

  const blockXp = Math.max(0, derived.xp - milestoneBreakdown.total)

  // Per-day XP earned, attributed to when you actually checked things off.
  const journeyData = useMemo(() => {
    const byDay = {} // date -> xp earned
    const add = (date, amt) => {
      if (!date) return
      byDay[date] = (byDay[date] || 0) + amt
    }

    // Completed scheduled blocks: +4 XP each (except Rest/Work).
    for (const [date, day] of Object.entries(state.calendar)) {
      for (const b of day.blocks || []) {
        if (b.done && b.flavor && b.flavor !== 'REST' && b.flavor !== 'WORK') {
          add(b.completedAt || date, 4)
        }
      }
    }

    // Completed milestones: index-based XP. Attribute to completion date; fall back to a
    // block that references it, else today (legacy data predates completion tracking).
    for (const p of state.projects) {
      p.milestones.forEach((m, idx) => {
        if (!m.done) return
        let when = m.completedAt
        if (!when) {
          for (const [date, day] of Object.entries(state.calendar)) {
            if ((day.blocks || []).some(b => b.milestoneId === m.id)) { when = date; break }
          }
        }
        add(when || todayStr(), milestoneXp(cfg, idx))
      })
    }

    const dates = Object.keys(byDay).sort()
    let cumulative = 0
    return dates.map(date => {
      cumulative += byDay[date]
      return { date: fmtShort(date), gained: byDay[date], total: cumulative }
    })
  }, [state.calendar, state.projects, cfg])

  const curve = configCurve(cfg)
  const ladder = useMemo(() => {
    const rows = []
    for (let l = derived.level + 1; l <= derived.level + 5; l++) {
      const req = curve[l - 1] != null ? curve[l - 1] : (rows.length ? rows[rows.length - 1].req + 300 : curve[derived.level - 1] + 300)
      rows.push({ level: l, title: levelTitle(cfg, l), req })
    }
    return rows
  }, [cfg, derived.level, curve])

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
          <h2 className="font-semibold text-lav-900 mb-1">Where your XP comes from</h2>
          <p className="text-xs text-lav-700/50 mb-4">{derived.xp} XP total</p>
          <div className="space-y-4">
            <BreakdownBar
              label="Milestones completed"
              hint="Check off checkpoints in a project — XP grows with each one in a project."
              value={milestoneBreakdown.total}
              total={derived.xp}
              color="#5d4fb8"
            />
            <BreakdownBar
              label="Planned blocks done"
              hint="Mark a scheduled block ✓ (+4 XP each). Rest & Work blocks don't count."
              value={blockXp}
              total={derived.xp}
              color="#2d948c"
            />
          </div>
          {milestoneBreakdown.perProject.length > 0 && (
            <div className="mt-4 pt-3 border-t border-blush-50">
              <p className="text-[11px] text-lav-700/50 mb-1.5">Milestone XP by project</p>
              <div className="space-y-1">
                {milestoneBreakdown.perProject.map(pp => (
                  <div key={pp.name} className="flex items-center justify-between text-xs">
                    <span className="text-lav-700 truncate">{pp.icon} {pp.name}</span>
                    <span className="text-lav-900 font-medium">{pp.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="h-2 bg-lav-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-lav-500 to-peri-400 rounded-full transition-all" style={{ width: `${Math.min(100, prog.pct)}%` }} />
          </div>
          <p className="text-[11px] text-lav-700/50 mt-1">{Math.round(prog.pct)}% of the way to the next level</p>
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
          <h2 className="font-semibold text-lav-900 mb-1">XP Journey</h2>
          <p className="text-xs text-lav-700/50 mb-3">XP earned on the day you actually checked something off — bars show that day's gain, the line is your running total.</p>
          {journeyData.length === 0 ? (
            <p className="text-sm text-lav-700/50 py-14 text-center">No XP yet — check off a milestone or a planned block and it'll show up here.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={journeyData}>
                  <defs>
                    <linearGradient id="xpg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8d7cbd" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8d7cbd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#b8717e' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#b8717e' }} tickLine={false} axisLine={false} width={34} />
                  <Tooltip
                    formatter={(value, name) => [name === 'gained' ? `${value} XP` : `${value} XP`, name === 'gained' ? 'Gained' : 'Total']}
                    labelFormatter={label => `Day ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="gained" name="XP gained" fill="#bb4056" radius={[3, 3, 0, 0]} maxBarSize={26} />
                  <Area type="monotone" dataKey="total" name="Running total" stroke="#8d7cbd" strokeWidth={2} fill="url(#xpg)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
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

function BreakdownBar({ label, hint, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-0.5">
        <span className="text-lav-700">{label}</span>
        <span className="text-lav-900 font-medium shrink-0">{value} XP <span className="text-lav-700/50">· {pct}%</span></span>
      </div>
      <p className="text-[10px] text-lav-700/40 mb-1">{hint}</p>
      <div className="h-2.5 bg-lav-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }} />
      </div>
    </div>
  )
}
