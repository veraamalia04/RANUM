import { avatarUrl, type User } from '../lib/api'
import { findMood } from '../lib/moods'

const COLORS = ['#ff8a00', '#2dbe60', '#ffb800', '#ff5e3a', '#3fa7d6', '#7c6cf2']

type Props = { user: Pick<User, 'id' | 'username' | 'avatar' | 'mood'>; size?: number }

// The user's chosen avatar (or their initial until they pick one), with their mood as a small badge
export default function Avatar({ user, size = 48 }: Props) {
  const mood = findMood(user.mood)
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-background"
      style={{ width: size, height: size, fontSize: size * 0.42, background: user.avatar ? 'var(--muted)' : COLORS[user.id % COLORS.length] }}>
      {user.avatar ? <img src={avatarUrl(user.avatar)} alt="" className="size-full rounded-full object-cover" /> : user.username[0].toUpperCase()}
      {mood && (
        <span className="absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full p-0.5 text-white ring-2 ring-background"
          style={{ background: mood.color }} title={`Mood: ${mood.label}`}>
          <mood.icon size={Math.max(10, size * 0.18)} aria-hidden />
        </span>
      )}
    </span>
  )
}
