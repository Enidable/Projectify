import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { emptyState, uid, DEFAULT_CONFIG } from '../data/defaults'
import { milestoneXp, levelForXp } from '../utils/helpers'

const STORAGE_KEY = 'projectify_state_v1'
const AppDataContext = createContext(null)

export function useAppData() {
  return useContext(AppDataContext)
}

function loadJSON() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function normalize(state) {
  const s = state || {}
  return {
    version: s.version || 1,
    config: { ...DEFAULT_CONFIG, ...(s.config ? s.config : {}) },
    projects: Array.isArray(s.projects) ? s.projects : [],
    calendar: s.calendar && typeof s.calendar === 'object' ? s.calendar : {},
  }
}

export function AppDataProvider({ children }) {
  const [state, setState] = useState(() => normalize(loadJSON()))

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  // ---- Projects ------------------------------------------------------------
  const addProject = useCallback((p) => {
    setState(prev => ({ ...prev, projects: [{ ...p, id: uid(), milestones: [] }, ...prev.projects] }))
  }, [])

  const updateProject = useCallback((id, patch) => {
    setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, ...patch } : p) }))
  }, [])

  const deleteProject = useCallback((id) => {
    setState(prev => {
      const calendar = {}
      for (const [date, day] of Object.entries(prev.calendar)) {
        calendar[date] = { ...day, blocks: (day.blocks || []).filter(b => b.projectId !== id) }
      }
      return { ...prev, projects: prev.projects.filter(p => p.id !== id), calendar }
    })
  }, [])

  // ---- Milestones ----------------------------------------------------------
  const addMilestone = useCallback((projectId, m) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId
        ? { ...p, milestones: [...p.milestones, { id: uid(), done: false, ...m }] }
        : p),
    }))
  }, [])

  const updateMilestone = useCallback((projectId, milestoneId, patch) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId
        ? { ...p, milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, ...patch } : m) }
        : p),
    }))
  }, [])

  const deleteMilestone = useCallback((projectId, milestoneId) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId
        ? { ...p, milestones: p.milestones.filter(m => m.id !== milestoneId) }
        : p),
      // remove scheduled blocks pointing at that milestone
      calendar: Object.fromEntries(Object.entries(prev.calendar).map(([date, day]) => [
        date, { ...day, blocks: (day.blocks || []).filter(b => b.milestoneId !== milestoneId) },
      ])),
    }))
  }, [])

  // ---- Calendar days -------------------------------------------------------
  const upsertDay = useCallback((date, patch) => {
    setState(prev => {
      const existing = prev.calendar[date] || { note: '', ranges: [], blocks: [] }
      return { ...prev, calendar: { ...prev.calendar, [date]: { ...existing, ...patch } } }
    })
  }, [])

  const deleteDay = useCallback((date) => {
    setState(prev => {
      const calendar = { ...prev.calendar }
      delete calendar[date]
      return { ...prev, calendar }
    })
  }, [])

  // ---- Scheduled blocks ----------------------------------------------------
  const addBlock = useCallback((date, block) => {
    setState(prev => {
      const day = prev.calendar[date] || { note: '', ranges: [], blocks: [] }
      return {
        ...prev,
        calendar: {
          ...prev.calendar,
          [date]: { ...day, blocks: [...(day.blocks || []), { id: uid(), ...block }] },
        },
      }
    })
  }, [])

  const deleteBlock = useCallback((date, blockId) => {
    setState(prev => {
      const day = prev.calendar[date]
      if (!day) return prev
      return {
        ...prev,
        calendar: { ...prev.calendar, [date]: { ...day, blocks: (day.blocks || []).filter(b => b.id !== blockId) } },
      }
    })
  }, [])

  const toggleBlockDone = useCallback((date, blockId) => {
    setState(prev => {
      const day = prev.calendar[date]
      if (!day) return prev
      return {
        ...prev,
        calendar: { ...prev.calendar, [date]: { ...day, blocks: (day.blocks || []).map(b => b.id === blockId ? { ...b, done: !b.done } : b) } },
      }
    })
  }, [])

  // ---- Bulk ----------------------------------------------------------------
  const reset = useCallback(() => {
    setState(emptyState())
  }, [])

  const loadDemo = useCallback(() => {
    setState((prev) => {
      const s = emptyState(prev.config)
      s.projects = [{
        id: uid(), name: 'Example: Build a study habit app', icon: '📚', color: 'lav', energy: 'deep',
        goal: 'Ship a working MVP to share with friends', startDate: '', endDate: '',
        milestones: [
          { id: uid(), name: 'Wire up data layer', hours: 3, done: false },
          { id: uid(), name: 'Build dashboard UI', hours: 4, done: false },
          { id: uid(), name: 'Add export/import', hours: 2, done: false },
        ],
      }]
      return s
    })
  }, [])

  const importState = useCallback((data) => {
    setState(normalize(data))
  }, [])

  const exportState = useCallback(() => {
    return JSON.stringify(state, null, 2)
  }, [state])

  // ---- Derived metrics -----------------------------------------------------
  const derived = useMemo(() => {
    let xp = 0
    let milestonesDone = 0
    const perProject = {}
    const milestoneMap = {}

    for (const p of state.projects) {
      perProject[p.id] = { done: 0, total: p.milestones.length }
      p.milestones.forEach((m, idx) => {
        milestoneMap[m.id] = { ...m, projectId: p.id, projectName: p.name, projectColor: p.color }
        if (m.done) {
          milestonesDone++
          xp += milestoneXp(state.config, idx)
          perProject[p.id].done++
        }
      })
    }

    const blockCounts = {}
    const dayWins = {}
    for (const [date, day] of Object.entries(state.calendar)) {
      const total = (day.blocks || []).length
      const done = (day.blocks || []).filter(b => b.done).length
      blockCounts[date] = { total, done }
      dayWins[date] = done > 0 && done >= (state.config.dailyWinThreshold || 3)
      for (const b of day.blocks || []) {
        if (b.done && b.flavor && b.flavor !== 'REST' && b.flavor !== 'WORK') {
          xp += 4 // small xp for completing a scheduled block
        }
      }
    }

    const level = levelForXp(state.config, xp)
    return {
      xp, level, milestonesDone,
      perProject, milestoneMap,
      blockCounts, dayWins,
      gamesWon: Object.values(dayWins).filter(Boolean).length,
      projectsCount: state.projects.length,
    }
  }, [state])

  const value = {
    state, derived,
    addProject, updateProject, deleteProject,
    addMilestone, updateMilestone, deleteMilestone,
    upsertDay, deleteDay, addBlock, deleteBlock, toggleBlockDone,
    reset, loadDemo, importState, exportState,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
