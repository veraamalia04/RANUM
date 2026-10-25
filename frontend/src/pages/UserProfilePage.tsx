import { Palette, UserRoundX } from 'lucide-react'
import Avatar from '../components/Avatar'
import BackLink from '../components/BackLink'
import { Flower, SectionTitle, Star } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import Loader from '../components/Loader'
import RoleChip from '../components/RoleChip'
import type { Friends, FriendState, PortfolioItem, Post, PublicProfile, User } from '../lib/api'
import { useFetch } from '../lib/hooks'
import { findMood } from '../lib/moods'
import PostCard from './jelajah/PostCard'
import PortfolioGrid from './portfolio/PortfolioGrid'
import FriendActions from './teman/FriendActions'

// Someone else's public profile: no birth date or place, plus their portfolio and karya.
// The API answers 404 unless you are friends, classmates, or staff.
export default function UserProfilePage({ id, me }: { id: number; me: User }) {
  const { data: user, error } = useFetch<PublicProfile>(`/users/${id}/profile`)

  if (error) return <EmptyState icon={UserRoundX}>Profil ini tidak bisa dibuka. Kalian harus sekelas atau berteman dulu.</EmptyState>
  if (!user) return <Loader />
  const mood = findMood(user.mood)
  const showFriendship = me.role === 'Siswa' && user.role === 'Siswa' && user.id !== me.id

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <BackLink to="/teman">Teman</BackLink>
      <section className="relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border bg-sun/30 p-6 text-center sm:flex-row sm:text-left">
        <Flower className="absolute -top-2 -right-2 size-16 text-sky/70" />
        <Star className="absolute bottom-3 left-4 size-5 fill-sun text-peach" />
        <Avatar user={user} size={96} />
        <div className="grid justify-items-center gap-2 sm:justify-items-start">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <RoleChip user={user} />
          {mood && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <mood.icon size={16} style={{ color: mood.color }} aria-hidden /> Lagi {mood.label}!
            </span>
          )}
          {user.bio && <p className="max-w-prose">{user.bio}</p>}
          {showFriendship && <Friendship userId={user.id} />}
        </div>
      </section>

      {user.role === 'Siswa' && <Portfolio userId={user.id} />}
      <Karya userId={user.id} />
    </div>
  )
}

// The current friendship state comes from the caller's own friend lists
function Friendship({ userId }: { userId: number }) {
  const { data, reload } = useFetch<Friends>('/friends')
  if (!data) return null
  const has = (list: PublicProfile[]) => list.some((u) => u.id === userId)
  const state: FriendState = has(data.friends) ? 'Friends' : has(data.incoming) ? 'Incoming' : has(data.outgoing) ? 'Outgoing' : 'None'
  return <FriendActions userId={userId} state={state} onChange={reload} />
}

function Portfolio({ userId }: { userId: number }) {
  const { data, reload } = useFetch<PortfolioItem[]>(`/users/${userId}/portfolio`)
  return (
    <section className="grid gap-3" aria-labelledby="portfolio-title">
      <SectionTitle id="portfolio-title">Portofolio</SectionTitle>
      {!data ? <Loader /> : data.length === 0
        ? <p className="text-muted-foreground">Portofolionya masih kosong.</p>
        : <PortfolioGrid items={data} onDeleted={reload} />}
    </section>
  )
}

function Karya({ userId }: { userId: number }) {
  const { data, reload } = useFetch<Post[]>(`/posts?authorId=${userId}`)
  return (
    <section className="grid gap-3" aria-labelledby="karya-title">
      <SectionTitle id="karya-title">Karya</SectionTitle>
      {!data ? <Loader /> : data.length === 0 ? <EmptyState icon={Palette}>Belum ada karya.</EmptyState> : (
        <div className="grid gap-4">
          {data.map((p, i) => <PostCard key={p.id} post={p} index={i} onDeleted={reload} />)}
        </div>
      )}
    </section>
  )
}
