import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CloudAlert, CloudCheck, LoaderCircle, Send } from 'lucide-react'
import DrawingInput from '../../components/DrawingInput'
import ErrorText from '../../components/ErrorText'
import SubmitButton from '../../components/SubmitButton'
import { Progress, ProgressLabel, ProgressValue } from '../../components/ui/progress'
import { Textarea } from '../../components/ui/textarea'
import { api } from '../../lib/api'
import { LETTERS, type ChallengeDetail, type Question } from '../../lib/challenge'
import { useAction } from '../../lib/hooks'
import QuestionCard from './QuestionCard'
import { choiceClass } from './choice'

type Draft = { choiceIndex?: number; text?: string; imageUrl?: string }
// GET /challenges/:id/draft; unanswered fields come back as null
type SavedDraft = { answers: { questionId: number; choiceIndex: number | null; text: string | null; imageUrl: string | null }[]; updatedAt: string }
type SaveState = { state: 'idle' } | { state: 'saving' } | { state: 'error' } | { state: 'saved'; at: Date }

// Wait this long after the last change before autosaving the draft
const AUTOSAVE_MS = 1500

const isAnswered = (q: Question, a?: Draft) =>
  q.type === 'PilihanGanda' ? a?.choiceIndex !== undefined : q.type === 'Essay' ? !!a?.text?.trim() : !!a?.imageUrl

export default function AnswerForm({ challenge, onSubmitted }: { challenge: ChallengeDetail; onSubmitted: () => void }) {
  const [answers, setAnswers] = useState<Record<number, Draft>>({})
  const [save, setSave] = useState<SaveState>({ state: 'idle' })
  // Only changes made by the Siswa trigger an autosave, not loading the saved draft
  const dirty = useRef(false)
  const { status, error, setError, run } = useAction()
  const set = (questionId: number, patch: Draft) => {
    dirty.current = true
    setAnswers((a) => ({ ...a, [questionId]: { ...a[questionId], ...patch } }))
  }

  // Pick up where they left off (404 = no draft yet)
  useEffect(() => {
    api<SavedDraft>(`/challenges/${challenge.id}/draft`).then((draft) => {
      if (dirty.current) return
      setAnswers(Object.fromEntries(draft.answers.map((a) => [a.questionId,
        { choiceIndex: a.choiceIndex ?? undefined, text: a.text ?? undefined, imageUrl: a.imageUrl ?? undefined }])))
      setSave({ state: 'saved', at: new Date(draft.updatedAt.endsWith('Z') ? draft.updatedAt : `${draft.updatedAt}Z`) })
    }, () => {})
  }, [challenge.id])

  // Autosave a moment after the last change; on failure the answers stay on screen and the next change retries
  useEffect(() => {
    if (!dirty.current) return
    const timer = setTimeout(() => {
      setSave({ state: 'saving' })
      api(`/challenges/${challenge.id}/draft`, 'PUT', {
        answers: Object.entries(answers).map(([questionId, a]) => ({ questionId: Number(questionId), ...a })),
      }).then(() => setSave({ state: 'saved', at: new Date() }), () => setSave({ state: 'error' }))
    }, AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [answers, challenge.id])

  const total = challenge.questions.length
  const done = challenge.questions.filter((q) => isAnswered(q, answers[q.id])).length

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (done < total) return setError(`Masih ada ${total - done} soal yang belum dijawab`)
    if (!confirm('Kumpulkan jawaban? Setelah dikumpulkan, jawaban tidak bisa diubah lagi.')) return
    const sent = await run(() => api(`/challenges/${challenge.id}/submissions`, 'POST', {
      answers: challenge.questions.map((q) => ({ questionId: q.id, ...answers[q.id] })),
    }))
    if (sent) onSubmitted()
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="sticky top-16 z-10 grid gap-1 bg-background/95 py-3">
        <Progress value={(done / total) * 100}>
          <ProgressLabel>Progres</ProgressLabel>
          <ProgressValue>{() => `${done}/${total} terjawab`}</ProgressValue>
        </Progress>
        <SaveStatus save={save} />
      </div>

      {challenge.questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} done={isAnswered(q, answers[q.id])}>
          {q.type === 'PilihanGanda' && (
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={`Jawaban soal ${i + 1}`}>
              {q.options.map((o, oi) => (
                <button key={oi} type="button" role="radio" aria-checked={answers[q.id]?.choiceIndex === oi}
                  className={choiceClass(answers[q.id]?.choiceIndex === oi ? 'selected' : null)} onClick={() => set(q.id, { choiceIndex: oi })}>
                  <span className="font-semibold text-muted-foreground">{LETTERS[oi]}</span> {o}
                </button>
              ))}
            </div>
          )}
          {q.type === 'Essay' && (
            <Textarea rows={4} maxLength={2000} value={answers[q.id]?.text ?? ''} aria-label={`Jawaban soal ${i + 1}`}
              placeholder="Tulis jawabanmu di sini..." onChange={(e) => set(q.id, { text: e.target.value })} />
          )}
          {q.type === 'Menggambar' && <DrawingInput value={answers[q.id]?.imageUrl} onChange={(imageUrl) => set(q.id, { imageUrl })} />}
        </QuestionCard>
      ))}

      <ErrorText error={error} />
      <SubmitButton status={status} icon={Send} big doneLabel="Terkirim!">Kumpulkan jawaban</SubmitButton>
    </form>
  )
}

function SaveStatus({ save }: { save: SaveState }) {
  if (save.state === 'idle') return <p className="text-xs text-muted-foreground">Jawabanmu tersimpan otomatis saat kamu mengisi.</p>
  if (save.state === 'saving') return <p className="flex items-center gap-1 text-xs text-muted-foreground"><LoaderCircle size={12} className="animate-spin" aria-hidden /> Menyimpan…</p>
  if (save.state === 'error') return <p role="alert" className="flex items-center gap-1 text-xs font-semibold text-destructive"><CloudAlert size={12} aria-hidden /> Belum tersimpan, cek koneksimu</p>
  const time = save.at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  return <p className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite"><CloudCheck size={12} aria-hidden /> Tersimpan otomatis {time}</p>
}
