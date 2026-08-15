import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { emptyState, uid, DEFAULT_CONFIG, demoState, todayStr } from '../data/defaults'
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
  const config = { ...DEFAULT_CONFIG, ...(s.config ? s.config : {}) }
  if (config.theme === 'lilac') config.theme = 'cute vibe' // renamed theme id
  return {
    version: s.version || 1,
    config,
    projects: Array.isArray(s.projects) ? s.projects : [],
    calendar: s.calendar && typeof s.calendar === 'object' ? s.calendar : {},
  }
}

export function AppDataProvider({ children }) {
  const [state, setState] = useState(() => normalize(loadJSON()))

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.config.theme || 'cute vibe'
  }, [state.config.theme])

  // ---- Config --------------------------------------------------------------
  const setTheme = useCallback((theme) => {
    setState(prev => ({ ...prev, config: { ...prev.config, theme } }))
  }, [])

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
    const id = uid()
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId
        ? { ...p, milestones: [...p.milestones, { id, done: false, ...m }] }
        : p),
    }))
    return id
  }, [])

  const updateMilestone = useCallback((projectId, milestoneId, patch) => {
    setState(prev => {
      const done = patch && 'done' in patch
      const msPatch = done
        ? { ...patch, completedAt: patch.done ? todayStr() : null }
        : patch
      const calendar = done ? Object.fromEntries(Object.entries(prev.calendar).map(([date, day]) => [
        date, { ...day, blocks: (day.blocks || []).map(b => b.milestoneId === milestoneId
          ? { ...b, done: !!patch.done, completedAt: patch.done ? todayStr() : null }
          : b) },
      ])) : prev.calendar
      return {
        ...prev,
        calendar,
        projects: prev.projects.map(p => p.id === projectId
          ? { ...p, milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, ...msPatch } : m) }
          : p),
      }
    })
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
      const done = !!block.done
      return {
        ...prev,
        calendar: {
          ...prev.calendar,
          [date]: { ...day, blocks: [...(day.blocks || []), { id: uid(), ...block, completedAt: done ? todayStr() : null }] },
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
      const block = (day.blocks || []).find(b => b.id === blockId)
      if (!block) return prev
      const done = !block.done
      const now = todayStr()
      const calendar = { ...prev.calendar, [date]: { ...day, blocks: (day.blocks || []).map(b => b.id === blockId ? { ...b, done, completedAt: done ? now : null } : b) } }
      const projects = block.milestoneId
        ? prev.projects.map(p => ({
            ...p,
            milestones: p.milestones.map(m => m.id === block.milestoneId ? { ...m, done, completedAt: done ? now : null } : m),
          }))
        : prev.projects
      return { ...prev, calendar, projects }
    })
  }, [])

  const updateBlock = useCallback((date, blockId, patch) => {
    setState(prev => {
      const day = prev.calendar[date]
      if (!day) return prev
      return {
        ...prev,
        calendar: { ...prev.calendar, [date]: { ...day, blocks: (day.blocks || []).map(b => b.id === blockId ? { ...b, ...patch } : b) } },
      }
    })
  }, [])

  const moveBlock = useCallback((sourceDate, blockId, targetDate, targetIndex) => {
    setState(prev => {
      const srcDay = prev.calendar[sourceDate]
      if (!srcDay) return prev
      const block = (srcDay.blocks || []).find(b => b.id === blockId)
      if (!block) return prev
      const srcBlocks = (srcDay.blocks || []).filter(b => b.id !== blockId)
      const tgtDay = prev.calendar[targetDate] || { note: '', ranges: [], blocks: [] }

      if (sourceDate === targetDate) {
        let idx = Math.max(0, Math.min(targetIndex, srcBlocks.length))
        srcBlocks.splice(idx, 0, block)
        return { ...prev, calendar: { ...prev.calendar, [targetDate]: { ...srcDay, blocks: srcBlocks } } }
      }

      const tgtBlocks = [...(tgtDay.blocks || [])]
      tgtBlocks.splice(Math.max(0, Math.min(targetIndex, tgtBlocks.length)), 0, block)
      const calendar = { ...prev.calendar, [sourceDate]: { ...srcDay, blocks: srcBlocks } }
      calendar[targetDate] = { ...tgtDay, blocks: tgtBlocks }
      return { ...prev, calendar }
    })
  }, [])

  // ---- Bulk ----------------------------------------------------------------
  const reset = useCallback(() => {
    setState(emptyState())
  }, [])

  const loadDemo = useCallback(() => {
    setState(prev => {
      const s = demoState()
      s.config = { ...prev.config, ...s.config }
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
    state, derived, setTheme,
    addProject, updateProject, deleteProject,
    addMilestone, updateMilestone, deleteMilestone,
    upsertDay, deleteDay, addBlock, deleteBlock, toggleBlockDone, updateBlock, moveBlock,
    reset, loadDemo, importState, exportState,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
