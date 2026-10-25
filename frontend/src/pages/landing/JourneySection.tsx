import { Heart, Send } from 'lucide-react'
import { DoodleArrow, SectionTitle, Sparkle, Star } from '../../components/Decorations'
import { cn } from '../../lib/utils'
import { journeySteps, paperCard } from './data'
import Sprinkles from '../../components/Sprinkles'

// "Your Journey Starts Here" (How It Works): icon blobs with number badges joined by doodle arrows on desktop,
// a vertical timeline on mobile
export default function JourneySection() {
  return (
    <section id="how-it-works" aria-labelledby="journey-title" className={cn(paperCard, 'relative px-4 py-16')}>
      <Sprinkles items={[
        ['sparkle', 'top-8 left-[45%] size-5'], ['pinkflower', 'top-10 right-[30%] size-6'], ['heart', 'bottom-6 left-[50%] size-5'],
        ['note', 'top-12 left-[60%] size-5'], ['flower', 'bottom-5 right-6 size-7'], ['bluestar', 'bottom-8 left-6 size-5'],
      ]} />
      <div className="mx-auto grid max-w-6xl gap-10">
        <div className="grid gap-1">
          <SectionTitle id="journey-title" className="text-3xl sm:text-4xl">Your Journey Starts Here</SectionTitle>
          <p className="pl-9">Setiap langkah kecilmu berarti!</p>
        </div>
        <ol className="relative mx-auto grid w-full max-w-4xl gap-10 border-l-2 border-dashed border-primary/30 pl-10 md:grid-cols-3 md:gap-6 md:border-0 md:pl-0">
          {journeySteps.map((s, i) => (
            <li key={s.number} className="relative grid gap-2 md:justify-items-center md:text-center">
              <div className="absolute top-0 -left-[3.9rem] md:relative md:left-0">
                <span className={cn('grid size-12 place-items-center rounded-full md:size-32 md:rounded-[45%_55%_50%_50%]', s.className)}>
                  <s.icon className="size-6 md:size-14" strokeWidth={1.75} aria-hidden />
                </span>
                <span className={cn('absolute -top-3 left-1/2 hidden size-10 -translate-x-1/2 place-items-center rounded-full font-heading text-lg font-extrabold shadow-sm md:grid', s.badge)}>
                  {s.number}
                </span>
              </div>
              {i < journeySteps.length - 1 && (
                <DoodleArrow className="absolute top-12 left-[calc(50%+5rem)] hidden w-[calc(100%-10rem)] -rotate-12 text-primary/60 md:block" />
              )}
              <p className="font-heading text-2xl font-extrabold text-peach md:hidden">{s.number}</p>
              <h3 className="text-xl font-extrabold tracking-wide">{s.title}</h3>
              <p className="text-sm">{s.text}</p>
            </li>
          ))}
          <Star className="absolute -top-6 right-0 size-6 fill-sun text-sun" />
          <Star className="absolute top-1/2 -left-6 hidden size-8 fill-sun text-[#e9a800] md:block" />
          <Star className="absolute right-[-2rem] bottom-4 hidden size-7 fill-sun text-[#e9a800] md:block" />
          <Send className="absolute -top-14 right-[12%] hidden size-9 -rotate-12 text-[#4a8fd6] md:block" aria-hidden />
          <Heart className="absolute bottom-6 -left-8 hidden size-6 text-[#4a8fd6] md:block" aria-hidden />
          <Sparkle className="absolute bottom-0 left-[30%] hidden size-6 text-peach md:block" />
        </ol>
      </div>
    </section>
  )
}
