import { Check } from 'lucide-react'
import { ALL_CATEGORIES, CATEGORIES, type Category } from '../lib/categories'
import { cn } from '../lib/utils'

// Toggle chips for the talent categories; any number can be on. Used both to tag karya/challenges and to filter.
// `big` is the round icon style of "Temukan Bakatmu"; `allLabel` adds a reset chip that clears the selection.
export default function CategoryChips({ label, value, onChange, big = false, allLabel }: {
  label: string
  value: Category[]
  onChange: (value: Category[]) => void
  big?: boolean
  allLabel?: string
}) {
  const toggle = (c: Category) => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c])
  const focus = 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

  if (big) return (
    <ul aria-label={label} className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
      {ALL_CATEGORIES.map((c) => {
        const meta = CATEGORIES[c]
        const on = value.includes(c)
        return (
          <li key={c}>
            <button type="button" aria-pressed={on} onClick={() => toggle(c)}
              className={cn('group grid w-20 justify-items-center gap-1.5 rounded-2xl p-1 text-xs font-semibold', focus)}>
              <span className={cn('relative grid size-14 place-items-center rounded-full border-2 shadow-sm transition motion-safe:group-hover:scale-110',
                meta.bg, on ? 'border-primary' : 'border-transparent')}>
                <meta.icon size={26} className={meta.color} aria-hidden />
                {on && <Check size={14} strokeWidth={3} aria-hidden className="absolute -top-1 -right-1 rounded-full bg-primary p-0.5 text-primary-foreground" />}
              </span>
              <span className="text-center leading-tight">{meta.short}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {allLabel && (
        <button type="button" aria-pressed={value.length === 0} onClick={() => onChange([])}
          className={cn('rounded-full border-2 px-3 py-1 text-sm font-semibold transition', focus,
            value.length === 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40')}>
          {allLabel}
        </button>
      )}
      {ALL_CATEGORIES.map((c) => {
        const meta = CATEGORIES[c]
        const on = value.includes(c)
        return (
          <button key={c} type="button" aria-pressed={on} onClick={() => toggle(c)}
            className={cn('inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-semibold transition', focus,
              meta.bg, on ? 'border-primary' : 'border-transparent hover:border-primary/30')}>
            {on ? <Check size={14} strokeWidth={3} aria-hidden /> : <meta.icon size={14} className={meta.color} aria-hidden />} {meta.short}
          </button>
        )
      })}
    </div>
  )
}
