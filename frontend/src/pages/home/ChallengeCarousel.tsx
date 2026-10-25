import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import AcceptButton from '../../components/AcceptButton'
import { Blob, Flower, Sparkle, Star } from '../../components/Decorations'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog'
import { CATEGORIES } from '../../lib/categories'
import { posterSrc, QUESTION_TYPES, type ChallengeSummary } from '../../lib/challenge'
import { formatDate } from '../../lib/dates'
import { navigate } from '../../lib/router'
import { cn } from '../../lib/utils'

// Card tints for challenges without a category, cycling like the design
const TINTS = ['bg-peach/25', 'bg-mint', 'bg-blush/30']
const tintOf = (c: ChallengeSummary, i: number) => (c.categories.length ? CATEGORIES[c.categories[0]].bg : TINTS[i % TINTS.length])

// "Tantangan Seru Untukmu": a scroll-snap row of challenge cards with arrows and page dots.
// "Mulai Sekarang" opens the details; accepting goes straight to the answer form.
export default function ChallengeCarousel({ challenges }: { challenges: ChallengeSummary[] }) {
  const list = useRef<HTMLUListElement>(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const [open, setOpen] = useState<ChallengeSummary>()

  function measure() {
    const el = list.current
    if (!el) return
    setPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05)))
    setPage(Math.round(el.scrollLeft / el.clientWidth))
  }

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [challenges])

  const scroll = (direction: number) => list.current?.scrollBy({ left: direction * list.current.clientWidth, behavior: 'smooth' })

  return (
    <div className="relative grid gap-3">
      <ul ref={list} onScroll={measure} aria-label="Tantangan baru"
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-2 [scrollbar-width:none]">
        {challenges.map((c, i) => {
          const category = c.categories.length ? CATEGORIES[c.categories[0]] : null
          return (
            <li key={c.id} className={cn('relative flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border shadow-sm transition sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)] motion-safe:hover:-translate-y-1 hover:shadow-md', tintOf(c, i))}>
              <div className="h-36 shrink-0 overflow-hidden">
                {c.hasPoster
                  ? <img src={posterSrc(c.id)} alt="" loading="lazy" className="size-full object-cover" />
                  : (
                    // No poster: a big colored category icon on a white blob, with a few doodles around it
                    <div className="relative grid size-full place-items-center">
                      <Blob className="absolute size-32 text-card/70" />
                      {category ? <category.icon size={64} strokeWidth={1.75} className={cn('relative', category.color)} aria-hidden />
                        : <Sparkles size={64} strokeWidth={1.75} className="relative fill-sun text-peach" aria-hidden />}
                      <Star className="absolute top-4 left-5 size-5 fill-sun text-[#e9a800]" />
                      <Flower className="absolute right-5 bottom-3 size-6 text-card" />
                      <Sparkle className="absolute top-5 right-6 size-4 text-peach" />
                    </div>
                  )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                {c.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.categories.map((x) => {
                      const meta = CATEGORIES[x]
                      return <span key={x} className="inline-flex items-center gap-1 rounded-full bg-card/80 px-2.5 py-0.5 text-xs font-semibold"><meta.icon size={12} className={meta.color} aria-hidden /> {meta.label}</span>
                    })}
                  </div>
                )}
                <h3 className="text-lg leading-tight font-bold">{c.title}</h3>
                {c.description && <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
                <Button variant="sun" size="sm" className="mt-auto self-start" onClick={() => setOpen(c)}>
                  Mulai Sekarang <ArrowRight aria-hidden />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      {pages > 1 && (
        <>
          <Button variant="outline" size="icon" className="absolute top-16 -left-3 hidden shadow-md sm:inline-flex" onClick={() => scroll(-1)} aria-label="Tantangan sebelumnya"><ChevronLeft /></Button>
          <Button variant="outline" size="icon" className="absolute top-16 -right-3 hidden shadow-md sm:inline-flex" onClick={() => scroll(1)} aria-label="Tantangan berikutnya"><ChevronRight /></Button>
          <div className="flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: pages }, (_, i) => (
              <span key={i} className={cn('size-2 rounded-full bg-primary/20 transition-all', i === page && 'w-5 bg-primary')} />
            ))}
          </div>
        </>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(undefined)}>
        <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-md [&_[data-slot=dialog-close]]:bg-background/80">
          {open && (
            <>
              {open.hasPoster && <img src={posterSrc(open.id)} alt={`Poster ${open.title}`} className="max-h-[45dvh] w-full object-cover" />}
              <div className="relative grid gap-3 p-5">
                <Sparkle className="absolute top-4 right-12 size-5 text-peach" />
                <DialogTitle className="text-2xl font-bold">{open.title}</DialogTitle>
                <div className="flex flex-wrap gap-1.5">
                  {open.categories.map((x) => <Badge key={x}>{CATEGORIES[x].label}</Badge>)}
                  <Badge variant="outline">{open.questionCount} soal</Badge>
                  {open.types.map((t) => <Badge key={t} variant="outline">{QUESTION_TYPES[t].label}</Badge>)}
                </div>
                <DialogDescription className="whitespace-pre-line">{open.description || 'Tidak ada deskripsi.'}</DialogDescription>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <Info label="Guru">{open.createdBy}</Info>
                  <Info label="Dibuat">{formatDate(open.createdAt.slice(0, 10))}</Info>
                </dl>
                <AcceptButton id={open.id} onAccepted={() => navigate(`/challenges/${open.id}`)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  )
}
