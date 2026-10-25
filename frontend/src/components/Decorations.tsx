import { useState } from 'react'
import { Flower2, Leaf as LeafIcon, Sparkles, Sprout, Star as StarIcon, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

// RANUM's doodle decorations. All are aria-hidden and ignore the pointer; position them with className
// (e.g. "absolute -top-3 right-6 text-sky"). Hide them on small screens when they would cover text.

type Props = { className?: string }

const deco = 'pointer-events-none select-none'

export function Flower({ className }: Props) {
  return <Flower2 aria-hidden className={cn(deco, className)} />
}

export function Leaf({ className }: Props) {
  return <LeafIcon aria-hidden className={cn(deco, className)} />
}

export function Star({ className }: Props) {
  return <StarIcon aria-hidden className={cn(deco, className)} />
}

export function Sparkle({ className }: Props) {
  return <Sparkles aria-hidden className={cn(deco, className)} />
}

// Hand-drawn arrow curving down and to the right
export function DoodleArrow({ className }: Props) {
  return (
    <svg viewBox="0 0 80 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden className={cn(deco, 'w-16', className)}>
      <path d="M4 8c18-8 42-4 52 14 5 9 6 16 4 22" />
      <path d="M52 38l8 7 7-10" />
    </svg>
  )
}

// Dashed wavy line, used to connect steps
export function CurvyLine({ className }: Props) {
  return (
    <svg viewBox="0 0 120 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 8"
      preserveAspectRatio="none" aria-hidden className={cn(deco, className)}>
      <path d="M2 18C22 2 40 2 60 15s38 13 58-3" />
    </svg>
  )
}

// Wobbly marker underline that sits under a word
export function Underline({ className }: Props) {
  return (
    <svg viewBox="0 0 100 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
      preserveAspectRatio="none" aria-hidden className={cn(deco, 'h-2.5 w-full', className)}>
      <path d="M3 8c20-5 40-6 60-3s25 1 34-2" />
    </svg>
  )
}

// Organic blob shape, filled with the current text color
export function Blob({ className }: Props) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={cn(deco, className)}>
      <path fill="currentColor" d="M44 -58c14 11 25 27 27 44 2 18-6 37-19 50S20 57 2 59c-19 2-40-3-53-17s-17-37-11-56 22-34 40-43 37-12 53-1z"
        transform="translate(100 100)" />
    </svg>
  )
}

// A leaf before every section title, like the design
// `as="h1"` when it is the page title
export function SectionTitle({ id, children, className, as: Tag = 'h2' }: { id?: string; children: string; className?: string; as?: 'h1' | 'h2' }) {
  return (
    <Tag id={id} className={cn('flex items-center gap-2 text-2xl font-bold tracking-tight', className)}>
      <Sprout className="shrink-0 text-primary" size={26} aria-hidden /> {children}
    </Tag>
  )
}

// An illustration from /public/images. Until the file exists (or when it fails to load) a pastel
// blob with a big icon stands in, so the layout never breaks.
export function Illustration({ src, alt, icon: Icon = Flower2, className }: {
  src: string
  alt: string
  icon?: LucideIcon
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!failed) return <img src={src} alt={alt} onError={() => setFailed(true)} className={cn('object-contain', className)} />
  return (
    <div role="img" aria-label={alt} className={cn('relative grid place-items-center', className)}>
      <Blob className="absolute inset-0 size-full text-sun" />
      <Blob className="absolute inset-[18%] size-[64%] rotate-90 text-mint" />
      <Icon className="relative size-1/3 text-primary" aria-hidden strokeWidth={1.5} />
      <Star className="absolute top-[8%] right-[12%] size-[10%] fill-sun text-peach" />
      <Flower className="absolute bottom-[10%] left-[8%] size-[12%] text-sky" />
    </div>
  )
}

// Landing scenery, drawn in SVG because there are no image assets for it

// Fluffy white cloud
export function Cloud({ className }: Props) {
  return (
    <svg viewBox="0 0 120 60" aria-hidden className={cn(deco, 'text-white', className)}>
      <path fill="currentColor" d="M22 58C8 58 2 48 6 39s14-11 20-8c2-14 14-22 27-19 6-9 22-12 32-2 8-2 18 4 19 13 10 0 16 8 14 18-1 9-9 17-18 17z" />
    </svg>
  )
}

// Pastel half rainbow
export function Rainbow({ className }: Props) {
  const bands = ['#ff9a8b', '#ffd68b', '#d9f2c7', '#a7d8ff', '#c9b8f5']
  return (
    <svg viewBox="0 0 200 100" fill="none" strokeWidth="11" aria-hidden className={cn(deco, className)}>
      {bands.map((c, i) => <path key={c} stroke={c} d={`M${10 + i * 11} 100a${90 - i * 11} ${90 - i * 11} 0 0 1 ${180 - i * 22} 0`} />)}
    </svg>
  )
}

// Smiling sun with rays
export function SunFace({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn(deco, className)}>
      <g stroke="#ffd68b" strokeWidth="5" strokeLinecap="round">
        {Array.from({ length: 10 }, (_, i) => <path key={i} d="M50 6v10" transform={`rotate(${i * 36} 50 50)`} />)}
      </g>
      <circle cx="50" cy="50" r="28" fill="#ffd25e" />
      <circle cx="40" cy="47" r="3" fill="#2f684e" />
      <circle cx="60" cy="47" r="3" fill="#2f684e" />
      <circle cx="35" cy="56" r="4" fill="#ffb6c1" />
      <circle cx="65" cy="56" r="4" fill="#ffb6c1" />
      <path d="M42 57q8 8 16 0" fill="none" stroke="#2f684e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Two layers of rolling green hills; stretch it across the bottom of a section
export function Hills({ className }: Props) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden className={cn(deco, className)}>
      <path fill="#a9d98a" d="M0 60c120-40 260-50 400-20s260 40 380 5 300-50 420-15 180 30 240 20v70H0z" />
      <path fill="#7cc46b" d="M0 90c160-30 320-35 480-10s300 25 460 0 340-30 500 0v40H0z" />
    </svg>
  )
}

// Fairy-tale castle standing on a stack of books (hero, left side)
export function BookCastle({ className }: Props) {
  const books = [
    { x: 10, y: 192, w: 180, fill: '#6fbf73' },
    { x: 22, y: 166, w: 164, fill: '#ff9a58' },
    { x: 14, y: 140, w: 170, fill: '#7fbef5' },
  ]
  return (
    <svg viewBox="0 0 200 220" aria-hidden className={cn(deco, className)}>
      {/* castle */}
      <rect x="50" y="80" width="100" height="62" fill="#ffd0d8" />
      {[50, 72, 94, 116, 138].map((x) => <rect key={x} x={x} y="70" width="12" height="12" fill="#ffd0d8" />)}
      <rect x="34" y="52" width="30" height="90" fill="#ffe6a8" />
      <path d="M28 54 49 12l21 42z" fill="#7fbef5" />
      <path d="M49 12V0" stroke="#2f684e" strokeWidth="2" />
      <path d="M49 0l16 5-16 5z" fill="#ff9a58" />
      <rect x="136" y="42" width="30" height="100" fill="#ffe6a8" />
      <path d="M130 44 151 4l21 40z" fill="#ff9a58" />
      <path d="M88 142v-24a12 12 0 0 1 24 0v24z" fill="#a35d3a" />
      <path d="M44 84v-8a5 5 0 0 1 10 0v8zM146 74v-8a5 5 0 0 1 10 0v8zM146 104v-8a5 5 0 0 1 10 0v8z" fill="#2f684e" />
      <circle cx="100" cy="98" r="6" fill="#fff9e9" stroke="#2f684e" strokeWidth="2" />
      {/* books */}
      {books.map((b) => (
        <g key={b.y}>
          <rect x={b.x} y={b.y} width={b.w} height="26" rx="5" fill={b.fill} />
          <rect x={b.x + b.w - 18} y={b.y + 5} width="13" height="16" rx="2" fill="#fff9e9" />
          <rect x={b.x + 12} y={b.y} width="7" height="26" fill="#fff" opacity=".45" />
        </g>
      ))}
    </svg>
  )
}

// Yellow pencil, tip pointing down-left
export function Pencil({ className }: Props) {
  return (
    <svg viewBox="0 0 40 140" aria-hidden className={cn(deco, className)}>
      <rect x="8" y="10" width="24" height="96" fill="#ffd25e" />
      <rect x="8" y="10" width="8" height="96" fill="#ffe6a8" />
      <rect x="8" y="0" width="24" height="12" rx="4" fill="#ffb6c1" />
      <rect x="8" y="10" width="24" height="6" fill="#c9ced6" />
      <path d="M8 106h24l-12 30z" fill="#f4d3a6" />
      <path d="M16 125h8l-4 11z" fill="#2f684e" />
    </svg>
  )
}

// Round green bush with a few flowers
export function Bush({ className }: Props) {
  return (
    <svg viewBox="0 0 120 60" aria-hidden className={cn(deco, className)}>
      <path fill="#5fb35f" d="M6 60c-6-14 4-28 18-26 2-16 20-24 34-14 10-14 34-10 38 8 14-2 26 12 20 32z" />
      <path fill="#7cc46b" d="M18 60c-2-10 6-18 16-15 4-10 18-12 24-3 8-8 24-4 26 8 10 0 16 6 14 10z" />
      <circle cx="34" cy="36" r="4" fill="#fff" /><circle cx="34" cy="36" r="1.6" fill="#ffd25e" />
      <circle cx="74" cy="28" r="4" fill="#ffb6c1" /><circle cx="74" cy="28" r="1.6" fill="#fff" />
      <circle cx="94" cy="42" r="4" fill="#fff" /><circle cx="94" cy="42" r="1.6" fill="#ffd25e" />
    </svg>
  )
}

// Lollipop tree
export function Tree({ className }: Props) {
  return (
    <svg viewBox="0 0 60 100" aria-hidden className={cn(deco, className)}>
      <rect x="26" y="50" width="8" height="50" rx="3" fill="#a35d3a" />
      <circle cx="30" cy="34" r="26" fill="#6fbf73" />
      <circle cx="20" cy="26" r="9" fill="#8fd67f" />
      <circle cx="40" cy="40" r="3" fill="#ff9a58" /><circle cx="22" cy="44" r="3" fill="#ff9a58" />
    </svg>
  )
}

// Balloon on a wavy string; the color comes from className (text-*)
export function Balloon({ className }: Props) {
  return (
    <svg viewBox="0 0 40 90" aria-hidden className={cn(deco, className)}>
      <path fill="currentColor" d="M20 2C9 2 2 11 2 22c0 13 10 24 18 26 8-2 18-13 18-26C38 11 31 2 20 2z" />
      <path fill="currentColor" d="M16 48h8l-4 6z" />
      <ellipse cx="13" cy="16" rx="4" ry="7" fill="#fff" opacity=".5" />
      <path d="M20 54c-6 8 6 14 0 22s4 10 0 14" fill="none" stroke="#2f684e" strokeWidth="1.5" />
    </svg>
  )
}

// Little butterfly
export function Butterfly({ className }: Props) {
  return (
    <svg viewBox="0 0 50 40" aria-hidden className={cn(deco, className)}>
      <path fill="#ffb6c1" d="M24 20C16 2 2 2 3 12s9 10 21 8z" />
      <path fill="#a7d8ff" d="M26 20C34 2 48 2 47 12s-9 10-21 8z" />
      <path fill="#ffd68b" d="M24 21c-10 2-16 8-12 14s10-4 12-14zM26 21c10 2 16 8 12 14s-10-4-12-14z" />
      <path d="M25 12v18M25 12l-4-8M25 12l4-8" stroke="#2f684e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Striped hot air balloon
export function HotAirBalloon({ className }: Props) {
  return (
    <svg viewBox="0 0 80 110" aria-hidden className={cn(deco, className)}>
      <path fill="#ff9a58" d="M40 4C18 4 4 20 4 38c0 18 18 32 26 42h20c8-10 26-24 26-42C76 20 62 4 40 4z" />
      <path fill="#ffd25e" d="M40 4c-10 0-16 16-16 34s8 32 10 42h12c2-10 10-24 10-42S50 4 40 4z" />
      <path fill="#ffb6c1" d="M40 4c-4 0-6 16-6 34s3 32 4 42h4c1-10 4-24 4-42S44 4 40 4z" />
      <path d="M30 80l4 14M50 80l-4 14" stroke="#a35d3a" strokeWidth="2" />
      <rect x="32" y="94" width="16" height="12" rx="2" fill="#a35d3a" />
    </svg>
  )
}

// Painting easel with a little landscape on the canvas
export function Easel({ className }: Props) {
  return (
    <svg viewBox="0 0 100 130" aria-hidden className={cn(deco, className)}>
      <path d="M50 8 20 128M50 8l30 120M50 60v68" stroke="#a35d3a" strokeWidth="5" strokeLinecap="round" />
      <rect x="14" y="20" width="72" height="58" rx="4" fill="#fff" stroke="#a35d3a" strokeWidth="4" />
      <circle cx="68" cy="36" r="7" fill="#ffd25e" />
      <path d="M16 66c14-12 28-12 40-5s20 1 28-3v18H16z" fill="#7cc46b" />
      <path d="M28 64V52l8-7 8 7v12z" fill="#ff9a58" />
      <rect x="33" y="56" width="6" height="8" fill="#a35d3a" />
      <rect x="10" y="78" width="80" height="6" rx="3" fill="#a35d3a" />
      <circle cx="26" cy="81" r="3" fill="#7fbef5" /><circle cx="36" cy="81" r="3" fill="#ffb6c1" />
    </svg>
  )
}

// Diamond kite with a bow tail
export function Kite({ className }: Props) {
  return (
    <svg viewBox="0 0 60 120" aria-hidden className={cn(deco, className)}>
      <path d="M30 2 54 30 30 62 6 30z" fill="#a7d8ff" />
      <path d="M30 2 54 30H30zM6 30h24v32z" fill="#ffb6c1" />
      <path d="M30 2v60M6 30h48" stroke="#fff" strokeWidth="2" />
      <path d="M30 62c-8 12 8 20 0 32s6 16 0 24" fill="none" stroke="#2f684e" strokeWidth="1.5" />
      <path d="M23 78l7 4-7 4zM37 78l-7 4 7 4z" fill="#ff9a58" />
      <path d="M23 100l7 4-7 4zM37 100l-7 4 7 4z" fill="#ffd25e" />
    </svg>
  )
}
