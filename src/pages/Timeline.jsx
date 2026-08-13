import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import Modal, { inputCls, labelCls } from '../components/Modal'
import { projectColor } from '../utils/helpers'
import { fmtShort } from '../data/defaults'
import { useState } from 'react'

function toDays(dateStr) {
  return new Date(dateStr + 'T12:00:00').getTime() / 86400000
}

export default function Timeline() {
  const { state, updateProject } = useAppData()
  const [editId, setEditId] = useState(null)

  const { rows, labels, hasTimeline } = useMemo(() => {
    const withDates = state.projects.filter(p => p.startDate && p.endDate)
    if (withDates.length === 0) return { start: 0, end: 0, rows: [], hasTimeline: false }
    let min = Infinity, max = -Infinity
    for (const p of withDates) {
      const s = toDays(p.startDate), e = toDays(p.endDate)
      min = Math.min(min, s); max = Math.max(max, e)
    }
    // pad 1 day each side
    const s0 = min - 1, e0 = max + 1
    const span = e0 - s0
    const rows = withDates.map(p => {
      const left = ((toDays(p.startDate) - s0) / span) * 100
      const width = ((toDays(p.endDate) - toDays(p.startDate)) / span) * 100
      const c = projectColor(p.color)
      return { p, left: Math.max(0, left), width: Math.max(2, width), c }
    })
    const labels = []
    for (let i = 0; i <= 10; i++) {
      const d = new Date((s0 + (span * i) / 10) * 86400000)
      labels.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))
    }
    return { rows, labels, hasTimeline: true }
  }, [state.projects])

  return (
    <div className="space-y-4">
      <p className="text-sm text-lav-700/60">Give projects start &amp; target dates to see them on a shared timeline.</p>

      {!hasTimeline && (
        <div className="bg-white rounded-xl border border-blush-100 p-10 text-center">
          <p className="text-4xl">🛤️</p>
          <h2 className="text-lg font-semibold text-lav-900 mt-2">Nothing on the timeline yet</h2>
          <p className="text-sm text-lav-700/50 mt-1">Edit any project and set its Start + Target dates.</p>
        </div>
      )}

      {hasTimeline && (
        <div className="bg-white rounded-xl border border-blush-100 p-5 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex mb-1">
              <div className="w-52 shrink-0" />
              <div className="flex-1 relative h-5">
                {labels.map((l, i) => (
                  <span key={i} className="absolute text-[10px] text-lav-700/50" style={{ left: `${(i / 10) * 100}%`, transform: 'translateX(-50%)' }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
            {rows.map(({ p, left, width, c }) => (
              <div key={p.id} className="flex items-center mb-2">
                <div className="w-52 shrink-0 pr-3">
                  <button onClick={() => setEditId(p.id)} className="text-xs text-lav-900 hover:underline truncate block w-full text-left cursor-pointer">
                    {p.icon} {p.name}
                  </button>
                  <p className="text-[10px] text-lav-700/40">{fmtShort(p.startDate)} → {fmtShort(p.endDate)}</p>
                </div>
                <div className="flex-1 relative h-6 bg-lav-50 rounded">
                  <div className="absolute top-0 bottom-0 rounded" style={{ backgroundColor: c.hex, left: `${left}%`, width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-lav-700/40 mt-3">Click a project name to edit its dates.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-blush-100 p-5">
        <h3 className="font-semibold text-lav-900 mb-3">Set / update dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {state.projects.map(p => (
            <button key={p.id} onClick={() => setEditId(p.id)}
              className={`text-left text-xs px-3 py-2 rounded-lg border cursor-pointer hover:bg-lav-50 ${p.startDate ? 'border-blush-100' : 'border-dashed border-lav-200 text-lav-700/50'}`}>
              {p.icon} {p.name} {p.startDate ? `· ${fmtShort(p.startDate)} → ${fmtShort(p.endDate)}` : '— no dates yet'}
            </button>
          ))}
        </div>
      </div>

      <DateModal project={state.projects.find(p => p.id === editId)} onClose={() => setEditId(null)} onSave={(id, patch) => { updateProject(id, patch); setEditId(null) }} />
    </div>
  )
}

function DateModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project ? { startDate: project.startDate || '', endDate: project.endDate || '' } : { startDate: '', endDate: '' })
  if (!project) return null
  function submit(e) {
    e.preventDefault()
    onSave(project.id, { startDate: form.startDate, endDate: form.endDate })
  }
  return (
    <Modal open={!!project} onClose={onClose} title={`Dates — ${project.icon} ${project.name}`}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Target date</label>
            <input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">Save</button>
        </div>
      </form>
    </Modal>
  )
}
