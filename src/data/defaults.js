// Projectify — generic, customizable defaults.

export const APP_NAME = 'Projectify'

// Color themes swap the app's accent palette (blush = primary, lav = secondary, lilac = tertiary).
export const THEMES = [
  { id: 'cute vibe', label: 'Cute Vibe', blurb: 'Soft pink & purple', sample: ['#bb4056', '#7556c9'] },
  { id: 'sunset', label: 'Sunset', blurb: 'Warm orange & terracotta', sample: ['#ffb938', '#ad4b20'] },
  { id: 'ocean', label: 'Ocean', blurb: 'Calm blues & teals', sample: ['#5cade4', '#031f7c'] },
  { id: 'forest', label: 'Forest', blurb: 'Deep greens & sage', sample: ['#6a8c4f', '#176641'] },
  { id: 'joa', label: 'Joa', blurb: 'Vibrant purple & snot-green', sample: ['#93c900', '#82009c'] },
]

export const themeInfo = (id) => THEMES.find(t => t.id === id) || THEMES[0]

// Energy types describe how heavy a task is on cognition/body.
export const ENERGIES = [
  { id: 'deep', label: 'Cognitively taxing', cls: 'bg-lav-100 text-lav-700', dot: 'bg-lav-500' },
  { id: 'light', label: 'Creative', cls: 'bg-lilac-100 text-lilac-700', dot: 'bg-lilac-500' },
  { id: 'manual', label: 'Hands-on · craft', cls: 'bg-peach-100 text-peach-700', dot: 'bg-peach-500' },
  { id: 'selfcare', label: 'Self-care · food & body', cls: 'bg-mauve-100 text-mauve-700', dot: 'bg-mauve-500' },
]

export const energyInfo = (id) => ENERGIES.find(e => e.id === id) || ENERGIES[0]

// Colors available when creating a project.
export const COLORS = ['lav', 'mauve', 'sage', 'blush', 'peach', 'lilac', 'peri', 'olive', 'clay', 'slate', 'indigo', 'teal', 'amber', 'rose', 'sky', 'emerald']

export const ICONS = ['🌟', '🤖', '📚', '🏃', '💪', '🧵', '🪞', '🎵', '🎸', '🍱', '🎲', '💼', '🧩', '✏️', '🌱', '🎨', '🏠', '🧠', '📦']

// Milestone / scheduled-block flavors (what kind of work is it).
export const FLAVORS = {
  DEEP: { label: 'Deep', cls: 'bg-lav-100 text-lav-700', border: 'border-l-lav-500', xp: 6 },
  LIGHT: { label: 'Light', cls: 'bg-lilac-100 text-lilac-700', border: 'border-l-lilac-500', xp: 4 },
  MANUAL: { label: 'Hands-on', cls: 'bg-peach-100 text-peach-700', border: 'border-l-peach-500', xp: 4 },
  GYM: { label: 'Gym', cls: 'bg-blush-100 text-blush-700', border: 'border-l-blush-500', xp: 8 },
  RUN: { label: 'Run', cls: 'bg-sage-100 text-sage-700', border: 'border-l-sage-500', xp: 10 },
  RIDE: { label: 'Cycle', cls: 'bg-peri-100 text-peri-700', border: 'border-l-peri-500', xp: 6 },
  SELF: { label: 'Self-care', cls: 'bg-mauve-100 text-mauve-700', border: 'border-l-mauve-500', xp: 5 },
  FOOD: { label: 'Food', cls: 'bg-olive-100 text-olive-700', border: 'border-l-olive-500', xp: 5 },
  SOCIAL: { label: 'Social', cls: 'bg-mauve-100 text-mauve-700', border: 'border-l-mauve-500', xp: 4 },
  REST: { label: 'Rest', cls: 'bg-clay-100 text-clay-600', border: 'border-l-clay-300', xp: 0 },
  WORK: { label: 'Work', cls: 'bg-slate-100 text-slate-600', border: 'border-l-slate-400', xp: 0 },
}

export const flavorInfo = (id) => FLAVORS[id] || FLAVORS.LIGHT

// Default time ranges for a day's available window. { start: 'HH:MM', end: 'HH:MM' }
export const DEFAULT_RANGES = [
  { start: '08:00', end: '12:00' },
  { start: '13:00', end: '18:00' },
  { start: '19:00', end: '23:00' },
]

// ---- Gamification (editable) ----------------------------------------------
export const DEFAULT_CONFIG = {
  theme: 'cute vibe',
  levelCurve: [0, 50, 120, 210, 320, 450, 600, 770, 960, 1170, 1400, 1650, 1930, 2240, 2580, 2950, 3350, 3780, 4240, 4730, 5250],
  levelTitles: [
    'Spark', 'Sparksmith', 'Kindling', 'Coal', 'Ember', 'Flame', 'Blaze', 'Inferno',
    'Forge', 'Smelter', 'Anvil', 'Wright', 'Artisan', 'Master', 'Grandmaster', 'Summermaster',
  ],
  dailyWinThreshold: 3,
  milestoneXp: 20, // base XP per completed milestone (project milestones)
  bonusMilestoneXp: 10, // added per milestone beyond the first in a project
}

// ---- Starter content (empty-ish but with a gentle example) -----------------
// Each scheduled day maps date -> { note, ranges, blocks: [{id, time, flavor, label, projectId, milestoneId}] }
export function emptyState(config) {
  return {
    version: 1,
    config: { ...DEFAULT_CONFIG, ...config },
    projects: [],
    calendar: {}, // { 'YYYY-MM-DD': { note, ranges:[], blocks:[] } }
  }
}

export function demoState() {
  const state = emptyState()
  const today = new Date(todayStr() + 'T12:00:00')
  const at = (offset) => packDate(new Date(today.getTime() + offset * 86400000))

  state.projects = [
    {
      id: 'p1', name: 'Train for a 5K run', icon: '🏃', color: '#d9536f', energy: 'selfcare',
      goal: 'Run 5 km without stopping, comfortably',
      startDate: at(-12), endDate: at(18),
      milestones: [
        { id: 'p1-m1', name: 'Run 1 km without stopping', hours: 2, done: true },
        { id: 'p1-m2', name: 'Do 5 × 200 m intervals', hours: 3, done: true },
        { id: 'p1-m3', name: 'Run 3 km at an easy pace', hours: 4, done: false },
        { id: 'p1-m4', name: 'Run 5 km in under 40 min', hours: 5, done: false },
      ],
    },
    {
      id: 'p2', name: 'Learn guitar', icon: '🎸', color: '#368cbc', energy: 'light',
      goal: 'Play a full song from memory by summer',
      startDate: at(-20), endDate: at(25),
      milestones: [
        { id: 'p2-m1', name: 'Learn the C major scale', hours: 3, done: true },
        { id: 'p2-m2', name: 'Play chords: G, C, D, Em', hours: 4, done: false },
        { id: 'p2-m3', name: 'Strum along to a song', hours: 4, done: false },
        { id: 'p2-m4', name: 'Play a full song from memory', hours: 6, done: false },
      ],
    },
    {
      id: 'p3', name: 'Build a small web app', icon: '🤖', color: '#2d948c', energy: 'deep',
      goal: 'Ship an MVP my friends can actually use',
      startDate: at(-6), endDate: at(14),
      milestones: [
        { id: 'p3-m1', name: 'Sketch the idea & wireframe', hours: 2, done: true },
        { id: 'p3-m2', name: 'Build the main screen', hours: 6, done: false },
        { id: 'p3-m3', name: 'Add save / load', hours: 4, done: false },
        { id: 'p3-m4', name: 'Deploy it online', hours: 3, done: false },
      ],
    },
  ]

  state.calendar[at(-3)] = {
    note: 'Small wins day',
    ranges: [...DEFAULT_RANGES],
    blocks: [
      { id: uid(), time: '09:00', flavor: 'RUN', label: '1 km easy run', projectId: 'p1', milestoneId: 'p1-m1', done: true },
      { id: uid(), time: '14:00', flavor: 'LIGHT', label: 'C major scale drill', projectId: 'p2', milestoneId: 'p2-m1', done: true },
      { id: uid(), time: '18:00', flavor: 'DEEP', label: 'Wireframe sketches', projectId: 'p3', milestoneId: 'p3-m1', done: true },
    ],
  }
  state.calendar[at(-1)] = {
    note: 'Morning focus, evening easy',
    ranges: [...DEFAULT_RANGES],
    blocks: [
      { id: uid(), time: '08:00', flavor: 'RUN', label: '200 m intervals', projectId: 'p1', milestoneId: 'p1-m2', done: true },
      { id: uid(), time: '17:30', flavor: 'LIGHT', label: 'Guitar practice', projectId: 'p2', milestoneId: 'p2-m1', done: true },
    ],
  }
  state.calendar[todayStr()] = {
    note: 'Keep it simple',
    ranges: [...DEFAULT_RANGES],
    blocks: [
      { id: uid(), time: '09:30', flavor: 'DEEP', label: 'Build the main screen', projectId: 'p3', milestoneId: 'p3-m2', done: false },
      { id: uid(), time: '16:00', flavor: 'RUN', label: '3 km easy pace', projectId: 'p1', milestoneId: 'p1-m3', done: false },
      { id: uid(), time: '19:00', flavor: 'LIGHT', label: 'Chord practice', projectId: 'p2', milestoneId: 'p2-m2', done: false },
    ],
  }
  return state
}

// ---- Utils -----------------------------------------------------------------
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Day-first (EU) short date from an internal 'YYYY-MM-DD' string, e.g. "13/08".
export function fmtShort(dateStr) {
  if (!dateStr) return ''
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

export function packDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return todayStr()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
