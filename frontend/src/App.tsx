import { useEffect, useState } from 'react'
import Backdrop, { Ground } from './components/Backdrop'
import Footer from './components/Footer'
import Loader from './components/Loader'
import TopBar from './components/TopBar'
import { api, type User } from './lib/api'
import { parseCategories } from './lib/categories'
import { cn } from './lib/utils'
import { navigate, parseRoute, useHashRoute } from './lib/router'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import ChallengeFormPage from './pages/ChallengeFormPage'
import ChallengesPage from './pages/ChallengesPage'
import HomePage from './pages/HomePage'
import JelajahPage from './pages/JelajahPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PortfolioPage from './pages/PortfolioPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import SettingsPage from './pages/SettingsPage'
import StaffHomePage from './pages/StaffHomePage'
import TemanPage from './pages/TemanPage'
import UserProfilePage from './pages/UserProfilePage'
import UsersPage from './pages/UsersPage'

export default function App() {
  const [me, setMe] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const route = useHashRoute()
  const { path, query } = parseRoute(route)

  useEffect(() => {
    api<User>('/auth/me').then(setMe).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader fullScreen />
  // Visitors see the landing page; every "Start Exploring" leads to #/login
  if (!me) return path === '/login'
    ? <LoginPage onLogin={(user) => { setMe(user); navigate('/') }} />
    : <LandingPage />

  const logout = () => api('/auth/logout', 'POST').then(() => { setMe(null); navigate('') })
  // A Siswa can't use the app until their profile is filled in
  const setupRequired = me.role === 'Siswa' && !me.profileComplete
  // Jelajah, Tantangan and answering a challenge use MascotLayout, which needs a wider container for the side mascots
  const withMascots = !setupRequired && (path === '/jelajah' || (path.startsWith('/challenges') && path !== '/challenges/new'))

  return (
    <div className="flex min-h-svh flex-col">
      <Backdrop />
      <TopBar me={me} route={route} showNav={!setupRequired} onLogout={logout} />
      <main className={cn('mx-auto w-full flex-1 px-4 pt-6 pb-24 sm:pb-10', withMascots ? 'max-w-7xl' : 'max-w-5xl')} key={setupRequired ? 'setup' : path}>
        {setupRequired
          ? <ProfileSetupPage me={me} onSaved={(user) => { setMe(user); navigate('/') }} />
          : renderPage(path, query, me, setMe)}
      </main>
      {/* The ground sits on the footer's top edge (its mt-16 wave), or on the page bottom on phones */}
      <div className="relative">
        <Ground className="absolute inset-x-0 bottom-0 sm:-bottom-16" />
      </div>
      {/* Mobile has the bottom nav instead */}
      <Footer className="hidden sm:block" links={[
        { label: 'Beranda', href: '#/' },
        { label: 'Tantangan', href: '#/challenges' },
        { label: 'Jelajah', href: '#/jelajah' },
        ...(me.role === 'Siswa' ? [{ label: 'Teman', href: '#/teman' }, { label: 'Portofolioku', href: '#/portfolio' }] : []),
      ]} />
    </div>
  )
}

function renderPage(route: string, query: URLSearchParams, me: User, setMe: (user: User) => void) {
  const isStaff = me.role !== 'Siswa'
  const challengeId = /^\/challenges\/(\d+)$/.exec(route)?.[1]
  const userId = /^\/users\/(\d+)$/.exec(route)?.[1]

  switch (true) {
    case route === '/profile':
      return me.profileComplete ? <ProfilePage me={me} /> : <ProfileSetupPage me={me} onSaved={setMe} />
    case route === '/settings':
      return <SettingsPage me={me} onSaved={setMe} />
    case route === '/users' && isStaff:
      return <UsersPage me={me} />
    case route === '/challenges':
      return <ChallengesPage me={me} categories={parseCategories(query.get('kategori'))} />
    case route === '/challenges/new' && isStaff:
      return <ChallengeFormPage />
    case challengeId !== undefined:
      return <ChallengeDetailPage id={Number(challengeId)} me={me} />
    case route === '/jelajah':
      return <JelajahPage me={me} categories={parseCategories(query.get('kategori'))} />
    case route === '/teman' && !isStaff:
      return <TemanPage />
    case route === '/portfolio' && !isStaff:
      return <PortfolioPage me={me} />
    case userId !== undefined:
      return <UserProfilePage key={userId} id={Number(userId)} me={me} />
    default:
      return isStaff ? <StaffHomePage me={me} /> : <HomePage me={me} />
  }
}
