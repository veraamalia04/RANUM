import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  icon?: LucideIcon
  // Shows an icon inside the input box instead of next to the label
  inputIcon?: LucideIcon
  hint?: ReactNode
  children: ReactNode
}

// A labelled form control: <Field label="Nama"><Input /></Field>
export default function Field({ label, icon: Icon, inputIcon: InputIcon, hint, children }: Props) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-sm font-medium">{Icon && <Icon size={14} className="text-muted-foreground" aria-hidden />}{label}</span>
      {InputIcon ? (
        <div className="relative flex items-center [&_input]:pl-8 [&_select]:pl-8">
          <InputIcon size={16} className="pointer-events-none absolute left-2.5 z-10 text-muted-foreground" aria-hidden />
          {children}
        </div>
      ) : children}
      {hint && <small className="text-right text-xs text-muted-foreground">{hint}</small>}
    </label>
  )
}
