import { useState, type ReactNode } from 'react'
import { ArrowRight, Lightbulb, MessageCircle, PartyPopper, Shuffle, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import CategoryChips from '../components/CategoryChips'
import { Bush, Cloud, DoodleArrow, Flower, Hills, Leaf, Rainbow, SectionTitle, Sparkle, Star, SunFace } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import ErrorText from '../components/ErrorText'
import Loader from '../components/Loader'
import Mascot from '../components/Mascot'
import Sprinkles from '../components/Sprinkles'
import { buttonVariants } from '../components/ui/button'
import { postImageSrc, type FriendSearchResult, type PortfolioItem, type Post, type User } from '../lib/api'
import { categoryQuery, type Category } from '../lib/categories'
import type { ChallengeSummary } from '../lib/challenge'
import { useFetch } from '../lib/hooks'
import { MAIN_MASCOT, MASCOTS, randomMascots } from '../lib/mascots'
import { randomTrivia } from '../lib/trivia'
import ChallengeCarousel from './home/ChallengeCarousel'
import PortfolioGrid from './portfolio/PortfolioGrid'
import PortfolioUpload from './portfolio/PortfolioUpload'

// Cream card each section sits in, on top of the app's Backdrop scenery
const card = 'relative rounded-[2rem] bg-background/95 p-5 shadow-sm sm:p-6'

// Beranda for a Siswa, following dashboard-sudah-login.jpeg: hero, new challenges + trivia, explore, portfolio, classmates
export default function HomePage({ me }: { me: User }) {
  // Set by "Temukan Bakatmu"; filters the challenge carousel and "Karya Teman" (any of the picked categories)
  const [categories, setCategories] = useState<Category[]>([])

  return (
    <div className="grid gap-6">
      <Hero name={me.username} />
      <section aria-labelledby="tantangan" className={`${card} grid gap-4`}>
        <Sprinkles items={[['star', 'top-5 left-[40%] size-5'], ['pinkflower', 'top-4 right-[30%] size-6'], ['sparkle', 'bottom-3 left-6 size-5']]} />
        <div className="flex flex-wrap items-end justify-between gap-2">
          <SectionTitle id="tantangan">Tantangan Seru Untukmu</SectionTitle>
          <a href="#/challenges" className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
            Lihat tantanganku <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
          <Challenges categories={categories} onClear={() => setCategories([])} />
          <Trivia />
        </div>
      </section>
      <section aria-labelledby="jelajah" className={`${card} grid gap-4`}>
        <Sprinkles items={[['flower', 'top-5 left-[30%] size-6'], ['heart', 'top-6 right-[12%] size-5'], ['bluestar', 'top-4 left-[55%] size-5']]} />
        <SectionTitle id="jelajah">Yuk, Jelajah!</SectionTitle>
        <div className="grid gap-5 md:grid-cols-2">
          <FindTalent categories={categories} onChange={setCategories} />
          <FriendsKarya categories={categories} />
        </div>
      </section>
      <MyPortfolio me={me} />
      <Classmates />
    </div>
  )
}

// Greeting on a sunny scene (rainbow, clouds, hills) with three hopping mascots: the RANUM sun in front,
// two random friends beside it (a new pair on every visit). Clicking a mascot makes it jump and say hi.
// `children` replaces the Siswa greeting lines (the staff Beranda puts its own text and buttons there).
export function Hero({ name, children }: { name: string; children?: ReactNode }) {
  const [friends] = useState(() => randomMascots(MASCOTS.length).filter((m) => m !== MAIN_MASCOT).slice(0, 2))
  return (
    <section className="relative isolate -mt-2 grid items-end gap-4 overflow-hidden rounded-[2rem] bg-linear-to-br from-sun/60 via-background to-sky/60 px-6 pt-8 shadow-sm sm:grid-cols-[1fr_24rem] sm:px-10">
      <Rainbow className="absolute right-[3%] bottom-4 -z-10 hidden w-96 opacity-80 sm:block" />
      <Cloud className="absolute top-3 right-[34%] -z-10 hidden w-24 md:block" />
      <Cloud className="absolute top-6 -right-4 -z-10 w-28" />
      <SunFace className="absolute top-2 left-[44%] -z-10 hidden w-16 md:block motion-safe:animate-float" />
      <Hills className="absolute inset-x-0 bottom-0 -z-10 h-12 w-full" />
      <Bush className="absolute bottom-0 left-[36%] -z-10 hidden w-28 md:block" />
      <Bush className="absolute bottom-0 -left-4 -z-10 w-24" />
      <Flower className="absolute bottom-10 left-6 size-8 text-blush" />
      <Leaf className="absolute top-4 left-4 size-6 -rotate-45 text-primary/60" />
      <Sprinkles items={[
        ['star', 'top-5 left-[38%] size-5'], ['heart', 'top-8 left-[56%] size-5'], ['pinkflower', 'bottom-14 left-[30%] size-6'],
        ['bluestar', 'top-[45%] left-[48%] size-5'], ['sparkle', 'bottom-16 left-[52%] size-5'], ['note', 'top-4 right-[10%] size-5'],
      ]} />
      <div className="grid gap-2 self-center pb-6 sm:pb-12">
        <h1 className="text-4xl leading-tight font-extrabold break-words drop-shadow-[0_3px_0_white] sm:text-5xl">Hai, {name}! <Sparkle className="inline size-8 text-peach" /></h1>
        {children ?? (
          <>
            <p className="-rotate-1 font-heading text-xl font-bold sm:text-2xl">Siap menemukan hal seru hari ini?</p>
            <p className="font-hand text-xl font-bold text-primary/80">Setiap langkah kecil adalah awal yang hebat.</p>
          </>
        )}
      </div>
      <div className="relative mx-auto h-48 w-full max-w-sm sm:h-60">
        <DoodleArrow className="absolute -top-1 left-2 hidden -rotate-12 text-primary/50 sm:block" />
        <Mascot src={friends[0]} say="Ayo main!" className="left-0 w-[28%]" delay={0.4} />
        <Mascot src={MAIN_MASCOT} say={`Halo, ${name}!`} className="left-1/2 w-[50%] -translate-x-1/2" />
        <Mascot src={friends[1]} say="Semangat!" className="right-0 w-[26%]" delay={0.9} />
      </div>
    </section>
  )
}

function Challenges({ categories, onClear }: { categories: Category[]; onClear: () => void }) {
  const { data, error } = useFetch<ChallengeSummary[]>(categories.length ? `/challenges?${categoryQuery(categories)}` : '/challenges')
  const fresh = data?.filter((c) => !c.accepted && c.mySubmissionId === null)

  return (
    <div className="grid content-start gap-3">
      {categories.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          Kategori: <b>{categories.join(', ')}</b>
          <button type="button" onClick={onClear} className="rounded-full underline underline-offset-4">Tampilkan semua</button>
        </p>
      )}
      <ErrorText error={error} />
      {!fresh ? <Loader /> : fresh.length === 0 ? (
        <EmptyState icon={PartyPopper}>
          {categories.length ? 'Belum ada tantangan baru untuk kategori ini.' : 'Semua tantangan sudah kamu ambil. Hebat!'}
        </EmptyState>
      ) : <ChallengeCarousel challenges={fresh} />}
    </div>
  )
}

function Trivia() {
  const [trivia, setTrivia] = useState(() => randomTrivia())
  return (
    <aside aria-labelledby="trivia" className="relative overflow-hidden rounded-3xl border bg-sky/40 p-5">
      <Star className="absolute top-3 right-3 size-5 fill-sun text-sun" />
      <Flower className="absolute -right-3 -bottom-3 size-20 text-sky" />
      <h2 id="trivia" className="flex items-center gap-2 text-lg font-bold"><Lightbulb size={20} className="text-peach" aria-hidden /> Trivia Hari Ini</h2>
      <p className="mt-2 inline-block rounded-full bg-card/70 px-2.5 py-0.5 text-xs font-semibold">{trivia.topic}</p>
      <p className="mt-2 font-heading text-2xl leading-tight font-extrabold" aria-live="polite">Tahu nggak? {trivia.title}</p>
      <p className="relative mt-2 text-sm">{trivia.body}</p>
      <button type="button" onClick={() => setTrivia(randomTrivia(trivia))}
        className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-sm font-semibold hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <Shuffle size={14} aria-hidden /> Fakta lain
      </button>
    </aside>
  )
}

function FindTalent({ categories, onChange }: { categories: Category[]; onChange: (c: Category[]) => void }) {
  return (
    <div className="relative grid content-start gap-3 rounded-3xl border bg-sun/25 p-5">
      <Leaf className="absolute top-4 right-4 size-6 text-primary/50" />
      <div>
        <h3 className="text-xl font-bold">Temukan Bakatmu</h3>
        <p className="text-sm text-muted-foreground">Pilih bidang yang kamu suka (boleh lebih dari satu), lalu lihat tantangan dan karyanya!</p>
      </div>
      <CategoryChips big label="Pilih bakatmu" value={categories} onChange={onChange} />
      {categories.length > 0 && (
        <a href={`#/jelajah?kategori=${categories.join(',')}`} className="inline-flex items-center gap-1 justify-self-start text-sm font-semibold underline-offset-4 hover:underline">
          Lihat karya kategori ini di Jelajah <ArrowRight size={16} aria-hidden />
        </a>
      )}
    </div>
  )
}

// Newest photos from the Jelajah feed (classmates, friends, teachers). No "Beri semangat" like button: comments only.
function FriendsKarya({ categories }: { categories: Category[] }) {
  const { data } = useFetch<Post[]>(categories.length ? `/posts?${categoryQuery(categories)}` : '/posts')
  const photos = data?.filter((p) => p.hasImage).slice(0, 4)

  return (
    <div className="relative grid content-start gap-3 rounded-3xl border bg-mint/60 p-5">
      <Flower className="absolute top-4 right-4 size-6 text-sun" />
      <div>
        <h3 className="text-xl font-bold">Karya Teman</h3>
        <p className="text-sm text-muted-foreground">Lihat ide seru dari teman sekelas</p>
      </div>
      {!photos ? <Loader /> : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{categories.length ? 'Belum ada foto karya di kategori ini.' : 'Belum ada foto karya. Jadilah yang pertama!'}</p>
      ) : (
        <ul className="grid grid-cols-4 gap-2">
          {photos.map((p) => (
            <li key={p.id}>
              <a href={categories.length ? `#/jelajah?kategori=${categories.join(',')}` : '#/jelajah'} aria-label={`Karya ${p.author.username}`} className="block overflow-hidden rounded-xl">
                <img src={postImageSrc(p.id)} alt="" loading="lazy" className="aspect-square w-full object-cover transition motion-safe:hover:scale-105" />
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border bg-card px-3 py-1 text-xs font-semibold">Karya teman sekelas</span>
        <a href="#/jelajah" className={buttonVariants({ size: 'sm', variant: 'outline' })}><MessageCircle aria-hidden /> Beri komentar</a>
      </div>
    </div>
  )
}

function MyPortfolio({ me }: { me: User }) {
  const { data, reload } = useFetch<PortfolioItem[]>(`/users/${me.id}/portfolio`)
  return (
    <section aria-labelledby="portofolioku" className={`${card} grid gap-4`}>
      <Sprinkles items={[['note', 'top-5 left-[34%] size-5'], ['star', 'top-6 right-[28%] size-5'], ['pinkflower', 'bottom-3 right-5 size-6']]} />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SectionTitle id="portofolioku">Portofolioku</SectionTitle>
        <a href="#/portfolio" className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
          Semua portofolio <ArrowRight size={16} aria-hidden />
        </a>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <PortfolioUpload onSaved={reload} />
        {data && data.length > 0
          ? <PortfolioGrid items={data.slice(0, 2)} onDeleted={reload} />
          : (
            <p className="relative grid place-items-center rounded-3xl border bg-mint/40 p-5 text-center text-sm">
              <Leaf className="absolute top-3 left-4 size-5 text-primary/50" />
              Kamu yang menentukan karya mana yang ingin disimpan dan ditunjukkan.
            </p>
          )}
      </div>
    </section>
  )
}

// Classmates come from the friend search with an empty query
function Classmates() {
  const { data } = useFetch<FriendSearchResult[]>('/friends/search')
  return (
    <section aria-labelledby="teman-sekelas" className={`${card} grid gap-4`}>
      <Sprinkles items={[['star', 'top-5 right-1/3 size-5'], ['flower', 'bottom-4 right-[40%] size-6'], ['heart', 'top-6 left-[38%] size-5'], ['sparkle', 'bottom-5 right-6 size-5']]} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle id="teman-sekelas">Teman Sekelas</SectionTitle>
        <a href="#/teman" className={buttonVariants({ variant: 'outline' })}>Temukan teman <ArrowRight aria-hidden /></a>
      </div>
      {!data ? <Loader /> : data.length === 0 ? (
        <EmptyState icon={Users}>Belum ada teman sekelas di Ranum.</EmptyState>
      ) : (
        <ul className="flex gap-4 overflow-x-auto pb-1">
          {data.map(({ user }) => (
            <li key={user.id}>
              <a href={`#/users/${user.id}`} className="grid w-20 justify-items-center gap-1.5 rounded-2xl p-1 text-sm font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <Avatar user={user} size={64} />
                <span className="max-w-full truncate">{user.username}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
