import type { ReactNode } from 'react'
import { Check, LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ActionStatus } from '../lib/hooks'
import { Button } from './ui/button'

type Props = {
  status: ActionStatus
  icon: LucideIcon
  children: ReactNode
  doneLabel?: string
  big?: boolean
}

// Submit button that shows a spinner while busy and a check mark once done (see useAction)
export default function SubmitButton({ status, icon: Icon, children, doneLabel = 'Tersimpan!', big = false }: Props) {
  return (
    <Button type="submit" size="lg" className={big ? 'h-10 w-full' : 'self-start'} disabled={status === 'busy'}>
      {status === 'busy' ? <LoaderCircle className="animate-spin" aria-hidden />
        : status === 'done' ? <Check aria-hidden />
        : <Icon aria-hidden />}
      {status === 'done' ? doneLabel : children}
    </Button>
  )
}
