import type { FormEvent } from 'react'
import { Rocket } from 'lucide-react'
import { api } from '../lib/api'
import { useAction } from '../lib/hooks'
import ErrorText from './ErrorText'
import SubmitButton from './SubmitButton'

// Siswa adds a challenge to their list (POST /challenges/:id/accept); callers then open the answer form
export default function AcceptButton({ id, onAccepted }: { id: number; onAccepted: () => void }) {
  const { status, error, run } = useAction()

  async function accept(e: FormEvent) {
    e.preventDefault()
    // The endpoint returns 204 (undefined), so map success to true
    if (await run(() => api(`/challenges/${id}/accept`, 'POST').then(() => true))) onAccepted()
  }

  return (
    <form onSubmit={accept} className="grid gap-2">
      <SubmitButton status={status} icon={Rocket} big doneLabel="Ayo mulai!">Terima & Kerjakan</SubmitButton>
      <ErrorText error={error} />
    </form>
  )
}
