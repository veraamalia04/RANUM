import { Bush, Butterfly, Cloud, Flower, Hills, Rainbow, SunFace, Tree } from './Decorations'
import Sprinkles from './Sprinkles'
import { cn } from '../lib/utils'

// The app's sky behind every signed-in page and the login page, like dashboard-sudah-login.jpeg: clouds, sun, flowers
// and sprinkles at the sides. Fixed to the screen, so it stays put while the page scrolls over it.
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-sky/70 via-background to-sun/40">
      <Cloud className="absolute top-20 -left-6 w-44" />
      <Cloud className="absolute top-36 -right-8 w-48" />
      <Cloud className="absolute top-[52%] -left-12 hidden w-40 lg:block" />
      <Cloud className="absolute top-[44%] -right-10 hidden w-36 lg:block" />
      <SunFace className="absolute top-[24%] right-6 hidden w-20 xl:block motion-safe:animate-float" />
      <Butterfly className="absolute top-[34%] left-6 hidden w-10 xl:block motion-safe:animate-drift" />
      <Butterfly className="absolute right-10 bottom-[30%] hidden w-9 xl:block motion-safe:animate-drift motion-safe:[animation-delay:-3s]" />
      <Flower className="absolute top-[30%] left-10 hidden size-10 text-sky lg:block" />
      <Flower className="absolute top-[66%] right-8 hidden size-10 text-blush lg:block" />
      <Flower className="absolute top-[72%] left-8 hidden size-8 text-peach lg:block" />
      <Sprinkles items={[
        ['star', 'top-[18%] left-[4%] size-6'], ['heart', 'top-[42%] left-[3%] size-6'], ['pinkflower', 'top-[62%] left-[5%] size-7'],
        ['bluestar', 'top-[82%] left-[4%] size-6'], ['sparkle', 'top-[16%] right-[4%] size-6'], ['note', 'top-[56%] right-[4%] size-6'],
        ['star', 'top-[76%] right-[5%] size-7'], ['flower', 'top-[36%] right-[3%] size-7'],
      ]} />
    </div>
  )
}

// Hills, bushes, trees and a rainbow, standing on the bottom edge of whatever positions it (pass the position in
// className). Not fixed like Backdrop: fixed ground would show through the see-through tinted cards scrolling over it.
export function Ground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none -z-10 h-32 overflow-x-clip', className)}>
      <Rainbow className="absolute -bottom-4 -left-20 w-80 opacity-80" />
      <Tree className="absolute right-6 bottom-8 hidden w-16 lg:block" />
      <Tree className="absolute bottom-10 left-[8%] hidden w-12 xl:block" />
      <Bush className="absolute bottom-4 left-[14%] hidden w-36 lg:block" />
      <Bush className="absolute right-[12%] bottom-4 hidden w-40 lg:block" />
      <Hills className="absolute inset-x-0 bottom-0 h-20 w-full" />
    </div>
  )
}
