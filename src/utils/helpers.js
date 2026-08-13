// ---- Colors ---------------------------------------------------------------
// Named palettes (used before the color wheel) resolve to their 500-shade hex.
// Arbitrary hex colors pass straight through, so any <input type="color"> value works.
const colorHex = {
  lav: '#8d7cbd', mauve: '#996780', sage: '#6d916f', blush: '#b8717e',
  peach: '#bc6f55', lilac: '#7b7bb4', peri: '#747fc8', olive: '#8f8f49',
  clay: '#927856', slate: '#6b7280', indigo: '#4f64c0', teal: '#2d948c',
  amber: '#d9851d', rose: '#d64a63', sky: '#368cbc', emerald: '#36924d',
}

export function projectColor(color) {
  const hex = color && color.startsWith('#') ? color : (colorHex[color] || colorHex.slate)
  return { hex, dot: hex, solid: hex, bg: hex, text: hex }
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