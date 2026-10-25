import { Plus, Trash2, X } from 'lucide-react'
import Field from '../../components/Field'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { LETTERS, type QuestionType } from '../../lib/challenge'
import { cn } from '../../lib/utils'
import QuestionHead from './QuestionHead'

export type QuestionDraft = { key: number; type: QuestionType; text: string; options: string[]; correctIndex: number }

// One question being written by the guru: its text and, for multiple choice, the options and correct answer
export default function QuestionEditor({ q, index, onChange, onRemove }: {
  q: QuestionDraft
  index: number
  onChange: (patch: Partial<QuestionDraft>) => void
  onRemove: () => void
}) {
  const setOption = (i: number, value: string) => onChange({ options: q.options.map((o, oi) => (oi === i ? value : o)) })

  // Keep the correct answer pointing at the same option after one is removed
  const removeOption = (i: number) => onChange({
    options: q.options.filter((_, oi) => oi !== i),
    correctIndex: q.correctIndex === i ? 0 : q.correctIndex > i ? q.correctIndex - 1 : q.correctIndex,
  })

  return (
    <li>
      <Card>
        <CardContent className="grid gap-4">
          <QuestionHead type={q.type} number={index + 1}>
            <Button type="button" variant="ghost" size="icon-sm" className="ml-auto text-muted-foreground hover:text-destructive"
              onClick={onRemove} aria-label={`Hapus soal ${index + 1}`} title="Hapus soal">
              <Trash2 />
            </Button>
          </QuestionHead>

          <Field label={q.type === 'Menggambar' ? 'Perintah menggambar' : 'Pertanyaan'}>
            <Textarea value={q.text} onChange={(e) => onChange({ text: e.target.value })} required maxLength={1000} rows={2}
              placeholder={q.type === 'Menggambar' ? 'mis. Gambarlah hewan peliharaan impianmu!' : 'Tulis pertanyaannya di sini'} />
          </Field>

          {q.type === 'PilihanGanda' ? (
            <fieldset className="grid gap-2">
              <legend className="mb-1.5 text-sm font-medium">Pilihan jawaban <span className="font-normal text-muted-foreground">(pilih lingkaran di jawaban yang benar)</span></legend>
              {q.options.map((o, i) => (
                <div key={i} className={cn('flex items-center gap-2 rounded-lg border p-1.5 pl-2.5', q.correctIndex === i && 'border-green-500 bg-green-50')}>
                  <input type="radio" name={`correct-${q.key}`} checked={q.correctIndex === i} className="size-4 accent-green-600"
                    onChange={() => onChange({ correctIndex: i })} aria-label={`Pilihan ${LETTERS[i]} jawaban benar`} />
                  <span className="w-4 text-sm font-semibold text-muted-foreground">{LETTERS[i]}</span>
                  <Input value={o} required maxLength={200} aria-label={`Pilihan ${LETTERS[i]}`} placeholder={`Pilihan ${LETTERS[i]}`}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0" onChange={(e) => setOption(i, e.target.value)} />
                  {q.options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOption(i)} aria-label={`Hapus pilihan ${LETTERS[i]}`}>
                      <X />
                    </Button>
                  )}
                </div>
              ))}
              {q.options.length < LETTERS.length && (
                <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => onChange({ options: [...q.options, ''] })}>
                  <Plus aria-hidden /> Tambah pilihan
                </Button>
              )}
            </fieldset>
          ) : (
            <p className="text-sm text-muted-foreground">
              {q.type === 'Essay' ? 'Siswa menulis jawabannya' : 'Siswa menggambar langsung atau upload foto gambarnya'}, lalu kamu memberi nilai 1–100.
            </p>
          )}
        </CardContent>
      </Card>
    </li>
  )
}
