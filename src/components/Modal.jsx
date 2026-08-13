export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-xl shadow-lg w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-blush-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-lav-900">{title}</h2>
          <button onClick={onClose} className="text-blush-600 hover:text-blush-800 text-xl leading-none cursor-pointer">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export const inputCls = 'w-full text-sm border border-blush-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lav-200 bg-white text-lav-900'
export const labelCls = 'text-xs text-lav-700/70 block mb-1'
