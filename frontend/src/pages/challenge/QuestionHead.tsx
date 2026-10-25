import type { ReactNode } from 'react'
import { QUESTION_TYPES, type QuestionType } from '../../lib/challenge'
import { cn } from '../../lib/utils'

// "1  [icon] Pilihan Ganda" row at the top of a question card
export default function QuestionHead({ type, number, done = false, children }: {
  type: QuestionType
  number: ReactNode
  done?: boolean
  children?: ReactNode
}) {
  const meta = QUESTION_TYPES[type]
  return (
    <div className="flex items-center gap-2">
      <span className={cn('grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold', done && 'bg-green-500 text-white')}>{number}</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.color }}>
        <meta.icon size={14} aria-hidden /> {meta.label}
      </span>
      {children}
    </div>
  )
}
