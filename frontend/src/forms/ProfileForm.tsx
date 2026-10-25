import { useState, type FormEvent } from 'react'
import { Cake, MapPin, Palette, Save, Smile, Sparkles, UserRound } from 'lucide-react'
import AvatarPicker from '../components/AvatarPicker'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import MoodPicker from '../components/MoodPicker'
import SubmitButton from '../components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { api, type User } from '../lib/api'
import { TODAY } from '../lib/dates'
import { useAction } from '../lib/hooks'

const BIO_MAX = 200

// Every field is required (the backend rejects partial profiles), so saving always completes the profile.
// Used for first-time setup and for editing in Settings.
export default function ProfileForm({ me, onSaved, submitLabel }: {
  me: User
  onSaved: (user: User) => void
  submitLabel: string
}) {
  const [form, setForm] = useState({
    avatar: me.avatar ?? '',
    mood: me.mood ?? '',
    bio: me.bio ?? '',
    birthPlace: me.birthPlace ?? '',
    birthDate: me.birthDate ?? '',
  })
  const { status, error, setError, run } = useAction()

  const set = (field: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [field]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    // Avatar and mood are button groups, so the browser can't enforce `required` for them
    if (!form.avatar) return setError('Pilih avatar dulu ya')
    if (!form.mood) return setError('Pilih mood dulu ya')
    const user = await run(() => api<User>('/auth/me', 'PUT', form))
    if (user) onSaved(user)
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles size={16} aria-hidden /> Pilih avatar</CardTitle></CardHeader>
        <CardContent><AvatarPicker value={form.avatar} onChange={set('avatar')} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Smile size={16} aria-hidden /> Gimana perasaanmu hari ini?</CardTitle></CardHeader>
        <CardContent><MoodPicker value={form.mood} onChange={set('mood')} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserRound size={16} aria-hidden /> Tentang aku</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Bakat & hobi" icon={Palette} hint={`${form.bio.length}/${BIO_MAX}`}>
            <Textarea value={form.bio} onChange={(e) => set('bio')(e.target.value)} required maxLength={BIO_MAX} rows={3}
              placeholder="Aku jago menggambar dan suka main bola!" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tempat lahir" icon={MapPin}>
              <Input value={form.birthPlace} onChange={(e) => set('birthPlace')(e.target.value)} required maxLength={60} placeholder="mis. Bandung" />
            </Field>
            <Field label="Tanggal lahir" icon={Cake}>
              <Input type="date" value={form.birthDate} onChange={(e) => set('birthDate')(e.target.value)} required max={TODAY} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <ErrorText error={error} />
      <SubmitButton status={status} icon={Save} big>{submitLabel}</SubmitButton>
    </form>
  )
}
