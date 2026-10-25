import { PartyPopper } from 'lucide-react'
import ProfileForm from '../forms/ProfileForm'
import type { User } from '../lib/api'

// Shown instead of the profile until every profile field is filled (and, for Siswa, instead of the whole app)
export default function ProfileSetupPage({ me, onSaved }: { me: User; onSaved: (user: User) => void }) {
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <header className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><PartyPopper size={24} aria-hidden /></span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Halo, {me.username}!</h1>
          <p className="text-sm text-muted-foreground">Lengkapi profilmu dulu ya, biar teman-teman makin kenal kamu 😊</p>
        </div>
      </header>
      <ProfileForm me={me} onSaved={onSaved} submitLabel="Simpan & mulai" />
    </div>
  )
}
