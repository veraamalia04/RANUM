import { useState } from 'react'
import { CheckCircle2, Clock, Hourglass, PencilLine, Plus, Rocket, Sparkles, Trash2, Users } from 'lucide-react'
import CategoryChips from '../components/CategoryChips'
import MascotLayout from '../components/MascotLayout'
import { SectionTitle } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import ErrorText from '../components/ErrorText'
import Loader from '../components/Loader'
import ScoreBadge from '../components/ScoreBadge'
import Segmented from '../components/Segmented'
import { Badge } from '../components/ui/badge'
import { Button, buttonVariants } from '../components/ui/button'
import { api, type User } from '../lib/api'
import { CATEGORIES, categoryQuery, type Category } from '../lib/categories'
import { challengeStatus, kelasLabel, posterSrc, QUESTION_TYPES, type ChallengeStatus, type ChallengeSummary } from '../lib/challenge'
import { useAction, useFetch } from '../lib/hooks'
import { navigate } from '../lib/router'
import { cn } from '../lib/utils'

const TABS: { value: ChallengeStatus; label: string; icon: typeof Rocket }[] = [
  { value: 'baru', label: 'Baru', icon: Sparkles },
  { value: 'dikerjakan', label: 'Dikerjakan', icon: PencilLine },
  { value: 'menunggu', label: 'Menunggu nilai', icon: Hourglass },
  { value: 'selesai', label: 'Selesai', icon: CheckCircle2 },
]

// "Tantangan": for a Siswa every challenge (open to all kelas), split into tabs by status; staff manage and grade.
// Centered between the mascots (MascotLayout).
// The category filter lives in the URL (#/challenges?kategori=Seni,Musik).
export default function ChallengesPage({ me, categories }: { me: User; categories: Category[] }) {
  const { data, error: loadError, reload } = useFetch<ChallengeSummary[]>(categories.length ? `/challenges?${categoryQuery(categories)}` : '/challenges')
  const { error, run } = useAction()
  const isSiswa = me.role === 'Siswa'
  const [picked, setTab] = useState<ChallengeStatus>()
  const count = (s: ChallengeStatus) => data?.filter((c) => challengeStatus(c) === s).length ?? 0
  // Until the Siswa picks a tab: continue what they started, else show what's new
  const tab = picked ?? (count('dikerjakan') > 0 ? 'dikerjakan' : 'baru')
  const items = isSiswa ? data?.filter((c) => challengeStatus(c) === tab) : data
  const filter = (next: Category[]) => navigate(next.length ? `/challenges?kategori=${next.join(',')}` : '/challenges')
  const canDelete = (c: ChallengeSummary) => me.role === 'Admin' || c.createdById === me.id

  async function remove(c: ChallengeSummary) {
    if (!confirm(`Hapus challenge "${c.title}"? Semua jawaban siswa juga ikut terhapus.`)) return
    await run(() => api(`/challenges/${c.id}`, 'DELETE'))
    reload()
  }

  return (
    <MascotLayout left="Pilih tantangan yang paling seru buatmu!" right="Selesaikan satu per satu, kamu pasti bisa!">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <SectionTitle as="h1">Tantangan</SectionTitle>
            <p className="text-sm text-muted-foreground">{isSiswa ? 'Pilih tantangan baru, lanjutkan yang sedang dikerjakan, dan lihat nilaimu.' : 'Kelola tantangan dan nilai jawaban siswa.'}</p>
          </div>
          {!isSiswa && <a href="#/challenges/new" className={buttonVariants({ size: 'lg' })}><Plus aria-hidden /> Buat tantangan</a>}
        </div>
        <CategoryChips label="Filter kategori tantangan" value={categories} onChange={filter} allLabel="Semua" />
        {isSiswa && (
          <Segmented label="Status tantangan" value={tab} onChange={setTab}
            options={TABS.map((t) => ({ ...t, label: count(t.value) ? `${t.label} (${count(t.value)})` : t.label }))} />
        )}
        <ErrorText error={loadError || error} />

        {!items ? <Loader /> : items.length === 0 ? (
          <EmptyState icon={Rocket}>
            {!isSiswa ? 'Belum ada tantangan. Yuk buat yang pertama!'
              : tab === 'baru' ? 'Tidak ada tantangan baru. Hebat, semua sudah kamu ambil!'
              : tab === 'dikerjakan' ? 'Tidak ada tantangan yang sedang dikerjakan. Pilih di tab Baru!'
              : tab === 'menunggu' ? 'Tidak ada jawaban yang menunggu nilai.'
              : 'Belum ada tantangan yang selesai dinilai.'}
          </EmptyState>
        ) : (
          <ul className="grid gap-4">
            {items.map((c) => (
              <li key={c.id} className={cn('relative overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-md motion-safe:hover:-translate-y-0.5',
                c.categories.length ? CATEGORIES[c.categories[0]].bg : 'bg-card')}>
                <a href={`#/challenges/${c.id}`} className="flex h-full flex-col gap-3 p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset">
                  {c.hasPoster && <img src={posterSrc(c.id)} alt="" loading="lazy" className="aspect-video w-full rounded-2xl object-cover" />}
                  <div className="flex gap-1.5">
                    {c.types.map((t) => {
                      const meta = QUESTION_TYPES[t]
                      return (
                        <span key={t} className="grid size-7 place-items-center rounded-md" style={{ background: `${meta.color}1f`, color: meta.color }} title={meta.label}>
                          <meta.icon size={15} aria-label={meta.label} />
                        </span>
                      )
                    })}
                  </div>
                  <div className="grid gap-1">
                    <h2 className="text-2xl font-bold">{c.title}</h2>
                    {c.description && <p className="line-clamp-3 text-base text-muted-foreground">{c.description}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.categories.map((x) => <Badge key={x} variant="outline" className="bg-card/70">{CATEGORIES[x].short}</Badge>)}
                    <Badge variant="outline">{kelasLabel(c.kelas)}</Badge>
                    <Badge variant="outline">{c.questionCount} soal</Badge>
                    {!isSiswa && <Badge variant="outline">oleh {c.createdBy}</Badge>}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3">{isSiswa ? <SiswaStatus c={c} /> : <StaffStatus c={c} />}</div>
                </a>
                {!isSiswa && canDelete(c) && (
                  <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3 bg-background/80 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(c)} aria-label={`Hapus ${c.title}`} title="Hapus">
                    <Trash2 />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </MascotLayout>
  )
}

function SiswaStatus({ c }: { c: ChallengeSummary }) {
  const status = challengeStatus(c)
  if (status === 'baru') return <Badge variant="secondary"><Sparkles aria-hidden /> Baru · ketuk untuk mulai</Badge>
  if (status === 'dikerjakan') return c.hasDraft
    ? <Badge><PencilLine aria-hidden /> Draft tersimpan · Lanjutkan</Badge>
    : <Badge><Rocket aria-hidden /> Kerjakan!</Badge>
  if (status === 'menunggu' || c.myScore === null) return <Badge variant="secondary"><Clock aria-hidden /> Menunggu nilai</Badge>
  return <ScoreBadge score={c.myScore} />
}

function StaffStatus({ c }: { c: ChallengeSummary }) {
  return (
    <>
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users size={14} aria-hidden /> {c.submissionCount} mengumpulkan</span>
      {c.pendingCount > 0 && <Badge className="ml-auto">{c.pendingCount} perlu dinilai</Badge>}
    </>
  )
}
