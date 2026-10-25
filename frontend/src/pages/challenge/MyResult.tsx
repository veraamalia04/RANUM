import { Clock, MessageCircle, PartyPopper } from 'lucide-react'
import ScoreBadge from '../../components/ScoreBadge'
import { Card, CardContent } from '../../components/ui/card'
import type { ChallengeDetail, Submission } from '../../lib/challenge'
import AnswerReview from './AnswerReview'

// What a Siswa sees after submitting: their score (or "waiting") and their answers with the key
export default function MyResult({ challenge, submission }: { challenge: ChallengeDetail; submission: Submission }) {
  return (
    <>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          {submission.score !== null ? (
            <>
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><PartyPopper size={24} aria-hidden /></span>
              <div className="grid gap-1">
                <h2 className="text-sm text-muted-foreground">Nilai kamu</h2>
                <ScoreBadge score={submission.score} big />
              </div>
              {submission.feedback && (
                <p className="flex w-full items-start gap-2 rounded-lg bg-muted p-3 text-sm"><MessageCircle size={16} className="mt-0.5 shrink-0" aria-hidden /> “{submission.feedback}”</p>
              )}
            </>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><Clock size={24} aria-hidden /></span>
              <div>
                <h2 className="font-semibold">Jawabanmu sudah terkirim! 🎉</h2>
                <p className="text-sm text-muted-foreground">Tunggu gurumu memberi nilai ya.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <AnswerReview questions={challenge.questions} submission={submission} />
    </>
  )
}
