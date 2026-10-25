import { useState, type FormEvent } from 'react'
import { GraduationCap, KeyRound, Search, Sprout, Star, User as UserIcon, UserPlus } from 'lucide-react'
import Avatar from '../components/Avatar'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import Loader from '../components/Loader'
import RoleChip from '../components/RoleChip'
import Segmented from '../components/Segmented'
import SubmitButton from '../components/SubmitButton'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { NativeSelect, NativeSelectOption } from '../components/ui/native-select'
import { api, KELAS, type User } from '../lib/api'
import { useAction, useFetch } from '../lib/hooks'

type NewRole = 'Siswa' | 'Guru'

// "4" and "kelas 4" both match kelas 4
const matches = (u: User, query: string) => {
  const q = query.trim().toLowerCase()
  return u.username.toLowerCase().includes(q) || String(u.kelas ?? '') === q.replace('kelas', '').trim()
}

export default function UsersPage({ me }: { me: User }) {
  const { data: users, error: loadError, reload } = useFetch<User[]>('/users')
  const [role, setRole] = useState<NewRole>('Siswa')
  const [query, setQuery] = useState('')
  const { status, error, run } = useAction()

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const created = await run(() => api<User>('/users', 'POST', {
      username: form.get('username'),
      password: form.get('password'),
      role,
      kelas: role === 'Siswa' ? Number(form.get('kelas')) : null,
    }))
    if (created) {
      formEl.reset()
      reload()
    }
  }

  const shown = users?.filter((u) => matches(u, query)) ?? []

  return (
    <div className="grid items-start gap-6 md:grid-cols-[320px_1fr]">
      <Card className="md:sticky md:top-20">
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus size={16} aria-hidden /> Buat akun baru</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            {me.role === 'Admin' && (
              <Segmented label="Role" value={role} onChange={setRole} options={[
                { value: 'Siswa', label: 'Siswa', icon: GraduationCap },
                { value: 'Guru', label: 'Guru', icon: Star },
              ]} />
            )}
            <Field label="Username" inputIcon={UserIcon}>
              <Input name="username" required minLength={3} maxLength={30} />
            </Field>
            <Field label="Password" inputIcon={KeyRound}>
              <Input name="password" type="password" required minLength={6} autoComplete="new-password" />
            </Field>
            {role === 'Siswa' && (
              <Field label="Kelas" inputIcon={GraduationCap}>
                <NativeSelect name="kelas" required defaultValue="" className="w-full">
                  <NativeSelectOption value="" disabled>Pilih kelas</NativeSelectOption>
                  {KELAS.map((k) => <NativeSelectOption key={k} value={k}>Kelas {k}</NativeSelectOption>)}
                </NativeSelect>
              </Field>
            )}
            <ErrorText error={error} />
            <SubmitButton status={status} icon={UserPlus} big doneLabel="Akun dibuat!">Buat akun {role.toLowerCase()}</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {me.role === 'Admin' ? 'Semua akun' : 'Daftar siswa'} {users && <Badge variant="secondary">{users.length}</Badge>}
          </h1>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama / kelas" aria-label="Cari" className="pl-8" />
          </div>
        </div>
        <ErrorText error={loadError} />
        {!users ? <Loader /> : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {shown.map((u) => (
              <li key={u.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <Avatar user={u} size={40} />
                <div className="grid gap-1">
                  <p className="font-medium">{u.username}</p>
                  <RoleChip user={u} />
                </div>
              </li>
            ))}
            {shown.length === 0 && <li className="flex items-center gap-2 text-sm text-muted-foreground"><Sprout size={16} aria-hidden /> Belum ada akun di sini</li>}
          </ul>
        )}
      </section>
    </div>
  )
}
