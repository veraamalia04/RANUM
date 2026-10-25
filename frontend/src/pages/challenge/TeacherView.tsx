import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import ScoreBadge from '../../components/ScoreBadge'
import { Badge } from '../../components/ui/badge'
import type { ChallengeDetail, Submission } from '../../lib/challenge'
import { useFetch } from '../../lib/hooks'
import { cn } from '../../lib/utils'
import AnswerReview from './AnswerReview'
import GradeForm from './GradeForm'

// Guru/Admin view: every student's submission (expand to grade) and the answer key
export default function TeacherView({ challenge, canGrade }: { challenge: ChallengeDetail; canGrade: boolean }) {
  const { data: submissions, reload } = useFetch<Submission[]>(`/challenges/${challenge.id}/submissions`)
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold">Jawaban siswa {submissions && <Badge variant="secondary">{submissions.length}</Badge>}</h2>
      {!submissions ? <Loader /> : submissions.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Belum ada siswa yang mengumpulkan.</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {submissions.map((s) => (
            <li key={s.id}>
              <button type="button" className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50" aria-expanded={open === s.id}
                onClick={() => setOpen(open === s.id ? null : s.id)}>
                <Avatar user={{ id: s.studentId, username: s.studentName, avatar: s.studentAvatar, mood: null }} size={36} />
                <span className="mr-auto font-medium">{s.studentName}</span>
                {s.score !== null ? <ScoreBadge score={s.score} /> : <Badge>Perlu dinilai</Badge>}
                <ChevronDown size={18} className={cn('text-muted-foreground transition-transform', open === s.id && 'rotate-180')} aria-hidden />
              </button>
              {open === s.id && (
                <div className="border-t bg-muted/30 p-3">
                  <GradeForm challenge={challenge} submission={s} canGrade={canGrade} onSaved={reload} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-2 text-lg font-semibold">Soal &amp; kunci jawaban</h2>
      <AnswerReview questions={challenge.questions} />
    </>
  )
}
