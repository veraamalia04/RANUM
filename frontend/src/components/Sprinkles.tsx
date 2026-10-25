import { Flower2, Heart, Music, Sparkles, Star } from 'lucide-react'
import { cn } from '../lib/utils'

const kinds = {
  star: { icon: Star, className: 'fill-sun text-[#e9a800]' },
  bluestar: { icon: Star, className: 'fill-[#7fbef5] text-[#4a8fd6]' },
  heart: { icon: Heart, className: 'fill-blush text-[#e8667f]' },
  flower: { icon: Flower2, className: 'text-sky' },
  pinkflower: { icon: Flower2, className: 'text-blush' },
  sparkle: { icon: Sparkles, className: 'text-peach' },
  note: { icon: Music, className: 'text-[#7d64d6]' },
}

export type Sprinkle = [kind: keyof typeof kinds, position: string]

// Small twinkling decorations scattered over a section (which must be `relative`), on the landing page and Beranda.
// Each item is [kind, "top-[10%] left-[5%] size-6"]; hidden on phones so they never cover text.
export default function Sprinkles({ items }: { items: Sprinkle[] }) {
  return items.map(([kind, position], i) => {
    const { icon: Icon, className } = kinds[kind]
    return (
      <Icon key={i} aria-hidden strokeWidth={1.75} style={{ animationDelay: `${-(i * 0.7) % 2.6}s` }}
        className={cn('pointer-events-none absolute hidden size-6 select-none md:block motion-safe:animate-twinkle', className, position)} />
    )
  })
}
