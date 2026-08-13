import { useRef, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import Modal from './Modal'

export function ImportExport() {
  const { exportState, importState, reset, loadDemo } = useAppData()
  const [confirmReset, setConfirmReset] = useState(false)
  const [msg, setMsg] = useState(null)
  const fileRef = useRef(null)

  function download() {
    const blob = new Blob([exportState()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projectify-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Backup downloaded')
    setTimeout(() => setMsg(null), 2500)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importState(JSON.parse(reader.result))
        setMsg('Imported successfully')
      } catch {
        setMsg('Invalid file — not imported')
      }
      setTimeout(() => setMsg(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleReset() {
    setConfirmReset(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={download} className="text-xs px-3 py-1.5 rounded-lg bg-lav-600 text-white hover:bg-lav-700 cursor-pointer">⬇ Export backup</button>
        <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">⬆ Import JSON</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        <button onClick={loadDemo} className="text-xs px-3 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">✦ Load example</button>
        <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">
          🗑 Wipe all
        </button>
      </div>
      {msg && <p className="text-xs text-sage-700">{msg}</p>}
      <p className="text-[11px] text-lav-700/50">Data lives in your browser. Export a JSON backup to move it between devices or share with friends.</p>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Wipe all data?">
        <div className="space-y-4">
          <p className="text-sm text-lav-900">This permanently deletes every project, checkpoint, and planned day stored in this browser. It cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmReset(false)} className="text-sm px-4 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer">Cancel</button>
            <button type="button" onClick={() => { setConfirmReset(false); reset() }} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">Yes, wipe everything</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
