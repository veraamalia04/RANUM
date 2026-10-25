import { useState, type ReactNode } from 'react'
import { ArrowRight, Briefcase, Cake, MapPin, Medal, Palette, PartyPopper, Settings, Sparkles, Trophy, type LucideIcon } from 'lucide-react'
import Avatar from '../components/Avatar'
import { Bush, Cloud, Hills, Rainbow, SectionTitle, SunFace } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import Loader from '../components/Loader'
import Mascot from '../components/Mascot'
import RoleChip from '../components/RoleChip'
import ScoreBadge from '../components/ScoreBadge'
import Sprinkles from '../components/Sprinkles'
import { buttonVariants } from '../components/ui/button'
import type { PortfolioItem, User } from '../lib/api'
import type { Result } from '../lib/challenge'
import { birthdayInfo, formatDate } from '../lib/dates'
import { useFetch } from '../lib/hooks'
import { MAIN_MASCOT, randomMascots } from '../lib/mascots'
import { findMood } from '../lib/moods'
import { cn } from '../lib/utils'
import PortfolioGrid from './portfolio/PortfolioGrid'

// Cream card each section sits in, like on Beranda
const card = 'relative rounded-[2rem] bg-background/95 p-5 shadow-sm sm:p-6'

// Only rendered for complete profiles; App shows ProfileSetupPage otherwise
export default function ProfilePage({ me }: { me: User }) {
  const isSiswa = me.role === 'Siswa'
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Hero me={me} />
      <About me={me} />
      {isSiswa && <MyPortfolio me={me} />}
      {isSiswa && <Achievements />}
    </div>
  )
}

// Sunny banner with a big avatar, mood and bio, and a hopping mascot friend
function Hero({ me }: { me: User }) {
  const mood = findMood(me.mood)
  const [mascot] = useState(() => randomMascots(1)[0] ?? MAIN_MASCOT)
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-sun/60 via-background to-sky/60 px-6 pt-8 pb-14 shadow-sm sm:px-8">
      <Rainbow className="absolute -right-10 bottom-2 -z-10 hidden w-72 opacity-70 sm:block" />
      <Cloud className="absolute top-4 right-[44%] -z-10 hidden w-24 sm:block" />
      <SunFace className="absolute top-3 right-[30%] -z-10 hidden w-14 sm:block motion-safe:animate-float" />
      <Hills className="absolute inset-x-0 bottom-0 -z-10 h-12 w-full" />
      <Bush className="absolute bottom-0 left-[30%] -z-10 hidden w-24 sm:block" />
      <Sprinkles items={[
        ['star', 'top-5 left-[42%] size-5'], ['heart', 'bottom-16 left-[48%] size-5'], ['note', 'top-6 left-4 size-5'],
        ['pinkflower', 'bottom-14 left-5 size-6'], ['bluestar', 'top-[40%] right-[34%] size-5'],
      ]} />
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
        <div className="rounded-full bg-card p-1.5 shadow-md ring-4 ring-sun motion-safe:animate-float">
          <Avatar user={me} size={120} />
        </div>
        <div className="grid justify-items-center gap-2 sm:justify-items-start">
          <h1 className="text-4xl font-extrabold break-words drop-shadow-[0_3px_0_white] sm:text-5xl">{me.username}</h1>
          <div className="flex flex-wrap justify-center gap-1.5"><RoleChip user={me} /></div>
          {mood && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-sm font-bold shadow-sm">
              <mood.icon size={18} style={{ color: mood.color }} aria-hidden /> Lagi {mood.label}!
            </span>
          )}
          {me.bio && <p className="max-w-sm -rotate-1 font-hand text-2xl leading-tight font-bold text-primary/90">“{me.bio}”</p>}
        </div>
        <div className="relative hidden h-32 w-24 shrink-0 sm:ml-auto sm:block">
          <Mascot src={mascot} say={`Hai, ${me.username}!`} className="right-0 w-full" />
        </div>
      </div>
      <a href="#/settings" className={buttonVariants({ variant: 'sun', size: 'sm', className: 'absolute top-4 right-4 shadow-sm' })}>
        <Settings aria-hidden /> Pengaturan
      </a>
    </section>
  )
}

// Bio, birthplace and birthday as three colorful tiles
function About({ me }: { me: User }) {
  const birthDate = me.birthDate!
  const { age, daysLeft } = birthdayInfo(birthDate)
  return (
    <section aria-labelledby="tentang" className={`${card} grid gap-4`}>
      <Sprinkles items={[['star', 'top-6 right-[30%] size-5'], ['flower', 'top-5 right-6 size-6']]} />
      <SectionTitle id="tentang">Tentang Aku</SectionTitle>
      <dl className="grid gap-3 sm:grid-cols-3">
        <Tile icon={Palette} label="Bakat & hobi" className="bg-sun/40" iconClass="fill-sun text-peach">{me.bio}</Tile>
        <Tile icon={MapPin} label="Tempat lahir" className="bg-sky/40" iconClass="fill-sky text-[#4a8fd6]">{me.birthPlace}</Tile>
        <Tile icon={Cake} label="Tanggal lahir" className="bg-blush/35" iconClass="fill-blush text-[#e8667f]">
          {formatDate(birthDate)}
          <span className="block text-sm font-semibold text-muted-foreground">{age} tahun</span>
        </Tile>
      </dl>
      <p className="flex items-center justify-center gap-2 rounded-full bg-mint px-4 py-2 text-center font-heading font-bold">
        {daysLeft === 0
          ? <><PartyPopper size={18} className="text-peach" aria-hidden /> Selamat ulang tahun ke-{age}! 🎉</>
          : <><Cake size={18} className="text-peach" aria-hidden /> {daysLeft} hari lagi ulang tahun!</>}
      </p>
    </section>
  )
}

function Tile({ icon: Icon, label, className, iconClass, children }: { icon: LucideIcon; label: string; className: string; iconClass: string; children: ReactNode }) {
  return (
    <div className={cn('grid content-start gap-2 rounded-3xl p-4', className)}>
      <dt className="flex items-center gap-2 text-sm font-bold">
        <span className="grid size-9 place-items-center rounded-full bg-card shadow-sm"><Icon size={18} className={iconClass} aria-hidden /></span>
        {label}
      </dt>
      <dd className="font-heading text-lg leading-snug font-bold break-words">{children}</dd>
    </div>
  )
}

function MyPortfolio({ me }: { me: User }) {
  const { data, reload } = useFetch<PortfolioItem[]>(`/users/${me.id}/portfolio`)
  return (
    <section aria-labelledby="portofolio" className={`${card} grid gap-4`}>
      <Sprinkles items={[['heart', 'top-6 left-[45%] size-5'], ['sparkle', 'bottom-4 right-6 size-5']]} />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SectionTitle id="portofolio">Portofolioku</SectionTitle>
        <a href="#/portfolio" className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
          Kelola portofolio <ArrowRight size={16} aria-hidden />
        </a>
      </div>
      {!data ? <Loader /> : data.length === 0 ? (
        <EmptyState icon={Briefcase}>
          Portofoliomu masih kosong. <a href="#/portfolio" className="font-semibold underline underline-offset-4">Unggah karya pertamamu!</a>
        </EmptyState>
      ) : <PortfolioGrid items={data} onDeleted={reload} />}
    </section>
  )
}

// Graded challenges, newest first
function Achievements() {
  const { data: results } = useFetch<Result[]>('/challenges/my-results')
  if (!results) return null

  const scores = results.map((r) => r.score)
  const average = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1))

  return (
    <section aria-labelledby="prestasi" className={`${card} grid gap-4`}>
      <Sprinkles items={[['star', 'top-6 left-[48%] size-5'], ['bluestar', 'top-5 right-8 size-5']]} />
      <SectionTitle id="prestasi">Prestasi Tantangan</SectionTitle>
      {results.length === 0 ? (
        <EmptyState icon={Trophy}>
          Belum ada tantangan yang dinilai. Yuk kerjakan di menu <a href="#/challenges" className="font-semibold underline underline-offset-4">Tantangan</a>!
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={Trophy} value={results.length} label="tantangan selesai" className="bg-sun/45" iconClass="fill-sun text-[#e9a800]" />
            <Stat icon={Sparkles} value={average} label="rata-rata nilai" className="bg-sky/40" iconClass="fill-sky text-[#4a8fd6]" />
            <Stat icon={Medal} value={Math.max(...scores)} label="nilai tertinggi" className="bg-blush/35" iconClass="fill-blush text-[#e8667f]" />
          </div>
          <ul className="grid gap-2">
            {results.map((r) => (
              <li key={r.challengeId}>
                <a href={`#/challenges/${r.challengeId}`} className="flex items-center gap-3 rounded-2xl bg-mint/60 p-3 transition hover:bg-mint motion-safe:hover:-translate-y-0.5">
                  <div className="mr-auto">
                    <p className="font-bold">{r.title}</p>
                    {r.feedback && <p className="font-hand text-lg leading-tight text-primary/80">“{r.feedback}”</p>}
                  </div>
                  <ScoreBadge score={r.score} />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function Stat({ icon: Icon, value, label, className, iconClass }: { icon: LucideIcon; value: number; label: string; className: string; iconClass: string }) {
  return (
    <div className={cn('grid justify-items-center gap-1 rounded-3xl p-3 text-center', className)}>
      <Icon size={26} className={iconClass} aria-hidden />
      <p className="font-heading text-3xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  )
}
