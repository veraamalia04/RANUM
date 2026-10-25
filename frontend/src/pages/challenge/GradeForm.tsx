import { useState, type FormEvent } from 'react'
import { MessageCircle, Save } from 'lucide-react'
import ErrorText from '../../components/ErrorText'
import Field from '../../components/Field'
import ScoreBadge from '../../components/ScoreBadge'
import SubmitButton from '../../components/SubmitButton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { api } from '../../lib/api'
import type { Answer, ChallengeDetail, Submission } from '../../lib/challenge'
import { useAction } from '../../lib/hooks'
import AnswerReview from './AnswerReview'

const QUICK_SCORES = [50, 70, 85, 100]

// Multiple choice answers always carry a choiceIndex; essays and drawings are graded by hand
const needsManualGrade = (a: Answer) => a.choiceIndex === null

export default function GradeForm({ challenge, submission, canGrade, onSaved }: {
  challenge: ChallengeDetail
  submission: Submission
  canGrade: boolean
  onSaved: () => void
}) {
  const manual = submission.answers.filter(needsManualGrade)
  const [scores, setScores] = useState<Record<number, string>>(() =>
    Object.fromEntries(manual.map((a) => [a.id, a.score?.toString() ?? ''])))
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const { status, error, run } = useAction()

  const setScore = (answerId: number, value: string) => setScores((s) => ({ ...s, [answerId]: value }))

  // Same rule as the backend: the final score is the average of every answer's score
  const complete = manual.every((a) => Number(scores[a.id]) >= 1)
  const all = submission.answers.map((a) => (needsManualGrade(a) ? Number(scores[a.id]) || 0 : a.score ?? 0))
  const preview = Math.round(all.reduce((x, y) => x + y, 0) / all.length)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const saved = await run(() => api(`/challenges/${challenge.id}/submissions/${submission.id}/grade`, 'PUT', {
      scores: Object.fromEntries(Object.entries(scores).map(([id, value]) => [id, Number(value)])),
      feedback,
    }))
    if (saved) onSaved()
  }

  const renderGrade = (a: Answer) => needsManualGrade(a) && canGrade && (
    <div className="flex flex-wrap items-center gap-1.5">
      <label className="flex items-center gap-2 font-medium">
        Nilai
        <Input type="number" min={1} max={100} required value={scores[a.id]} onChange={(e) => setScore(a.id, e.target.value)} className="w-20" />
      </label>
      {QUICK_SCORES.map((n) => (
        <Button key={n} type="button" size="sm" variant={scores[a.id] === String(n) ? 'default' : 'outline'} onClick={() => setScore(a.id, String(n))}>
          {n}
        </Button>
      ))}
    </div>
  )

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <AnswerReview questions={challenge.questions} submission={submission} renderGrade={renderGrade} />
      {canGrade ? (
        <>
          <Field label="Catatan untuk siswa (opsional)" icon={MessageCircle}>
            <Textarea rows={2} maxLength={1000} value={feedback} onChange={(e) => setFeedback(e.target.value)}
              placeholder="mis. Gambarnya keren, warnanya cerah sekali!" />
          </Field>
          <ErrorText error={error} />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton status={status} icon={Save}>Simpan nilai</SubmitButton>
            {complete && <span className="flex items-center gap-2 text-sm text-muted-foreground">Nilai akhir: <ScoreBadge score={preview} /></span>}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Hanya guru pembuat challenge ini yang bisa memberi nilai.</p>
      )}
    </form>
  )
}
