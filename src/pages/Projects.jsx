import { useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import Modal, { inputCls, labelCls } from '../components/Modal'
import { ENERGIES, COLORS, ICONS, energyInfo } from '../data/defaults'
import { projectColor } from '../utils/helpers'

export default function Projects() {
  const { state, derived, addProject, updateProject, deleteProject, addMilestone, updateMilestone, deleteMilestone } = useAppData()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editMs, setEditMs] = useState(null) // { projectId, milestone }

  const empty = state.projects.length === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-lav-700/60">{state.projects.length} project{state.projects.length === 1 ? '' : 's'} · {derived.milestonesDone} milestones done</p>
        <button onClick={() => setShowAdd(true)} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">+ New Project</button>
      </div>

      {empty && (
        <div className="bg-white rounded-xl border border-blush-100 p-10 text-center">
          <p className="text-4xl">🧩</p>
          <h2 className="text-lg font-semibold text-lav-900 mt-2">No projects yet</h2>
          <p className="text-sm text-lav-700/50 mt-1 mb-4">Create a project, then add checkpoints (milestones) to it.</p>
          <button onClick={() => setShowAdd(true)} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">+ New Project</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.projects.map(p => {
          const c = projectColor(p.color)
          const e = energyInfo(p.energy)
          const prog = derived.perProject[p.id] || { done: 0, total: 0 }
          const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0
          return (
            <div key={p.id} className="bg-white rounded-xl border border-blush-100 p-4 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h2 className="font-semibold text-lav-900 leading-tight">{p.name}</h2>
                    <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${e.cls}`}>{e.label}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditId(p.id)} className="text-xs text-lav-700/60 hover:text-lav-900 cursor-pointer" title="Edit project">✏️</button>
                  <button onClick={() => { if (confirm('Delete this project and all its checkpoints?')) deleteProject(p.id) }} className="text-xs text-blush-500 hover:text-blush-700 cursor-pointer" title="Delete">🗑️</button>
                </div>
              </div>
              {p.goal && <p className="text-xs text-lav-700/50 mt-1 mb-2">🎯 {p.goal}</p>}

              <div className="h-2 bg-lav-100 rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full transition-all ${c.dot}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="space-y-1.5 flex-1">
                {p.milestones.length === 0 && <p className="text-xs text-lav-700/40 italic">No checkpoints yet — add one below.</p>}
                {p.milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => updateMilestone(p.id, m.id, { done: !m.done })}
                      className={`flex items-center justify-center w-5 h-5 rounded border-2 text-[10px] shrink-0 cursor-pointer ${m.done ? 'bg-sage-500 border-sage-500 text-white' : 'border-lav-300 text-transparent hover:border-lav-500'}`}
                    >✓</button>
                    <span onClick={() => setEditMs({ projectId: p.id, milestone: m })} className={`flex-1 text-xs cursor-pointer hover:underline ${m.done ? 'line-through text-lav-700/40' : 'text-lav-900'}`}>{m.name}</span>
                    <span className="text-[10px] text-lav-700/40 shrink-0">{m.hours ? `${m.hours}h` : ''}</span>
                    <span onClick={() => { if (confirm('Delete this checkpoint?')) deleteMilestone(p.id, m.id) }} className="text-[11px] text-blush-400 opacity-0 group-hover:opacity-100 hover:text-blush-600 cursor-pointer">×</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-blush-50">
                <button onClick={() => setEditMs({ projectId: p.id, milestone: null })} className="text-xs text-lav-700/60 hover:text-lav-900 cursor-pointer">+ Add checkpoint</button>
              </div>
            </div>
          )
        })}
      </div>

      <ProjectModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={(data) => { addProject(data); setShowAdd(false) }} title="New Project" />
      <ProjectModal open={!!editId} onClose={() => setEditId(null)} initial={state.projects.find(x => x.id === editId)} onSubmit={(data) => { updateProject(editId, data); setEditId(null) }} title="Edit Project" />
      <MilestoneModal open={!!editMs} onClose={() => setEditMs(null)} initial={editMs?.milestone} onSubmit={(data) => {
        const pid = editMs.projectId
        if (editMs.milestone) updateMilestone(pid, editMs.milestone.id, data)
        else addMilestone(pid, data)
        setEditMs(null)
      }} title={editMs?.milestone ? 'Edit Checkpoint' : 'New Checkpoint'} />
    </div>
  )
}

function ProjectModal({ open, onClose, initial, onSubmit, title }) {
  const [form, setForm] = useState(initial ? { name: initial.name, icon: initial.icon, color: initial.color, energy: initial.energy, goal: initial.goal || '', startDate: initial.startDate || '', endDate: initial.endDate || '' } : { name: '', icon: '🌟', color: 'lav', energy: 'deep', goal: '', startDate: '', endDate: '' })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ name: form.name.trim(), icon: form.icon, color: form.color, energy: form.energy, goal: form.goal.trim(), startDate: form.startDate, endDate: form.endDate })
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelCls}>Project name *</label>
          <input required className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Trading bot" autoFocus />
        </div>
        <div>
          <label className={labelCls}>Goal (optional)</label>
          <input className={inputCls} value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="What does done look like?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Energy type</label>
            <select className={inputCls} value={form.energy} onChange={e => setForm(f => ({ ...f, energy: e.target.value }))}>
              {ENERGIES.map(en => <option key={en.id} value={en.id}>{en.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Color</label>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {COLORS.map(col => (
                <button key={col} type="button" onClick={() => setForm(f => ({ ...f, color: col }))}
                  className={`w-6 h-6 rounded-full cursor-pointer ${projectColor(col).solid} ${form.color === col ? 'ring-2 ring-offset-1 ring-lav-700' : ''}`} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className={labelCls}>Icon</label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map(icon => (
              <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg cursor-pointer ${form.icon === icon ? 'bg-lav-100 ring-2 ring-lav-400' : 'hover:bg-lav-50'}`}>{icon}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Target / end date</label>
            <input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">{initial ? 'Save' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}

function MilestoneModal({ open, onClose, initial, onSubmit, title }) {
  const [form, setForm] = useState(initial ? { name: initial.name, hours: initial.hours || '' } : { name: '', hours: '' })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ name: form.name.trim(), hours: form.hours ? parseFloat(form.hours) : null })
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelCls}>Checkpoint name *</label>
          <input required className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Write training strategy doc" autoFocus />
        </div>
        <div>
          <label className={labelCls}>Estimated hours (optional)</label>
          <input type="number" min="0" step="0.5" className={inputCls} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="2.5" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">{initial ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </Modal>
  )
}
