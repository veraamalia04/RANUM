import { useRef, useState } from 'react'
import { cn } from '../lib/utils'

// A mascot (landing page, Beranda) that hops on its own and jumps with a speech bubble when clicked.
// Position and size it with className (on the button); `delay` staggers the idle hops.
export default function Mascot({ src, say, className, delay = 0 }: { src: string; say: string; className?: string; delay?: number }) {
  const [jumps, setJumps] = useState(0)
  const timer = useRef<number>(undefined)

  function jump() {
    setJumps((n) => n + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJumps(0), 1600)
  }

  return (
    <button type="button" onClick={jump} aria-label={`Maskot RANUM: ${say}`}
      className={cn('absolute bottom-0 cursor-pointer rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none', className)}>
      {jumps > 0 && (
        <span role="status" className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-2xl bg-card px-3 py-1 font-hand text-xl font-bold whitespace-nowrap shadow-md">
          {say}
        </span>
      )}
      {/* key restarts the jump animation on every click */}
      <img key={jumps} src={src} alt="" draggable={false} style={{ animationDelay: jumps ? undefined : `${delay}s` }}
        className={cn('w-full origin-bottom select-none', jumps ? 'motion-safe:animate-jump' : 'motion-safe:animate-hop')} />
    </button>
  )
}
