import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import type { Question } from '../../lib/challenge'
import { cn } from '../../lib/utils'
import QuestionHead from './QuestionHead'

// Numbered card for one question; `done` swaps the number for a check mark
export default function QuestionCard({ q, index, done = false, children }: {
  q: Question
  index: number
  done?: boolean
  children: ReactNode
}) {
  return (
    <Card className={cn(done && 'ring-green-500/40')}>
      <CardContent className="grid gap-3">
        <QuestionHead type={q.type} number={done ? <Check size={14} aria-label="Terjawab" /> : index + 1} done={done} />
        <p className="font-medium whitespace-pre-line">{q.text}</p>
        {children}
      </CardContent>
    </Card>
  )
}
