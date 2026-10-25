import { Lock } from 'lucide-react'
import Avatar from '../components/Avatar'
import BackLink from '../components/BackLink'
import RoleChip from '../components/RoleChip'
import { Card, CardContent } from '../components/ui/card'
import PasswordForm from '../forms/PasswordForm'
import ProfileForm from '../forms/ProfileForm'
import type { User } from '../lib/api'

export default function SettingsPage({ me, onSaved }: { me: User; onSaved: (user: User) => void }) {
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <BackLink to="/profile">Kembali ke profil</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Avatar user={me} size={48} />
          <div className="mr-auto">
            <p className="font-medium">{me.username}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Lock size={12} aria-hidden /> Username tidak bisa diubah</p>
          </div>
          <RoleChip user={me} />
        </CardContent>
      </Card>

      <ProfileForm me={me} onSaved={onSaved} submitLabel="Simpan perubahan" />
      <PasswordForm />
    </div>
  )
}
