import Modal from './Modal'

const STEPS = [
  { icon: '🎯', title: '1 · Create projects', text: 'Head to Projects. Add a project, a goal, and small checkpoints (milestones). Pick a color, icon and energy type.' },
  { icon: '🗓️', title: '2 · Plan your days', text: 'In Planner, add a day, set your free-time ranges, then drop blocks onto it — linked to a project or checkpoint.' },
  { icon: '✅', title: '3 · Tick things off', text: 'Check off blocks and milestones as you finish them. Every completed item earns XP.' },
  { icon: '🏆', title: '4 · Level up', text: 'Watch your level rise on Progress. Each level has a title, and you unlock badges and streaks along the way.' },
  { icon: '💾', title: 'Backup & themes', text: 'Use ☰ Menu to switch themes or export a JSON backup. Data lives only in your browser.' },
]

export default function HelpModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="How Projectify works">
      <div className="space-y-3">
        {STEPS.map(s => (
          <div key={s.title} className="flex gap-3 rounded-xl border border-blush-100 bg-lav-50/60 p-3">
            <span className="text-2xl shrink-0">{s.icon}</span>
            <div>
              <p className="text-sm font-medium text-lav-900">{s.title}</p>
              <p className="text-xs text-lav-700/70 mt-0.5">{s.text}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="text-sm px-4 py-1.5 rounded-lg bg-blush-600 text-white hover:bg-blush-700 cursor-pointer">Got it</button>
        </div>
      </div>
    </Modal>
  )
}
