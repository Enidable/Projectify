// ---- Colors ---------------------------------------------------------------
const colorVariants = {
  lav: { bg: 'bg-lav-100', text: 'text-lav-700', dot: 'bg-lav-500', solid: 'bg-lav-500' },
  mauve: { bg: 'bg-mauve-100', text: 'text-mauve-700', dot: 'bg-mauve-500', solid: 'bg-mauve-500' },
  sage: { bg: 'bg-sage-100', text: 'text-sage-700', dot: 'bg-sage-500', solid: 'bg-sage-500' },
  blush: { bg: 'bg-blush-100', text: 'text-blush-700', dot: 'bg-blush-500', solid: 'bg-blush-500' },
  peach: { bg: 'bg-peach-100', text: 'text-peach-700', dot: 'bg-peach-500', solid: 'bg-peach-500' },
  lilac: { bg: 'bg-lilac-100', text: 'text-lilac-700', dot: 'bg-lilac-500', solid: 'bg-lilac-500' },
  peri: { bg: 'bg-peri-100', text: 'text-peri-700', dot: 'bg-peri-500', solid: 'bg-peri-500' },
  olive: { bg: 'bg-olive-100', text: 'text-olive-700', dot: 'bg-olive-500', solid: 'bg-olive-500' },
  clay: { bg: 'bg-clay-100', text: 'text-clay-700', dot: 'bg-clay-500', solid: 'bg-clay-500' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', solid: 'bg-slate-500' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', solid: 'bg-indigo-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500', solid: 'bg-teal-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', solid: 'bg-amber-500' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', solid: 'bg-rose-500' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500', solid: 'bg-sky-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', solid: 'bg-emerald-500' },
}

export function projectColor(color) {
  return colorVariants[color] || colorVariants.slate
}

// ---- Gamification ----------------------------------------------------------
export function levelForXp(cfg, xp) {
  let level = 1
  for (let i = 1; i < configCurve(cfg).length; i++) {
    if (xp >= configCurve(cfg)[i]) level = i + 1
    else break
  }
  return level
}

export function configCurve(cfg) {
  return (cfg && cfg.levelCurve && cfg.levelCurve.length) ? cfg.levelCurve : [0, 50, 100]
}

export function progressToNext(cfg, xp) {
  const lvl = levelForXp(cfg, xp)
  const curve = configCurve(cfg)
  const floor = curve[lvl - 1]
  const ceil = curve[lvl] != null ? curve[lvl] : floor + 60
  return { pct: ((xp - floor) / (ceil - floor)) * 100, next: ceil, floor }
}

export function levelTitle(cfg, level) {
  const titles = (cfg && cfg.levelTitles) || []
  return titles[level - 1] || 'Summermaster'
}

// ---- XP from project milestone completion ----------------------------------
export function milestoneXp(cfg, indexInProject) {
  const base = (cfg && cfg.milestoneXp) || 20
  const bonus = (cfg && cfg.bonusMilestoneXp) || 10
  return base + ((indexInProject || 0) * bonus)
}

// ---- Badges ----------------------------------------------------------------
export function computeBadges(d) {
  const b = []
  b.push({ id: 'first', name: 'First Step', desc: 'Complete your first milestone', earned: d.milestonesDone >= 1, icon: '👣' })
  b.push({ id: 'five', name: 'On a Roll', desc: '5 milestones completed', earned: d.milestonesDone >= 5, icon: '🎯' })
  b.push({ id: 'ten', name: 'Unstoppable', desc: '10 milestones completed', earned: d.milestonesDone >= 10, icon: '⚡' })
  b.push({ id: 'twenty', name: 'Marathon Mind', desc: '20 milestones completed', earned: d.milestonesDone >= 20, icon: '🏆' })
  b.push({ id: 'day', name: 'Day Won', desc: 'Beat your first snappy day', earned: d.daysWon >= 1, icon: '🗓️' })
  b.push({ id: 'days', name: 'Momentum', desc: 'Win 5 days', earned: d.daysWon >= 5, icon: '🔥' })
  b.push({ id: 'plan', name: 'Planner', desc: 'Create your first project', earned: d.projectsCount >= 1, icon: '📋' })
  b.push({ id: 'lvl', name: 'Rising', desc: 'Reach Level 5', earned: (d.level || 1) >= 5, icon: '⭐' })
  return b
}

// ---- Streak ----------------------------------------------------------------
import { packDate, todayStr } from '../data/defaults'

export function computeStreak(dailyWinsByDate) {  let streak = 0
  let d = todayStr()
  while (dailyWinsByDate[d]) {
    streak++
    d = packDate(new Date(d + 'T12:00:00').getTime() - 86400000)
  }
  return streak
}