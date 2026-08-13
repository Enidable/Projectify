import { useState } from 'react'
import { ImportExport } from './ImportExport'
import { THEMES, themeInfo } from '../data/defaults'
import { useAppData } from '../context/AppDataContext'

export default function Header({ title, subtitle, right }) {
  const { state, setTheme } = useAppData()
  const [open, setOpen] = useState(false)
  const current = themeInfo(state.config.theme).id
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
              <h3 className="text-sm font-semibold text-lav-900 mb-2">Theme</h3>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {THEMES.map(t => {
                  const active = current === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg border text-left cursor-pointer transition-colors ${active ? 'border-blush-400 bg-blush-50' : 'border-blush-100 hover:bg-lav-50'}`}
                    >
                      <span className="flex -space-x-1 shrink-0">
                        <span className="w-5 h-5 rounded-full" style={{ backgroundColor: t.sample[0] }} />
                        <span className="w-5 h-5 rounded-full opacity-80" style={{ backgroundColor: t.sample[1] }} />
                      </span>
                      <span>
                        <span className="block text-xs font-medium text-lav-900">{t.label}</span>
                        <span className="block text-[10px] text-lav-700/50">{t.blurb}</span>
                      </span>
                      {active && <span className="ml-auto text-[11px] text-blush-600">✓</span>}
                    </button>
                  )
                })}
              </div>

              <h3 className="text-sm font-semibold text-lav-900 mb-3">Data &amp; Backup</h3>
              <ImportExport />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
