import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

type Option<T extends string> = { value: T; label: string; icon?: LucideIcon }

// A row of toggle buttons where exactly one is selected (on phones the icon sits above the label so 4 options fit)
export default function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex w-full rounded-lg bg-muted p-1" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn('flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-center text-xs leading-tight font-medium text-muted-foreground transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm',
            value === o.value && 'bg-background text-foreground shadow-sm')}>
          {o.icon && <o.icon size={16} aria-hidden />} {o.label}
        </button>
      ))}
    </div>
  )
}
