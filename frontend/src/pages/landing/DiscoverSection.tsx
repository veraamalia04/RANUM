import { Heart } from 'lucide-react'
import { Flower, SectionTitle, Sparkle, Star } from '../../components/Decorations'
import { cn } from '../../lib/utils'
import { paperCard, pillars } from './data'
import Sprinkles from '../../components/Sprinkles'

// "A Little Space to Discover Yourself" (About)
export default function DiscoverSection() {
  return (
    <section id="about" aria-labelledby="about-title" className={cn(paperCard, 'relative px-4 py-16')}>
      <Sprinkles items={[
        ['flower', 'top-5 left-6 size-7'], ['star', 'top-6 left-[30%] size-5'], ['heart', 'bottom-5 left-[24%] size-5'],
        ['bluestar', 'bottom-3 right-[30%] size-5'], ['sparkle', 'top-4 right-[18%] size-5'],
        ['pinkflower', 'bottom-4 right-6 size-6'],
      ]} />
      <Heart className="absolute bottom-8 left-5 size-7 text-[#e8667f]" aria-hidden />
      <Star className="absolute top-5 right-[40%] hidden size-7 fill-sun text-[#e9a800] md:block" />
      <Sparkle className="absolute bottom-6 left-[38%] hidden size-6 text-sky md:block" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="grid gap-4">
          <SectionTitle id="about-title" className="text-3xl sm:text-4xl">A Little Space to Discover Yourself</SectionTitle>
          <p className="max-w-md text-base">
            RANUM adalah ruang eksplorasi yang membantu anak mengenali minat, mengembangkan bakat, dan menunjukkan proses
            pertumbuhan mereka melalui berbagai aktivitas dan karya.
          </p>
        </div>
        <ul className="relative grid gap-4 sm:grid-cols-3">
          <Flower className="absolute -top-6 -right-4 size-10 text-sky" />
          {pillars.map((p) => (
            <li key={p.title} className={cn('group grid content-start justify-items-center gap-3 rounded-3xl px-5 py-8 text-center shadow-sm transition hover:shadow-lg motion-safe:hover:-translate-y-1', p.className)}>
              <p.icon className={cn('size-16 transition motion-safe:group-hover:scale-110', p.iconClass)} strokeWidth={1.75} aria-hidden />
              <h3 className="text-xl font-extrabold tracking-wide">{p.title}</h3>
              <p className="text-sm">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
