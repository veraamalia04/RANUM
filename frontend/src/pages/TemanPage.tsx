import { useState, type FormEvent, type ReactNode } from 'react'
import { HeartHandshake, Inbox, Search, UserRoundSearch, Users } from 'lucide-react'
import Avatar from '../components/Avatar'
import { Flower, SectionTitle, Star } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import ErrorText from '../components/ErrorText'
import Loader from '../components/Loader'
import Segmented from '../components/Segmented'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import type { FriendSearchResult, Friends, FriendState, PublicProfile } from '../lib/api'
import { useFetch } from '../lib/hooks'
import FriendActions from './teman/FriendActions'

type Tab = 'teman' | 'permintaan' | 'cari'

// Siswa only: friends, incoming/outgoing requests, and finding new friends by username
export default function TemanPage() {
  const [tab, setTab] = useState<Tab>('teman')
  const { data, error, reload } = useFetch<Friends>('/friends')
  const requests = data ? data.incoming.length : 0

  return (
    <div className="relative mx-auto grid max-w-3xl gap-5">
      <Flower className="absolute -top-2 right-4 size-8 text-blush" />
      <div className="grid gap-1">
        <SectionTitle as="h1">Teman</SectionTitle>
        <p className="text-muted-foreground">Berteman dengan siswa lain, supaya bisa saling melihat karya dan portofolio.</p>
      </div>
      <Segmented label="Bagian" value={tab} onChange={setTab} options={[
        { value: 'teman', label: 'Teman', icon: HeartHandshake },
        { value: 'permintaan', label: requests ? `Permintaan (${requests})` : 'Permintaan', icon: Inbox },
        { value: 'cari', label: 'Cari', icon: Search },
      ]} />
      <ErrorText error={error} />

      {tab === 'cari' ? <FindFriends onChange={reload} /> : !data ? <Loader /> : tab === 'teman' ? (
        data.friends.length === 0 ? (
          <EmptyState icon={Users}>Belum ada teman. Yuk cari di tab <b>Cari</b>!</EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {data.friends.map((u) => (
              <li key={u.id} className="relative grid justify-items-center gap-2 rounded-3xl border bg-mint/50 p-4 text-center">
                <Star className="absolute top-3 right-3 size-4 fill-sun text-sun" />
                <a href={`#/users/${u.id}`} className="grid justify-items-center gap-1.5 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <Avatar user={u} size={72} />
                  <span className="font-bold">{u.username}</span>
                  <span className="text-xs text-muted-foreground">Kelas {u.kelas}</span>
                </a>
                <FriendActions userId={u.id} state="Friends" onChange={reload} />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="grid gap-5">
          <PeopleList title="Ingin berteman denganmu" people={data.incoming} state="Incoming" onChange={reload}
            empty="Tidak ada permintaan baru." />
          <PeopleList title="Permintaan terkirim" people={data.outgoing} state="Outgoing" onChange={reload}
            empty="Kamu belum mengirim permintaan." />
        </div>
      )}
    </div>
  )
}

function PeopleList({ title, people, state, onChange, empty }: {
  title: string
  people: PublicProfile[]
  state: FriendState
  onChange: () => void
  empty: string
}) {
  return (
    <section className="grid gap-2">
      <h2 className="text-lg font-bold">{title}</h2>
      {people.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : (
        <ul className="grid gap-2">
          {people.map((u) => <PersonRow key={u.id} user={u}><FriendActions userId={u.id} state={state} onChange={onChange} /></PersonRow>)}
        </ul>
      )}
    </section>
  )
}

// Search by username; an empty search lists your classmates
function FindFriends({ onChange }: { onChange: () => void }) {
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const { data, error, reload } = useFetch<FriendSearchResult[]>(`/friends/search?q=${encodeURIComponent(q)}`)

  function submit(e: FormEvent) {
    e.preventDefault()
    setQ(input.trim())
  }

  return (
    <div className="grid gap-3">
      <form onSubmit={submit} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Cari username" placeholder="Cari username teman..."
          className="rounded-full bg-card" />
        <Button type="submit"><Search aria-hidden /> Cari</Button>
      </form>
      <p className="text-sm text-muted-foreground">{q ? `Hasil untuk “${q}”` : 'Teman sekelasmu'}</p>
      <ErrorText error={error} />
      {!data ? <Loader /> : data.length === 0 ? (
        <EmptyState icon={UserRoundSearch}>Tidak ada siswa yang cocok.</EmptyState>
      ) : (
        <ul className="grid gap-2">
          {data.map((r) => (
            <PersonRow key={r.user.id} user={r.user}>
              <FriendActions userId={r.user.id} state={r.state} onChange={() => { reload(); onChange() }} />
            </PersonRow>
          ))}
        </ul>
      )}
    </div>
  )
}

function PersonRow({ user, children }: { user: PublicProfile; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
      <a href={`#/users/${user.id}`} className="mr-auto flex items-center gap-3 rounded-xl hover:underline">
        <Avatar user={user} size={44} />
        <span>
          <span className="block font-bold">{user.username}</span>
          <span className="text-xs text-muted-foreground">Kelas {user.kelas}</span>
        </span>
      </a>
      {children}
    </li>
  )
}
