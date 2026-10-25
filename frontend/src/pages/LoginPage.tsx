import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn, User as UserIcon } from 'lucide-react'
import Backdrop, { Ground } from '../components/Backdrop'
import { Flower, Leaf, Star } from '../components/Decorations'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import SubmitButton from '../components/SubmitButton'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { api, type User } from '../lib/api'
import { useAction } from '../lib/hooks'

// Dev only, mirrors Seed:Accounts in backend/appsettings.Development.json (password = username)
const DEMO_ACCOUNTS = import.meta.env.DEV ? [{ username: 'guru', label: 'Guru' }, { username: 'vera', label: 'Siswa' }] : []

export default function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { status, error, run } = useAction()

  async function login(username: string, password: string) {
    const user = await run(() => api<User>('/auth/login', 'POST', { username, password }))
    if (user) onLogin(user)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    login(username, password)
  }

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden p-4">
      <Backdrop />
      <Ground className="absolute inset-x-0 bottom-0" />
      <Flower className="absolute top-[12%] right-[15%] size-10 text-sky motion-safe:animate-float" />
      <Leaf className="absolute bottom-[14%] left-[12%] size-10 -rotate-45 text-primary/40" />
      <Star className="absolute top-[20%] left-[18%] size-6 fill-sun text-sun" />
      <a href="#/" className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-sun/40">
        <ArrowLeft size={16} aria-hidden /> Kembali
      </a>
      <Card className="w-full max-w-sm rounded-3xl border shadow-lg">
        <CardHeader className="justify-items-center text-center">
          <p className="font-heading text-5xl font-extrabold tracking-wide text-primary">RANUM</p>
          <CardTitle className="text-xl font-bold">Masuk ke Ranum</CardTitle>
          <CardDescription>Halo! Yuk masuk dulu 👋</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Username" inputIcon={UserIcon}>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" placeholder="namamu" />
            </Field>
            <Field label="Password" inputIcon={KeyRound}>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'}
                required autoComplete="current-password" placeholder="••••••" className="pr-9" />
              <Button type="button" variant="ghost" size="icon-sm" className="absolute right-0.5" onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </Field>

            <ErrorText error={error} />
            <SubmitButton status={status} icon={LogIn} big doneLabel="Masuk...">Masuk</SubmitButton>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Belum punya akun? Minta ke gurumu.</p>

          {DEMO_ACCOUNTS.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t pt-4 text-sm text-muted-foreground">
              Akun demo:
              {DEMO_ACCOUNTS.map((d) => (
                <Button key={d.username} type="button" variant="outline" size="sm" onClick={() => login(d.username, d.username)}>
                  {d.label} · {d.username}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
