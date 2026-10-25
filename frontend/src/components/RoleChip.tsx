import { GraduationCap, Shield, Star } from 'lucide-react'
import type { User } from '../lib/api'
import { Badge } from './ui/badge'

const ICONS = { Siswa: GraduationCap, Guru: Star, Admin: Shield }

// Role badge plus a kelas badge for Siswa
export default function RoleChip({ user }: { user: Pick<User, 'role' | 'kelas'> }) {
  const Icon = ICONS[user.role]
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant={user.role === 'Siswa' ? 'secondary' : 'default'}><Icon aria-hidden /> {user.role}</Badge>
      {user.kelas && <Badge variant="outline">Kelas {user.kelas}</Badge>}
    </div>
  )
}
