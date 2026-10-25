import { ArrowRight, Crown, Heart, Music, Send } from 'lucide-react'
import { Balloon, BookCastle, Bush, Butterfly, Cloud, DoodleArrow, Easel, Flower, Hills, HotAirBalloon, Kite, Pencil, Rainbow, Sparkle, Star, SunFace, Tree } from '../../components/Decorations'
import { buttonVariants } from '../../components/ui/button'
import { MAIN_MASCOT } from '../../lib/mascots'
import Mascot from '../../components/Mascot'
import Sprinkles from '../../components/Sprinkles'

// Sky scene (clouds, sun, rainbow, hills) that slides under the floating nav. Big crowned RANUM title on the left;
// the mascot gang (sun with cap in front, orange friend and broccoli beside it) on the right, standing on the hills
// (they hop, and jump when clicked); a castle on a stack of books bottom left
export default function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate -mt-[4.75rem] flex min-h-svh flex-col overflow-hidden bg-linear-to-b from-sky via-[#cdeaff] to-[#eef8ff] px-4 pt-28 sm:pt-32">
      <Cloud className="absolute top-24 -left-8 -z-10 w-36 sm:w-48" />
      <Cloud className="absolute top-44 left-[40%] -z-10 hidden w-32 md:block" />
      <Cloud className="absolute top-28 right-[20%] -z-10 hidden w-28 sm:block" />
      <SunFace className="absolute top-20 right-2 -z-10 w-24 sm:right-[5%] sm:w-36 motion-safe:animate-float" />
      <Rainbow className="absolute right-[6%] bottom-20 -z-10 hidden w-[30rem] opacity-80 md:block" />
      <Hills className="absolute inset-x-0 bottom-0 -z-10 h-20 w-full sm:h-32" />
      <Flower className="absolute bottom-6 left-[8%] size-8 text-white" />
      <Flower className="absolute bottom-4 left-[38%] hidden size-7 text-sun md:block" />
      <Flower className="absolute right-[3%] bottom-8 size-8 text-white" />
      <Send className="absolute top-28 left-[47%] hidden size-10 -rotate-12 text-primary md:block" strokeWidth={1.75} aria-hidden />
      <Sparkle className="absolute top-36 left-[56%] size-5 text-peach" />
      <Star className="absolute top-1/2 left-[46%] hidden size-6 fill-sun text-sun md:block" />
      <Star className="absolute top-32 left-3 size-7 fill-[#7fbef5] text-[#4a8fd6]" />
      <Star className="absolute top-24 right-[32%] hidden size-6 fill-sun text-[#e9a800] md:block" />
      <Heart className="absolute top-36 left-[60%] hidden size-7 fill-blush text-[#e8667f] md:block" aria-hidden />
      <Heart className="absolute bottom-40 left-[44%] hidden size-5 fill-blush text-[#e8667f] lg:block" aria-hidden />
      <Music className="absolute top-52 right-[3%] hidden size-7 text-[#7d64d6] md:block" aria-hidden />
      <Tree className="absolute bottom-10 left-[30%] -z-10 hidden w-14 lg:block" />
      <Tree className="absolute right-[1%] bottom-12 -z-10 hidden w-16 md:block" />
      <Bush className="absolute bottom-0 left-[16%] -z-10 hidden w-32 md:block" />
      <Bush className="absolute bottom-0 left-[42%] -z-10 w-24 sm:w-36" />
      <Bush className="absolute right-[18%] bottom-0 -z-10 hidden w-28 md:block" />
      <Balloon className="absolute top-40 left-[44%] hidden w-9 text-blush md:block motion-safe:animate-drift" />
      <Balloon className="absolute top-48 left-[49%] hidden w-7 text-sky md:block motion-safe:animate-drift motion-safe:[animation-delay:-3s]" />
      <Balloon className="absolute top-24 right-2 w-8 text-peach sm:hidden" />
      <Butterfly className="absolute top-[47%] left-[41%] hidden w-10 md:block motion-safe:animate-drift motion-safe:[animation-delay:-2s]" />
      <Butterfly className="absolute right-[24%] bottom-44 hidden w-8 lg:block motion-safe:animate-drift motion-safe:[animation-delay:-5s]" />
      <Sprinkles items={[
        ['sparkle', 'top-20 left-[33%] size-5'], ['bluestar', 'top-60 left-[30%] size-5'], ['pinkflower', 'top-72 left-[42%] size-6'],
        ['note', 'top-28 left-[62%] size-6'], ['star', 'top-[45%] right-[3%] size-5'], ['heart', 'top-20 left-[24%] size-4'],
        ['flower', 'bottom-28 left-[33%] size-6'], ['sparkle', 'top-44 right-[30%] size-5'],
      ]} />
      {/* Middle of the hero, between the title and the mascots */}
      <HotAirBalloon className="absolute top-[34%] left-[38%] hidden w-16 lg:block motion-safe:animate-drift" />
      <Kite className="absolute top-[46%] left-[49%] hidden w-12 rotate-12 lg:block motion-safe:animate-drift motion-safe:[animation-delay:-3.5s]" />
      <p className="absolute top-[60%] left-[32%] hidden -rotate-6 font-hand text-2xl leading-tight font-bold lg:block xl:text-3xl">
        Big dreams start<br />with curiosity!
      </p>
      <DoodleArrow className="absolute top-[64%] left-[44%] hidden w-12 rotate-[15deg] text-primary lg:block" />
      <Easel className="absolute bottom-6 left-[36%] hidden w-28 lg:block xl:w-36" />
      {/* Phones: fill the gap between the title and the mascots */}
      <HotAirBalloon className="absolute top-[50%] left-[10%] w-14 md:hidden motion-safe:animate-drift" />
      <Kite className="absolute top-[52%] right-[12%] w-10 rotate-12 md:hidden motion-safe:animate-drift motion-safe:[animation-delay:-3.5s]" />
      <Butterfly className="absolute top-[60%] left-[44%] w-9 md:hidden motion-safe:animate-drift motion-safe:[animation-delay:-2s]" />
      <BookCastle className="absolute bottom-4 left-[1%] hidden w-60 lg:block xl:w-72" />
      <Pencil className="absolute bottom-3 left-[17%] hidden w-9 rotate-[25deg] lg:block xl:left-[20%]" />
      <Flower className="absolute bottom-10 left-[24%] hidden size-7 text-blush md:block" />
      <Flower className="absolute right-[12%] bottom-3 hidden size-6 text-sun md:block" />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-end gap-8 md:grid-cols-[1fr_1.1fr]">
        <div className="relative grid self-center justify-items-center gap-3 pb-10 text-center md:justify-items-start md:pb-24 md:text-left lg:pb-72 lg:pl-8 xl:pb-80">
          <h1 id="hero-title" className="relative text-7xl leading-none font-extrabold tracking-wide text-primary drop-shadow-[0_5px_0_white] sm:text-8xl lg:text-9xl">
            <Crown className="absolute -top-7 -left-3 size-12 -rotate-12 fill-sun text-[#e9a800] sm:-top-9 sm:size-16" strokeWidth={1.5} aria-hidden />
            RANUM
          </h1>
          <p className="max-w-sm -rotate-2 font-heading text-xl leading-snug font-bold sm:text-2xl">Ruang Eksplorasi Bakat dan Pengembangan Diri Anak</p>
          <p className="-rotate-2 rounded-lg bg-sun px-4 py-1 font-heading text-2xl font-bold shadow-sm">Grow Into Yourself.</p>
          <a href="#/login" className={buttonVariants({ variant: 'sun', size: 'lg', className: 'mt-3 h-12 px-6 text-base' })}>
            Start Exploring <ArrowRight aria-hidden />
          </a>
        </div>

        <div className="relative mx-auto h-72 w-full max-w-xl sm:h-96">
          <Mascot src="/images/mascots/4.png" say="Ayo baca!" className="left-0 w-[30%]" delay={0.4} />
          <Mascot src={MAIN_MASCOT} say="Halo, teman!" className="left-1/2 w-[55%] -translate-x-1/2" />
          <Mascot src="/images/mascots/3.png" say="Yuk main!" className="right-0 w-[24%]" delay={0.9} />
        </div>
      </div>
    </section>
  )
}
