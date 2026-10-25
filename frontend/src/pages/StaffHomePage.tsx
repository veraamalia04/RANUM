import type { ReactNode } from 'react'
import { ArrowRight, ClipboardCheck, Compass, GraduationCap, Hourglass, Inbox, PartyPopper, Plus, Trophy, Users, type LucideIcon } from 'lucide-react'
import { SectionTitle } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import ErrorText from '../components/ErrorText'
import Loader from '../components/Loader'
import Sprinkles, { type Sprinkle } from '../components/Sprinkles'
import { buttonVariants } from '../components/ui/button'
import { postImageSrc, type Post, type User } from '../lib/api'
import { kelasLabel, type ChallengeSummary } from '../lib/challenge'
import { useFetch } from '../lib/hooks'
import { cn } from '../lib/utils'
import { Hero } from './HomePage'

// Cream card each section sits in, like on the Siswa Beranda
const card = 'relative rounded-[2rem] bg-background/95 p-5 shadow-sm sm:p-6'

// Beranda for Guru and Admin: quick actions, numbers, answers waiting for a grade, own challenges, students, new karya.
// Only the creating guru (or an admin) may grade, so a guru's lists hold their own challenges and an admin's hold all.
export default function StaffHomePage({ me }: { me: User }) {
  const isAdmin = me.role === 'Admin'
  const { data: challenges, error } = useFetch<ChallengeSummary[]>('/challenges')
  // Guru gets only Siswa back; Admin gets everyone
  const { data: users } = useFetch<User[]>('/users')

  const mine = challenges?.filter((c) => isAdmin || c.createdById === me.id)
  const toGrade = mine?.filter((c) => c.pendingCount > 0).sort((a, b) => b.pendingCount - a.pendingCount)
  const students = users?.filter((u) => u.role === 'Siswa')
  const sum = (key: 'submissionCount' | 'pendingCount') => mine?.reduce((n, c) => n + c[key], 0)

  return (
    <div className="grid gap-6">
      <Hero name={me.username}>
        <p className="-rotate-1 font-heading text-xl font-bold sm:text-2xl">Siap menyemangati murid-murid hari ini?</p>
        <p className="font-hand text-xl font-bold text-primary/80">Satu tantangan kecil bisa membuka bakat besar.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href="#/challenges/new" className={buttonVariants({ className: 'shadow-sm' })}><Plus aria-hidden /> Buat tantangan</a>
          <a href="#/users" className={buttonVariants({ variant: 'sun', className: 'shadow-sm' })}><Users aria-hidden /> Kelola akun</a>
          <a href="#/jelajah" className={buttonVariants({ variant: 'outline', className: 'bg-card/80 shadow-sm' })}><Compass aria-hidden /> Jelajah</a>
        </div>
      </Hero>

      <ErrorText error={error} />
      <ul aria-label="Ringkasan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Trophy} value={mine?.length} label={isAdmin ? 'tantangan' : 'tantangan buatanku'} className="bg-sun/60" iconClass="fill-sun text-[#e9a800]" />
        <Stat icon={Inbox} value={sum('submissionCount')} label="jawaban masuk" className="bg-sky/50" iconClass="fill-sky text-[#4a8fd6]" />
        <Stat icon={Hourglass} value={sum('pendingCount')} label="menunggu dinilai" className="bg-blush/45" iconClass="fill-blush text-[#e8667f]" />
        <Stat icon={GraduationCap} value={students?.length} label="siswa" className="bg-mint" iconClass="fill-[#7cc46b] text-primary" />
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section id="perlu-dinilai" title="Perlu Dinilai" sprinkles={[['star', 'top-6 right-[30%] size-5'], ['heart', 'bottom-4 right-6 size-5']]}>
          {!toGrade ? <Loader /> : toGrade.length === 0 ? (
            <EmptyState icon={PartyPopper}>Semua jawaban sudah dinilai. Hebat!</EmptyState>
          ) : (
            <ul className="grid gap-2">
              {toGrade.map((c) => (
                <li key={c.id}>
                  <a href={`#/challenges/${c.id}`} className="flex items-center gap-3 rounded-2xl bg-blush/30 p-3 transition hover:bg-blush/50 motion-safe:hover:-translate-y-0.5">
                    <ClipboardCheck size={22} className="shrink-0 text-[#e8667f]" aria-hidden />
                    <span className="mr-auto min-w-0">
                      <span className="block truncate font-bold">{c.title}</span>
                      <span className="text-xs text-muted-foreground">{c.submissionCount} jawaban masuk</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-[#e8667f] shadow-sm">{c.pendingCount} belum dinilai</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section id="tantanganku" title={isAdmin ? 'Tantangan Terbaru' : 'Tantanganku'} link={{ href: '#/challenges', label: 'Semua' }}
          sprinkles={[['note', 'top-6 right-[36%] size-5'], ['pinkflower', 'bottom-4 left-5 size-6']]}>
          {!mine ? <Loader /> : mine.length === 0 ? (
            <EmptyState icon={Trophy}>Belum ada tantangan. <a href="#/challenges/new" className="font-semibold underline underline-offset-4">Buat yang pertama!</a></EmptyState>
          ) : (
            <ul className="grid gap-2">
              {/* The API lists newest first */}
              {mine.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <a href={`#/challenges/${c.id}`} className="flex items-center gap-3 rounded-2xl bg-sun/30 p-3 transition hover:bg-sun/50 motion-safe:hover:-translate-y-0.5">
                    <span className="mr-auto min-w-0">
                      <span className="block truncate font-bold">{c.title}</span>
                      <span className="text-xs text-muted-foreground">{kelasLabel(c.kelas)} · {c.questionCount} soal</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-bold shadow-sm">{c.submissionCount} mengumpulkan</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section id="siswa" title="Siswa per Kelas" link={{ href: '#/users', label: 'Kelola akun' }}
          sprinkles={[['bluestar', 'top-6 right-[38%] size-5'], ['sparkle', 'bottom-4 right-6 size-5']]}>
          {!students ? <Loader /> : students.length === 0 ? (
            <EmptyState icon={Users}>Belum ada akun siswa.</EmptyState>
          ) : <KelasList students={students} />}
        </Section>

        <RecentKarya />
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label, className, iconClass }: { icon: LucideIcon; value?: number; label: string; className: string; iconClass: string }) {
  return (
    <li className={cn('grid justify-items-center gap-1 rounded-3xl p-4 text-center shadow-sm', className)}>
      <span className="grid size-11 place-items-center rounded-full bg-card shadow-sm"><Icon size={22} className={iconClass} aria-hidden /></span>
      <p className="font-heading text-3xl font-extrabold">{value ?? '…'}</p>
      <p className="text-sm font-semibold">{label}</p>
    </li>
  )
}

function Section({ id, title, link, sprinkles, children }: {
  id: string
  title: string
  link?: { href: string; label: string }
  sprinkles: Sprinkle[]
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className={`${card} grid content-start gap-4`}>
      <Sprinkles items={sprinkles} />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SectionTitle id={id}>{title}</SectionTitle>
        {link && (
          <a href={link.href} className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
            {link.label} <ArrowRight size={16} aria-hidden />
          </a>
        )}
      </div>
      {children}
    </section>
  )
}

const KELAS_TINTS = ['bg-sun/50', 'bg-sky/50', 'bg-blush/45', 'bg-mint', 'bg-peach/30']

function KelasList({ students }: { students: User[] }) {
  const counts = new Map<number, number>()
  for (const s of students) if (s.kelas) counts.set(s.kelas, (counts.get(s.kelas) ?? 0) + 1)
  const rows = [...counts].sort(([a], [b]) => a - b)
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {rows.map(([kelas, count], i) => (
        <li key={kelas} className={cn('grid justify-items-center rounded-2xl p-3 text-center', KELAS_TINTS[i % KELAS_TINTS.length])}>
          <span className="text-xs font-bold">Kelas {kelas}</span>
          <span className="font-heading text-2xl font-extrabold">{count}</span>
          <span className="text-xs">siswa</span>
        </li>
      ))}
    </ul>
  )
}

// Newest photo karya from the Jelajah feed, for a quick look (and moderation in Jelajah)
function RecentKarya() {
  const { data } = useFetch<Post[]>('/posts')
  const photos = data?.filter((p) => p.hasImage).slice(0, 6)
  return (
    <Section id="karya-terbaru" title="Karya Terbaru" link={{ href: '#/jelajah', label: 'Buka Jelajah' }}
      sprinkles={[['heart', 'top-6 right-[40%] size-5'], ['flower', 'bottom-4 left-5 size-6']]}>
      {!photos ? <Loader /> : photos.length === 0 ? (
        <EmptyState icon={Compass}>Belum ada foto karya dari siswa.</EmptyState>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <li key={p.id}>
              <a href="#/jelajah" aria-label={`Karya ${p.author.username}`} className="group relative block overflow-hidden rounded-2xl">
                <img src={postImageSrc(p.id)} alt="" loading="lazy" className="aspect-square w-full object-cover transition motion-safe:group-hover:scale-105" />
                <span className="absolute inset-x-1 bottom-1 truncate rounded-full bg-card/90 px-2 py-0.5 text-center text-xs font-bold">{p.author.username}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
