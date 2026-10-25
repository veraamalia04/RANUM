import { Briefcase, ChevronDown, Compass, Crown, HeartHandshake, House, LogOut, Settings, Trophy, UserRound, Users, type LucideIcon } from 'lucide-react'
import type { Friends, User } from '../lib/api'
import { useFetch } from '../lib/hooks'
import { navigate } from '../lib/router'
import { cn } from '../lib/utils'
import Avatar from './Avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'

// `short` fits the 5-item bottom nav on phones
const SISWA_LINKS: { to: string; label: string; short?: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Beranda', icon: House },
  { to: '/challenges', label: 'Tantangan', icon: Trophy },
  { to: '/jelajah', label: 'Jelajah', icon: Compass },
  { to: '/teman', label: 'Teman', icon: HeartHandshake },
  { to: '/portfolio', label: 'Portofolioku', short: 'Portofolio', icon: Briefcase },
]
const STAFF_LINKS: typeof SISWA_LINKS = [
  { to: '/', label: 'Beranda', icon: House },
  { to: '/challenges', label: 'Tantangan', icon: Trophy },
  { to: '/jelajah', label: 'Jelajah', icon: Compass },
  { to: '/users', label: 'Kelola Akun', icon: Users },
]

// Which nav item a route belongs to, e.g. #/challenges/3 highlights "Tantangan"
function sectionOf(route: string, links: { to: string }[]) {
  const match = links.find((l) => l.to !== '/' && route.startsWith(l.to))
  return match?.to ?? (route === '/' ? '/' : '')
}

export default function TopBar({ me, route, showNav, onLogout }: {
  me: User
  route: string
  showNav: boolean
  onLogout: () => void
}) {
  const isSiswa = me.role === 'Siswa'
  const links = isSiswa ? SISWA_LINKS : STAFF_LINKS
  const active = sectionOf(route, links)

  return (
    // A floating pill over the Backdrop, like the landing nav.
    // No backdrop-blur/transform here: the fixed mobile nav inside would get trapped in the header
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 rounded-full border border-primary/10 bg-card/95 pr-2 pl-5 shadow-md lg:gap-6">
        <a href="#/" className="relative rounded-full font-heading text-3xl font-extrabold tracking-wide text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <Crown aria-hidden strokeWidth={1.5} className="absolute -top-3 -left-2.5 size-6 -rotate-12 fill-sun text-[#e9a800]" />
          RANUM
        </a>
        {showNav && (
          // Mobile: a floating bottom bar
          <nav aria-label="Menu"
            className="fixed inset-x-3 bottom-3 flex justify-around rounded-full border border-primary/10 bg-card p-1.5 shadow-lg sm:static sm:justify-start sm:gap-1 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            {links.map((l) => {
              const on = active === l.to
              return (
                <a key={l.to} href={`#${l.to}`} aria-current={on ? 'page' : undefined}
                  className={cn('relative flex flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm',
                    on ? 'bg-sun text-primary shadow-sm sm:bg-primary sm:text-primary-foreground' : 'text-primary/70 hover:bg-sun/40 hover:text-primary')}>
                  <l.icon size={18} aria-hidden className="sm:hidden lg:inline" />
                  <span className="sm:hidden">{l.short ?? l.label}</span>
                  <span className="hidden sm:inline">{l.label}</span>
                  {l.to === '/teman' && <RequestCount key={route} />}
                </a>
              )
            })}
          </nav>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-auto flex items-center gap-2 rounded-full bg-sun/40 p-1 pr-2.5 transition-colors hover:bg-sun/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Menu akun">
            <Avatar user={me} size={38} />
            <span className="hidden max-w-28 truncate text-sm font-bold md:inline">{me.username}</span>
            <ChevronDown size={16} aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate('/profile')}><UserRound aria-hidden /> Profil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}><Settings aria-hidden /> Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}><LogOut aria-hidden /> Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Incoming friend requests; keyed by route in TopBar so it refreshes on every navigation
function RequestCount() {
  const { data } = useFetch<Friends>('/friends')
  const count = data?.incoming.length ?? 0
  if (!count) return null
  return (
    <span className="absolute top-0 right-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-bold text-primary-foreground ring-2 ring-card sm:-top-1 sm:-right-1"
      aria-label={`${count} permintaan pertemanan`}>
      {count}
    </span>
  )
}
