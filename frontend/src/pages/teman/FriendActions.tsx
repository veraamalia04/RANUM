import { Check, UserMinus, UserPlus, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { api, type FriendState } from '../../lib/api'
import { useAction } from '../../lib/hooks'

// The buttons that fit the current friendship state; onChange reloads whatever list shows them
export default function FriendActions({ userId, state, onChange }: { userId: number; state: FriendState; onChange: () => void }) {
  const { status, error, run } = useAction()
  const busy = status === 'busy'
  const act = (method: string, path = '') => run(() => api(`/friends/${userId}${path}`, method).then(() => true)).then((ok) => ok && onChange())

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {state === 'None' && <Button size="sm" disabled={busy} onClick={() => act('POST')}><UserPlus aria-hidden /> Tambah teman</Button>}
      {state === 'Outgoing' && <Button size="sm" variant="outline" disabled={busy} onClick={() => act('DELETE')}><X aria-hidden /> Batalkan</Button>}
      {state === 'Incoming' && (
        <>
          <Button size="sm" disabled={busy} onClick={() => act('POST', '/accept')}><Check aria-hidden /> Terima</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => act('DELETE')}><X aria-hidden /> Tolak</Button>
        </>
      )}
      {state === 'Friends' && (
        <Button size="sm" variant="ghost" disabled={busy}
          onClick={() => confirm('Hapus dari daftar teman?') && act('DELETE')}><UserMinus aria-hidden /> Hapus teman</Button>
      )}
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
