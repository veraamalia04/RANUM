import type { ReactNode } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import { LETTERS, type Answer, type Question, type Submission } from '../../lib/challenge'
import { choiceClass } from './choice'
import QuestionCard from './QuestionCard'

// Read-only list of questions with the answer key; with a submission it also shows the student's answers and scores.
// `renderGrade` lets the grading form put score inputs under each answer.
export default function AnswerReview({ questions, submission, renderGrade }: {
  questions: Question[]
  submission?: Submission
  renderGrade?: (answer: Answer) => ReactNode
}) {
  return (
    <div className="grid gap-4">
      {questions.map((q, i) => {
        const answer = submission?.answers.find((a) => a.questionId === q.id)
        return (
          <QuestionCard key={q.id} q={q} index={i}>
            {q.type === 'PilihanGanda' && <ChoiceReview q={q} picked={answer?.choiceIndex ?? null} />}
            {q.type === 'Essay' && answer?.text && <p className="rounded-lg bg-muted p-3 text-sm whitespace-pre-line">{answer.text}</p>}
            {q.type === 'Menggambar' && answer?.imageUrl && (
              <img className="rounded-lg border" src={answer.imageUrl} alt={`Gambar jawaban soal ${i + 1}`} />
            )}
            {answer && (answer.score !== null || renderGrade) && (
              <div className="flex flex-wrap items-center gap-3 border-t pt-3 text-sm">
                {answer.score !== null && <span className="text-muted-foreground">Nilai soal ini: <strong className="text-foreground">{answer.score}</strong></span>}
                {renderGrade?.(answer)}
              </div>
            )}
          </QuestionCard>
        )
      })}
    </div>
  )
}

function ChoiceReview({ q, picked }: { q: Question; picked: number | null }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {q.options.map((o, i) => {
        const correct = q.correctIndex === i
        const wrongPick = picked === i && !correct
        return (
          <li key={i} className={choiceClass(correct ? 'correct' : wrongPick ? 'wrong' : null)}>
            <span className="font-semibold opacity-60">{LETTERS[i]}</span> {o}
            {correct && <CircleCheck size={16} className="ml-auto shrink-0" aria-label="Jawaban benar" />}
            {wrongPick && <CircleX size={16} className="ml-auto shrink-0" aria-label="Jawaban dipilih, salah" />}
          </li>
        )
      })}
    </ul>
  )
}
