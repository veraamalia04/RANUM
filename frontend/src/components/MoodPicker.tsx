import { MOODS } from '../lib/moods'
import { cn } from '../lib/utils'

export default function MoodPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Pilih mood">
      {MOODS.map((m) => (
        <button key={m.id} type="button" role="radio" aria-checked={value === m.id} onClick={() => onChange(m.id)}
          className={cn('flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors hover:bg-muted',
            value === m.id && 'border-primary bg-primary/5 ring-2 ring-primary/30')}>
          <m.icon size={24} style={{ color: m.color }} aria-hidden />
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  )
}
