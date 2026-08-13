import { useState } from 'react'
import { ImportExport } from './ImportExport'

export default function Header({ title, subtitle, right }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="h-14 bg-white border-b border-blush-100 flex items-center justify-between px-6 relative">
      <div>
        <h1 className="text-lg font-semibold text-lav-900">{title}</h1>
        {subtitle && <p className="text-xs text-lav-700/50 -mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="text-xs px-3 py-1.5 rounded-lg border border-blush-200 text-blush-700 hover:bg-blush-50 cursor-pointer"
          >
            ☰ Menu
          </button>
          {open && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-blush-100 p-4 z-50">
              <h3 className="text-sm font-semibold text-lav-900 mb-3">Data &amp; Backup</h3>
              <ImportExport />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
