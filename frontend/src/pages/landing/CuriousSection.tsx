import { Flower, Leaf, Sparkle } from '../../components/Decorations'
import { MAIN_MASCOT } from '../../lib/mascots'
import { cn } from '../../lib/utils'
import { curiosityCategories, paperCard } from './data'
import Mascot from '../../components/Mascot'
import Sprinkles from '../../components/Sprinkles'

// "What Are You Curious About?" (Explore), with the mascot peeking in
export default function CuriousSection() {
  return (
    <section id="explore" aria-labelledby="explore-title" className={cn(paperCard, 'relative px-4 py-12')}>
      <Mascot src={MAIN_MASCOT} say="Pilih satu!" className="top-[-4.5rem] bottom-auto right-[6%] hidden w-32 sm:block" delay={0.6} />
      <Flower className="absolute top-8 left-[6%] hidden size-10 text-sky sm:block" />
      <Leaf className="absolute top-10 left-[22%] hidden size-8 text-primary/50 sm:block" />
      <Sparkle className="absolute bottom-10 left-3 size-8 text-sun" />
      <Sprinkles items={[
        ['star', 'top-10 left-[14%] size-6'], ['bluestar', 'top-6 left-[30%] size-5'], ['heart', 'top-8 right-[28%] size-5'],
        ['note', 'top-14 right-[20%] size-6'], ['sparkle', 'top-24 left-[26%] size-4'], ['pinkflower', 'bottom-3 left-[40%] size-6'],
        ['star', 'bottom-3 right-[12%] size-5'], ['flower', 'bottom-4 right-[45%] size-5'],
      ]} />
      <div className="mx-auto grid max-w-6xl gap-8">
        <div className="grid gap-2 text-center">
          <h2 id="explore-title" className="text-3xl font-extrabold sm:text-4xl">What Are You Curious About?</h2>
          <p>Pilih minatmu, temukan duniamu!</p>
        </div>
        {/* Mobile: horizontal scroll; tablet: 2 columns; desktop: one row of 5 */}
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {curiosityCategories.map((c) => (
            <li key={c.title} className="w-48 shrink-0 snap-start rounded-3xl bg-card p-2 shadow-sm transition hover:shadow-lg sm:w-auto motion-safe:hover:-translate-y-1.5">
              <div className={cn('group grid h-full justify-items-center gap-2 rounded-2xl px-3 py-6 text-center', c.className)}>
                <c.icon className={cn('size-14 transition motion-safe:group-hover:scale-110', c.iconClass)} strokeWidth={1.75} aria-hidden />
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                <p className="text-xs">{c.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

