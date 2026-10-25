import { CheckCircle2, Sprout } from 'lucide-react'
import { Flower, SectionTitle, Sparkle, Star } from '../../components/Decorations'
import { Badge } from '../../components/ui/badge'
import { Progress, ProgressLabel } from '../../components/ui/progress'
import { cn } from '../../lib/utils'
import { growthSkills, paperCard } from './data'
import Sprinkles from '../../components/Sprinkles'

// "Show Your Growth": an example karya and progress card (static sample data)
export default function GrowthSection() {
  return (
    <section aria-labelledby="growth-title" className={cn(paperCard, 'relative px-4 py-12')}>
      <Star className="absolute top-6 right-[30%] hidden size-7 fill-sun text-[#e9a800] md:block" />
      <Sparkle className="absolute bottom-6 left-6 size-6 text-peach" />
      <Sprinkles items={[
        ['heart', 'top-8 left-[40%] size-5'], ['note', 'top-10 right-[20%] size-6'], ['flower', 'top-6 right-6 size-7'],
        ['bluestar', 'bottom-5 left-[35%] size-5'], ['pinkflower', 'bottom-4 right-[30%] size-6'], ['sparkle', 'top-14 left-[55%] size-5'],
      ]} />
      <div className="mx-auto grid max-w-6xl gap-8">
        <div className="grid gap-1">
          <SectionTitle id="growth-title" className="text-3xl sm:text-4xl">Show Your Growth</SectionTitle>
          <p className="pl-9">Setiap karya adalah cerita tentang prosesmu.</p>
        </div>
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="grid gap-3">
            <article className="flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
              <img src="/images/sample-drawing.jpg" alt="Contoh gambar pemandangan rumah di bukit buatan anak"
                className="aspect-[4/3] w-full rounded-2xl object-cover sm:w-44" />
              <div className="grid justify-items-start gap-2">
                <h3 className="text-lg font-extrabold">My First Digital Drawing</h3>
                <p className="text-sm text-muted-foreground">Created by: Aulia</p>
                <Badge className="bg-sun/50 text-foreground">Creative Exploration</Badge>
                <Badge className="bg-mint text-foreground"><CheckCircle2 aria-hidden /> Completed</Badge>
              </div>
            </article>
            <div className="flex justify-center gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => <span key={i} className={cn('size-2 rounded-full bg-primary/20', i === 0 && 'bg-primary')} />)}
            </div>
          </div>

          <article className="relative grid content-start gap-4 rounded-3xl bg-mint/50 p-6 shadow-sm">
            <Flower className="absolute -top-6 -right-4 size-14 text-sky" />
            <div className="flex items-start gap-3">
              <Sprout className="size-7 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="text-xl font-extrabold">My Progress</h3>
                <p className="text-sm text-muted-foreground">Lihat pertumbuhanmu dari setiap aktivitas!</p>
              </div>
            </div>
            {growthSkills.map((s) => (
              <Progress key={s.label} value={s.value}
                className={cn('flex-nowrap items-center gap-3 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:w-auto [&_[data-slot=progress-track]]:flex-1 [&_[data-slot=progress-track]]:bg-card', s.bar)}>
                <ProgressLabel className="flex w-36 shrink-0 items-center gap-2 font-semibold">
                  <s.icon size={18} className={s.iconClass} aria-hidden /> {s.label}
                </ProgressLabel>
              </Progress>
            ))}
          </article>
        </div>
      </div>
    </section>
  )
}
