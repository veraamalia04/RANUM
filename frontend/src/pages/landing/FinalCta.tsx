import { ArrowRight } from 'lucide-react'
import { Balloon, Bush, Butterfly, DoodleArrow, Flower, Hills, Leaf, Rainbow, Sparkle, Tree } from '../../components/Decorations'
import { buttonVariants } from '../../components/ui/button'
import Mascot from '../../components/Mascot'
import Sprinkles from '../../components/Sprinkles'

// Yellow wavy band closing the page: orange mascot on the left, "You can do it!" note on the right
export default function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-sun/45">
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden className="block h-8 w-full text-sun/60 sm:h-12">
        <path fill="currentColor" d="M0 40V22C160 6 320 0 480 12s320 28 480 16 320-28 480-16v28z" />
      </svg>
      <div className="relative bg-sun/60 px-4 pt-6 pb-36 sm:pb-14">
        <Hills className="absolute inset-x-0 bottom-0 -z-10 h-16 w-full sm:h-24" />
        <Rainbow className="absolute right-[3%] bottom-8 -z-10 hidden w-48 lg:block" />
        <Leaf className="absolute right-[18%] bottom-6 hidden size-8 text-mint md:block" />
        <Flower className="absolute top-6 right-[22%] hidden size-14 text-sky md:block" />
        <Sparkle className="absolute top-4 left-[18%] size-6 text-peach" />
        <Bush className="absolute bottom-0 left-[26%] -z-10 hidden w-32 md:block" />
        <Bush className="absolute right-[24%] bottom-0 -z-10 w-24 sm:w-32" />
        <Tree className="absolute right-[38%] bottom-6 -z-10 hidden w-12 lg:block" />
        <Balloon className="absolute top-10 left-[24%] hidden w-8 text-sky md:block motion-safe:animate-drift" />
        <Balloon className="absolute top-14 left-[28%] hidden w-7 text-blush lg:block motion-safe:animate-drift motion-safe:[animation-delay:-2.5s]" />
        <Butterfly className="absolute right-[30%] bottom-24 hidden w-9 md:block motion-safe:animate-drift motion-safe:[animation-delay:-4s]" />
        <Sprinkles items={[
          ['star', 'top-4 left-[10%] size-5'], ['heart', 'top-20 right-[34%] size-5'], ['note', 'bottom-16 left-[20%] size-6'],
          ['bluestar', 'top-8 right-[6%] size-5'], ['pinkflower', 'bottom-20 left-[40%] size-5'],
        ]} />
        <Mascot src="/images/mascots/4.png" say="Kamu pasti bisa!" className="left-2 w-28 sm:left-[6%] sm:w-48" />
        <div className="mx-auto grid max-w-xl justify-items-center gap-4 text-center">
          <h2 id="cta-title" className="text-3xl font-extrabold sm:text-4xl">Ready to Grow Into Yourself?</h2>
          <p>Your talents don't have to look like anyone else's.</p>
          <a href="#/login" className={buttonVariants({ size: 'lg', className: 'h-12 px-6 text-base' })}>
            Start Exploring <ArrowRight aria-hidden />
          </a>
        </div>
        <p className="absolute top-6 right-4 hidden rotate-[-12deg] font-hand text-2xl font-bold sm:block md:right-[10%]">You can do it! ♡</p>
        <DoodleArrow className="absolute top-16 right-[16%] hidden w-12 rotate-[130deg] text-primary md:block" />
      </div>
    </section>
  )
}
