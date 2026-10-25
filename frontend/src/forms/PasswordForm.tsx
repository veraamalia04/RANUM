import type { FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import SubmitButton from '../components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { api } from '../lib/api'
import { useAction } from '../lib/hooks'

export default function PasswordForm() {
  const { status, error, setError, run } = useAction()

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const { currentPassword, newPassword, confirm } = Object.fromEntries(new FormData(formEl))
    if (newPassword !== confirm) return setError('Password baru dan ulangi password tidak sama')
    const ok = await run(() => api('/auth/password', 'PUT', { currentPassword, newPassword }).then(() => true))
    if (ok) formEl.reset()
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound size={16} aria-hidden /> Ganti password</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Password lama">
            <Input name="currentPassword" type="password" required autoComplete="current-password" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password baru">
              <Input name="newPassword" type="password" required minLength={6} autoComplete="new-password" />
            </Field>
            <Field label="Ulangi password baru">
              <Input name="confirm" type="password" required minLength={6} autoComplete="new-password" />
            </Field>
          </div>
          <ErrorText error={error} />
          <SubmitButton status={status} icon={KeyRound}>Ganti password</SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
