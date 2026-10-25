import type { Category } from './categories'

export type Role = 'Siswa' | 'Guru' | 'Admin'

export type User = {
  id: number
  username: string
  role: Role
  kelas: number | null
  avatar: string | null
  mood: string | null
  bio: string | null
  birthPlace: string | null
  birthDate: string | null
  // Computed by the backend: every profile field is filled
  profileComplete: boolean
}

export const KELAS = Array.from({ length: 12 }, (_, i) => i + 1)

export const avatarUrl = (name: string) => `/api/avatars/${encodeURIComponent(name)}`

// Picks the most useful message from our { message } errors or ASP.NET validation problems
function errorMessage(data: unknown, status: number) {
  const body = data as { message?: string; errors?: Record<string, string[]>; title?: string } | null
  return body?.message ?? Object.values(body?.errors ?? {})[0]?.[0] ?? body?.title ?? `Error ${status}`
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(errorMessage(await res.json().catch(() => null), res.status))
  return res.status === 204 ? (undefined as T) : res.json()
}

// What other people may see of a user (no birth date or place)
export type PublicProfile = Pick<User, 'id' | 'username' | 'role' | 'kelas' | 'avatar' | 'mood' | 'bio'>

export type FriendState = 'None' | 'Friends' | 'Incoming' | 'Outgoing'
export type Friends = { friends: PublicProfile[]; incoming: PublicProfile[]; outgoing: PublicProfile[] }
export type FriendSearchResult = { user: PublicProfile; state: FriendState }

export type Post = {
  id: number
  author: PublicProfile
  kelas: number | null
  text: string | null
  hasImage: boolean
  categories: Category[]
  createdAt: string
  commentCount: number
  canDelete: boolean
}
export type Comment = { id: number; author: PublicProfile; text: string; createdAt: string; canDelete: boolean }
export const postImageSrc = (id: number) => `/api/posts/${id}/image`

export type PortfolioItem = {
  id: number
  title: string
  description: string | null
  fileType: 'Foto' | 'Pdf'
  createdAt: string
  canDelete: boolean
}
export const portfolioFileSrc = (id: number) => `/api/portfolio/${id}/file`
