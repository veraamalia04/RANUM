import { Star } from 'lucide-react'
import { scoreColor } from '../lib/challenge'
import { cn } from '../lib/utils'

export default function ScoreBadge({ score, big = false }: { score: number; big?: boolean }) {
  const stars = Math.round(score / 20)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold', scoreColor(score), big ? 'px-4 py-1.5 text-2xl' : 'px-2.5 py-0.5 text-sm')}
      title={`Nilai ${score}`}>
      {score}
      <span className="flex" role="img" aria-label={`${stars} dari 5 bintang`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={big ? 16 : 11} fill={i < stars ? 'currentColor' : 'none'} aria-hidden />
        ))}
      </span>
    </span>
  )
}
