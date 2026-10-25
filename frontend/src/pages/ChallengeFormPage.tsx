import { useState, type FormEvent } from 'react'
import { GraduationCap, Plus, Send } from 'lucide-react'
import BackLink from '../components/BackLink'
import CategoryChips from '../components/CategoryChips'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import SubmitButton from '../components/SubmitButton'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { NativeSelect, NativeSelectOption } from '../components/ui/native-select'
import { Textarea } from '../components/ui/textarea'
import { api, KELAS } from '../lib/api'
import type { Category } from '../lib/categories'
import { QUESTION_TYPES, type QuestionType } from '../lib/challenge'
import { useAction } from '../lib/hooks'
import { navigate } from '../lib/router'
import PosterInput from './challenge/PosterInput'
import QuestionEditor, { type QuestionDraft } from './challenge/QuestionEditor'

// Stable list keys without crypto.randomUUID, which needs a secure context (breaks on LAN http)
let nextKey = 0
const newQuestion = (type: QuestionType): QuestionDraft =>
  ({ key: nextKey++, type, text: '', options: type === 'PilihanGanda' ? ['', ''] : [], correctIndex: 0 })

// Shape the drafts the way the API expects: options and correctIndex only for multiple choice
const toRequest = (q: QuestionDraft) => ({
  type: q.type,
  text: q.text,
  options: q.type === 'PilihanGanda' ? q.options : null,
  correctIndex: q.type === 'PilihanGanda' ? q.correctIndex : null,
})

export default function ChallengeFormPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [kelas, setKelas] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [poster, setPoster] = useState<string>()
  const [questions, setQuestions] = useState(() => [newQuestion('PilihanGanda')])
  const { status, error, setError, run } = useAction()

  const update = (key: number, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (questions.length === 0) return setError('Tambahkan minimal satu soal')
    const created = await run(() => api<{ id: number }>('/challenges', 'POST', {
      title, description, kelas: kelas ? Number(kelas) : null, categories, posterUrl: poster ?? null, questions: questions.map(toRequest),
    }))
    if (created) navigate(`/challenges/${created.id}`)
  }

  return (
    <form className="mx-auto grid max-w-2xl gap-4" onSubmit={submit}>
      <BackLink to="/challenges">Semua challenge</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Buat challenge baru</h1>
      <Card>
        <CardHeader><CardTitle>Info challenge</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Judul">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} placeholder="mis. Kuis Hewan Lucu" />
          </Field>
          <Field label="Penjelasan (opsional)">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={2}
              placeholder="Ceritakan challenge ini ke siswa" />
          </Field>
          <Field label="Disarankan untuk kelas (opsional)" inputIcon={GraduationCap}
            hint="Semua siswa tetap bisa mengambil tantangan ini">
            <NativeSelect value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full">
              <NativeSelectOption value="">Semua kelas</NativeSelectOption>
              {KELAS.map((k) => <NativeSelectOption key={k} value={k}>Kelas {k}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">Kategori (opsional, boleh lebih dari satu)</span>
            <CategoryChips label="Kategori challenge" value={categories} onChange={setCategories} />
          </div>
          <PosterInput value={poster} onChange={setPoster} />
        </CardContent>
      </Card>

      <ol className="grid gap-4">
        {questions.map((q, i) => (
          <QuestionEditor key={q.key} q={q} index={i} onChange={(patch) => update(q.key, patch)}
            onRemove={() => setQuestions((qs) => qs.filter((x) => x.key !== q.key))} />
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3">
        <span className="flex items-center gap-1 text-sm text-muted-foreground"><Plus size={14} aria-hidden /> Tambah soal:</span>
        {(Object.keys(QUESTION_TYPES) as QuestionType[]).map((t) => {
          const meta = QUESTION_TYPES[t]
          return (
            <Button key={t} type="button" variant="outline" onClick={() => setQuestions((qs) => [...qs, newQuestion(t)])}>
              <meta.icon style={{ color: meta.color }} aria-hidden /> {meta.label}
            </Button>
          )
        })}
      </div>

      <ErrorText error={error} />
      <SubmitButton status={status} icon={Send} big doneLabel="Terkirim!">Posting challenge</SubmitButton>
    </form>
  )
}
