import { Check } from 'lucide-react'
import { avatarUrl } from '../lib/api'
import { useFetch } from '../lib/hooks'
import { cn } from '../lib/utils'
import ErrorText from './ErrorText'
import Loader from './Loader'

// "flying_rat.webp" -> "Flying rat"
const labelOf = (name: string) => {
  const base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
  return base[0].toUpperCase() + base.slice(1)
}

export default function AvatarPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const { data: names, error } = useFetch<string[]>('/avatars')

  if (error) return <ErrorText error={error} />
  if (!names) return <Loader />

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Pilih avatar">
      {names.map((name) => (
        <button key={name} type="button" role="radio" aria-checked={value === name} onClick={() => onChange(name)}
          className={cn('relative flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-colors hover:bg-muted',
            value === name && 'border-primary bg-primary/5 ring-2 ring-primary/30')}>
          <img src={avatarUrl(name)} alt="" className="aspect-square w-full rounded-md object-cover" />
          <span className="truncate">{labelOf(name)}</span>
          {value === name && <Check className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-primary-foreground" size={18} aria-hidden />}
        </button>
      ))}
    </div>
  )
}
