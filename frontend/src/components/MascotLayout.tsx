import { useState, type ReactNode } from 'react'
import { Smile } from 'lucide-react'
import { randomMascots } from '../lib/mascots'
import { cn } from '../lib/utils'
import { DoodleArrow, Illustration, Sparkle, Star } from './Decorations'

// A centered page column with three random RANUM mascots (public/images/mascots) and a handwritten note on each side.
// A new random set is picked every time the page opens; each side is picked separately (there are only 5 mascots). The mascots only show from xl (1280px); below that
// the sides are too narrow and the column is just centered. Pages using it get the wider max-w-7xl container in App.
export default function MascotLayout({ left, right, children }: { left: string; right: string; children: ReactNode }) {
  const [mascots] = useState(() => [randomMascots(3), randomMascots(3)])
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_minmax(0,42rem)_1fr]">
      <MascotSide text={left} images={mascots[0]} />
      <div className="mx-auto w-full max-w-2xl min-w-0">{children}</div>
      <MascotSide text={right} images={mascots[1]} mirrored />
    </div>
  )
}

// Written out in full so Tailwind sees the classes
const delays = ['', '[animation-delay:-2s]', '[animation-delay:-4s]']

// Sticky while scrolling; the right side is mirrored so the mascots face the page
function MascotSide({ text, images, mirrored = false }: { text: string; images: string[]; mirrored?: boolean }) {
  return (
    <aside aria-hidden className="hidden xl:block">
      {/* One screen tall (minus the top bar), with the note, mascots and stars spread evenly over it */}
      <div className="sticky top-20 flex h-[calc(100svh-6rem)] flex-col items-center justify-evenly py-2">
        {/* Handwritten note with a doodle arrow, like "You can do it!" on the landing page */}
        <div className="grid justify-items-center">
          <p className={cn('text-center font-hand text-2xl leading-tight font-bold', mirrored ? 'rotate-6' : '-rotate-6')}>{text}</p>
          <DoodleArrow className={cn('w-10 text-primary', mirrored ? '-scale-x-100 rotate-[60deg]' : 'rotate-[60deg]')} />
        </div>
        {images.map((src, i) => (
          <Illustration key={src} src={src} alt="" icon={Smile}
            className={cn('h-[clamp(6rem,19svh,11rem)] w-full max-w-44 motion-safe:animate-float', delays[i], mirrored && '-scale-x-100',
              i === 1 && (mirrored ? 'mr-10' : 'ml-10'))} />
        ))}
        <div className="flex gap-2">
          <Star className="size-5 fill-sun text-sun" />
          <Sparkle className="size-5 text-peach" />
        </div>
      </div>
    </aside>
  )
}
