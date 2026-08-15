import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import Modal, { inputCls, labelCls } from '../components/Modal'
import { FLAVORS, flavorInfo, todayStr, DEFAULT_RANGES, fmtShort } from '../data/defaults'
import { projectColor } from '../utils/helpers'

const FLAVOR_KEYS = Object.keys(FLAVORS)

export default function Calendar() {
  const { state, upsertDay, addBlock, updateBlock } = useAppData()
  const [showAdd, setShowAdd] = useState(false)
  const [addOnDate, setAddOnDate] = useState(null)
  const [settingsOnDate, setSettingsOnDate] = useState(null)
  const [editBlock, setEditBlock] = useState(null)
  const [drag, setDrag] = useState(null)

  const dates = useMemo(() => Object.keys(state.calendar).sort(), [state.calendar])
  const isToday = todayStr()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-lav-700/60">{dates.length} planned day{dates.length === 1 ? '' : 's'}</p>
        <button onClick={() => setShowAdd(true)} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">+ Add a day</button>
      </div>

      {dates.length === 0 && (
        <div className="bg-white rounded-xl border border-blush-100 p-10 text-center">
          <p className="text-4xl">🗓️</p>
          <h2 className="text-lg font-semibold text-lav-900 mt-2">No days planned</h2>
          <p className="text-sm text-lav-700/50 mt-1 mb-4">Add a day, set your free time ranges, then drop projects onto it.</p>
          <button onClick={() => setShowAdd(true)} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">+ Add a day</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dates.map(date => (
          <DayCard
            key={date}
            date={date}
            isToday={date === isToday}
            onAdd={() => setAddOnDate(date)}
            onSettings={() => setSettingsOnDate(date)}
            onEditBlock={(block) => setEditBlock({ date, block })}
            drag={drag}
            setDrag={setDrag}
          />
        ))}
      </div>

      {drag && <p className="text-xs text-lav-700/50 italic">Drag to a spot on a day to reorder, or onto another day card to move it. Drop to place it.</p>}

      <AddDayModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={(date) => { upsertDay(date, { ranges: [...DEFAULT_RANGES], blocks: [] }); setShowAdd(false) }} />
      <AddBlockModal key={addOnDate || 'none'} date={addOnDate} onClose={() => setAddOnDate(null)} onSubmit={(date, block) => { addBlock(date, block); setAddOnDate(null) }} />
      <DaySettingsModal key={settingsOnDate || 'none'} date={settingsOnDate} onClose={() => setSettingsOnDate(null)} />
      <EditBlockModal
        key={(editBlock?.date || 'none') + (editBlock?.block?.id || '')}
        date={editBlock?.date}
        block={editBlock?.block}
        onClose={() => setEditBlock(null)}
        onSubmit={(block, patch) => { updateBlock(editBlock.date, block.id, patch); setEditBlock(null) }}
      />
    </div>
  )
}

function DayCard({ date, isToday, onAdd, onSettings, onEditBlock, drag, setDrag }) {
  const { state, deleteBlock, toggleBlockDone, deleteDay, upsertDay, moveBlock } = useAppData()
  const [editingNote, setEditingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [overRow, setOverRow] = useState(null)
  const day = state.calendar[date]
  if (!day) return null
  const d = new Date(date + 'T12:00:00')
  const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const blocks = day.blocks || []
  const done = blocks.filter(b => b.done).length
  const total = blocks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  function beginNoteEdit() {
    setNoteDraft(day.note || '')
    setEditingNote(true)
  }

  function saveNote() {
    upsertDay(date, { note: noteDraft.trim() })
    setEditingNote(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    if (!drag) return
    moveBlock(drag.fromDate, drag.blockId, date, blocks.length)
    setDrag(null)
  }

  function handleBlockDrop(e, index) {
    e.preventDefault()
    e.stopPropagation()
    if (!drag) return
    if (drag.fromDate === date && drag.blockId === blocks[index]?.id) return
    let target = index
    if (drag.fromDate === date) {
      const fromIndex = blocks.findIndex(b => b.id === drag.blockId)
      if (fromIndex < target) target -= 1
    }
    moveBlock(drag.fromDate, drag.blockId, date, target)
    setDrag(null)
    setOverRow(null)
  }

  return (
    <div
      className={`bg-white rounded-xl border p-4 ${isToday ? 'border-lav-400 ring-2 ring-lav-200' : 'border-blush-100'} ${drag ? 'ring-2 ring-blush-100' : ''}`}
      onDragOver={e => { if (drag) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' } }}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-lav-900">{label} {isToday && <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-lav-100 text-lav-700">TODAY</span>}</span>
          <div className="h-1.5 w-24 bg-lav-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-sage-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={onAdd} className="text-sm text-blush-600 hover:text-blush-800 cursor-pointer" title="Add work to this day">＋</button>
          <button onClick={onSettings} className="text-xs text-lav-700/60 hover:text-lav-900 cursor-pointer" title="Edit day note/ranges">⚙️</button>
          <button onClick={() => { if (confirm('Delete this whole day?')) deleteDay(date) }} className="text-xs text-blush-500 hover:text-blush-700 cursor-pointer" title="Delete day">🗑️</button>
        </div>
      </div>

      <div className="flex items-start gap-1 mb-2">
        {editingNote ? (
          <input
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            onBlur={saveNote}
            onKeyDown={e => { if (e.key === 'Enter') saveNote(); if (e.key === 'Escape') setEditingNote(false) }}
            autoFocus
            placeholder="Day comment…"
            className="flex-1 text-[11px] text-lav-900 bg-lav-50 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-lav-200"
          />
        ) : (
          <p onClick={beginNoteEdit} className={`flex-1 text-[11px] rounded px-2 py-1 cursor-text hover:bg-lav-50 ${day.note ? 'bg-lav-50 text-lav-700/70' : 'bg-transparent text-lav-700/30 italic'}`}>
            {day.note || 'Add a comment…'}
          </p>
        )}
      </div>
      {blocks.length > 0 && (
        <>
          {day.ranges && day.ranges.length > 0 && (
            <p className="text-[10px] text-lav-700/40 mb-2">Free: {day.ranges.map(r => `${r.start}–${r.end}`).join(' · ')}</p>
          )}
          <div className="space-y-1.5">
            {blocks.map((b, i) => {
              const f = flavorInfo(b.flavor)
              const proj = state.projects.find(p => p.id === b.projectId)
              const c = proj ? projectColor(proj.color) : null
              return (
                <div
                  key={b.id}
                  draggable
                  onDragStart={e => {
                    e.stopPropagation()
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', b.id)
                    setDrag({ blockId: b.id, fromDate: date })
                  }}
                  onDragEnd={() => { setDrag(null); setOverRow(null) }}
                  onDragEnter={e => { e.preventDefault(); e.stopPropagation(); if (drag && drag.blockId !== b.id) setOverRow(i) }}
                  onDragLeave={e => { e.preventDefault(); e.stopPropagation(); if (overRow === i) setOverRow(null) }}
                  onDragOver={e => { if (drag) { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move' } }}
                  onDrop={e => handleBlockDrop(e, i)}
                  className={`group flex items-center gap-2 text-xs border border-blush-50 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing ${drag?.blockId === b.id ? 'opacity-40' : ''} ${overRow === i ? 'border-lav-400 bg-lav-50 ring-1 ring-lav-200' : ''}`}
                  style={{ borderLeftColor: c ? c.hex : undefined, borderLeftWidth: c ? 3 : 0 }}
                >
                  <div className={`border-l-2 ${f.border} pl-1 flex items-center`}>
                    <button
                      draggable={false}
                      onClick={() => toggleBlockDone(date, b.id)}
                      className={`flex items-center justify-center w-4 h-4 rounded border-2 text-[9px] cursor-pointer ${b.done ? 'bg-sage-500 border-sage-500 text-white' : 'border-lav-300 text-transparent hover:border-lav-500'}`}>✓</button>
                  </div>
                  <span className="font-mono text-[10px] text-lav-700/40 w-9 shrink-0">{b.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate ${b.done ? 'line-through text-lav-700/40' : 'text-lav-900'}`}>{b.label || 'Untitled'}</p>
                    {proj && <p className="text-[10px] text-lav-700/50 truncate">{proj.icon} {proj.name}</p>}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] shrink-0 ${f.cls}`}>{f.label}</span>
                  <button
                    draggable={false}
                    onClick={() => onEditBlock(b)}
                    className="text-xs text-lav-700/40 opacity-0 group-hover:opacity-100 hover:text-lav-900 cursor-pointer shrink-0"
                    title="Edit item">✏️</button>
                  <span onClick={() => { if (confirm('Remove this item?')) deleteBlock(date, b.id) }} className="text-xs text-blush-400 opacity-0 group-hover:opacity-100 hover:text-blush-600 cursor-pointer shrink-0">×</span>
                </div>
              )
            })}
          </div>
        </>
      )}
      {blocks.length === 0 && (
        <p className="text-xs text-lav-700/40 italic py-2">Nothing scheduled. Click ＋ to add work, or drop an item here from another day.</p>
      )}
    </div>
  )
}

function AddDayModal({ open, onClose, onSubmit }) {
  const [date, setDate] = useState(todayStr())
  function submit(e) { e.preventDefault(); if (date) onSubmit(date) }
  return (
    <Modal open={open} onClose={onClose} title="Add a day">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" required className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <p className="text-xs text-lav-700/50">A default set of free time ranges is added; you can tweak ranges on the day's ⚙️ menu.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">Add day</button>
        </div>
      </form>
    </Modal>
  )
}

function AddBlockModal({ date, onClose, onSubmit }) {
  const { state, addMilestone } = useAppData()
  const [form, setForm] = useState({ time: '09:00', projectId: state.projects[0]?.id || '', milestoneId: '', flavor: 'DEEP', label: '' })
  const [newMs, setNewMs] = useState(false)
  const [newMsName, setNewMsName] = useState('')
  const proj = state.projects.find(p => p.id === form.projectId)

  function resetFor(projectId) {
    setForm(f => ({ ...f, projectId, milestoneId: '' }))
  }

  function createMilestone(e) {
    e.preventDefault()
    const name = newMsName.trim()
    if (!name || !proj) return
    const id = addMilestone(proj.id, { name })
    setForm(f => ({ ...f, milestoneId: id }))
    setNewMs(false)
    setNewMsName('')
  }

  function submit(e) {
    e.preventDefault()
    if (!date || (!form.projectId && !form.label.trim())) return
    const chosen = proj?.milestones.find(m => m.id === form.milestoneId)
    onSubmit(date, {
      time: form.time,
      projectId: form.projectId || null,
      milestoneId: form.milestoneId || null,
      flavor: form.flavor,
      label: form.label.trim() || chosen?.name || proj?.name || 'Untitled',
    })
  }

  return (
    <Modal open={!!date} onClose={onClose} title={date ? `Add to ${fmtShort(date)}` : ''}>
      <form onSubmit={submit} className="space-y-3">
        {state.projects.length === 0 ? (
          <p className="text-sm text-lav-700/50">Create a project first (Projects page), then come back to schedule it.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Time</label>
                <input type="time" className={inputCls} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select className={inputCls} value={form.flavor} onChange={e => setForm(f => ({ ...f, flavor: e.target.value }))}>
                  {FLAVOR_KEYS.map(k => <option key={k} value={k}>{FLAVORS[k].label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Project</label>
              <select className={inputCls} value={form.projectId} onChange={e => resetFor(e.target.value)}>
                <option value="">— None —</option>
                {state.projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
              </select>
            </div>
            {proj && (
              <div>
                <label className={labelCls}>Checkpoint</label>
                <select className={inputCls} value={form.milestoneId} onChange={e => setForm(f => ({ ...f, milestoneId: e.target.value }))}>
                  <option value="">— General (whole project) —</option>
                  {proj.milestones.map(m => <option key={m.id} value={m.id}>{m.done ? '✓ ' : ''}{m.name}</option>)}
                </select>
                {newMs ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <input autoFocus className={inputCls} value={newMsName} onChange={e => setNewMsName(e.target.value)} placeholder="Checkpoint name" onKeyDown={e => { if (e.key === 'Enter') createMilestone(e) }} />
                    <button type="button" onClick={createMilestone} className="text-xs px-2.5 py-1.5 rounded-lg bg-lav-600 text-white hover:bg-lav-700 cursor-pointer shrink-0">Add</button>
                    <button type="button" onClick={() => { setNewMs(false); setNewMsName('') }} className="text-xs px-2 py-1.5 rounded-lg text-lav-700/60 hover:text-lav-900 cursor-pointer shrink-0">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setNewMs(true)} className="mt-1.5 text-xs text-lav-700/60 hover:text-lav-900 cursor-pointer">＋ New checkpoint (also shows in Projects)</button>
                )}
              </div>
            )}
            <div>
              <label className={labelCls}>Label (optional)</label>
              <input className={inputCls} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Defaults to checkpoint/project name" />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" disabled={state.projects.length === 0} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer disabled:opacity-40">Add</button>
        </div>
      </form>
    </Modal>
  )
}

function EditBlockModal({ date, block, onClose, onSubmit }) {
  const { state, addMilestone } = useAppData()
  const [form, setForm] = useState(() => ({
    time: block?.time || '09:00',
    projectId: block?.projectId || '',
    milestoneId: block?.milestoneId || '',
    flavor: block?.flavor || 'DEEP',
    label: block?.label || '',
  }))
  const [newMs, setNewMs] = useState(false)
  const [newMsName, setNewMsName] = useState('')
  const proj = state.projects.find(p => p.id === form.projectId)

  function resetFor(projectId) {
    setForm(f => ({ ...f, projectId, milestoneId: '' }))
  }

  function createMilestone(e) {
    e.preventDefault()
    const name = newMsName.trim()
    if (!name || !proj) return
    const id = addMilestone(proj.id, { name })
    setForm(f => ({ ...f, milestoneId: id }))
    setNewMs(false)
    setNewMsName('')
  }

  function submit(e) {
    e.preventDefault()
    if (!block) return
    const chosen = proj?.milestones.find(m => m.id === form.milestoneId)
    onSubmit(block, {
      time: form.time,
      projectId: form.projectId || null,
      milestoneId: form.milestoneId || null,
      flavor: form.flavor,
      label: form.label.trim() || chosen?.name || proj?.name || 'Untitled',
    })
  }

  return (
    <Modal open={!!date && !!block} onClose={onClose} title={date ? `Edit item — ${fmtShort(date)}` : ''}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Time</label>
            <input type="time" className={inputCls} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select className={inputCls} value={form.flavor} onChange={e => setForm(f => ({ ...f, flavor: e.target.value }))}>
              {FLAVOR_KEYS.map(k => <option key={k} value={k}>{FLAVORS[k].label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Project</label>
          <select className={inputCls} value={form.projectId} onChange={e => resetFor(e.target.value)}>
            <option value="">— None —</option>
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
          </select>
        </div>
        {proj && (
          <div>
            <label className={labelCls}>Checkpoint</label>
            <select className={inputCls} value={form.milestoneId} onChange={e => setForm(f => ({ ...f, milestoneId: e.target.value }))}>
              <option value="">— General (whole project) —</option>
              {proj.milestones.map(m => <option key={m.id} value={m.id}>{m.done ? '✓ ' : ''}{m.name}</option>)}
            </select>
            {newMs ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <input autoFocus className={inputCls} value={newMsName} onChange={e => setNewMsName(e.target.value)} placeholder="Checkpoint name" onKeyDown={e => { if (e.key === 'Enter') createMilestone(e) }} />
                <button type="button" onClick={createMilestone} className="text-xs px-2.5 py-1.5 rounded-lg bg-lav-600 text-white hover:bg-lav-700 cursor-pointer shrink-0">Add</button>
                <button type="button" onClick={() => { setNewMs(false); setNewMsName('') }} className="text-xs px-2 py-1.5 rounded-lg text-lav-700/60 hover:text-lav-900 cursor-pointer shrink-0">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => setNewMs(true)} className="mt-1.5 text-xs text-lav-700/60 hover:text-lav-900 cursor-pointer">＋ New checkpoint (also shows in Projects)</button>
            )}
          </div>
        )}
        <div>
          <label className={labelCls}>Label</label>
          <input className={inputCls} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Defaults to checkpoint/project name" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">Save</button>
        </div>
      </form>
    </Modal>
  )
}

function DaySettingsModal({ date, onClose }) {
  const { state, upsertDay } = useAppData()
  const day = date ? state.calendar[date] : null
  const [note, setNote] = useState(day?.note || '')
  const [ranges, setRanges] = useState((day?.ranges && day.ranges.map(r => ({ ...r }))) || [...DEFAULT_RANGES])

  function updateRange(i, field, val) {
    setRanges(rs => rs.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  function submit(e) {
    e.preventDefault()
    upsertDay(date, { note, ranges })
    onClose()
  }

  return (
    <Modal open={!!date} onClose={onClose} title={`Day settings — ${date ? fmtShort(date) : ''}`}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelCls}>Note</label>
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Off work, head is clear in the AM" />
        </div>
        <div>
          <label className={labelCls}>Free time ranges</label>
          <div className="space-y-2">
            {ranges.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="time" className={`${inputCls} flex-1`} value={r.start} onChange={e => updateRange(i, 'start', e.target.value)} />
                <span className="text-lav-700/40">–</span>
                <input type="time" className={`${inputCls} flex-1`} value={r.end} onChange={e => updateRange(i, 'end', e.target.value)} />
                <button type="button" onClick={() => setRanges(rs => rs.filter((_, idx) => idx !== i))} disabled={ranges.length <= 1} className="text-sm text-blush-500 hover:text-blush-700 cursor-pointer disabled:opacity-30">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setRanges(rs => [...rs, { start: '18:00', end: '22:00' }])} className="mt-2 text-xs text-lav-700/60 hover:text-lav-900 cursor-pointer">+ Add range</button>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
          <button type="submit" className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">Save</button>
        </div>
      </form>
    </Modal>
  )
}