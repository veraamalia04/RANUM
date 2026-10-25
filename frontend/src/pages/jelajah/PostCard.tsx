import { useState } from 'react'
import { MessageCircle, Trash2 } from 'lucide-react'
import Avatar from '../../components/Avatar'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { api, postImageSrc, type Post } from '../../lib/api'
import { CATEGORIES } from '../../lib/categories'
import { timeAgo } from '../../lib/dates'
import { cn } from '../../lib/utils'
import CommentList from './CommentList'

// Pastel tints the feed cycles through, like the cards in the design
const TINTS = ['bg-mint/50', 'bg-sky/25', 'bg-blush/25', 'bg-sun/30']

// One karya. No like button on purpose: kids can only leave comments.
export default function PostCard({ post, index, onDeleted }: { post: Post; index: number; onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(post.commentCount)

  async function remove() {
    if (!confirm('Hapus karya ini? Komentarnya ikut terhapus.')) return
    await api(`/posts/${post.id}`, 'DELETE').then(onDeleted, (e: Error) => alert(e.message))
  }

  return (
    <article className={cn('grid gap-3 rounded-3xl border p-4 shadow-sm', TINTS[index % TINTS.length])}>
      <header className="flex items-center gap-3">
        <a href={`#/users/${post.author.id}`} aria-label={`Profil ${post.author.username}`}><Avatar user={post.author} size={44} /></a>
        <div className="mr-auto min-w-0">
          <a href={`#/users/${post.author.id}`} className="font-bold hover:underline">{post.author.username}</a>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {post.author.role === 'Siswa' ? `Kelas ${post.kelas}` : <Badge>{post.author.role}</Badge>} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {post.canDelete && (
          <Button variant="ghost" size="icon-sm" onClick={remove} aria-label="Hapus karya" title="Hapus karya"><Trash2 /></Button>
        )}
      </header>

      {post.text && <p className="break-words whitespace-pre-line">{post.text}</p>}
      {post.hasImage && (
        <img src={postImageSrc(post.id)} alt={`Karya ${post.author.username}`} loading="lazy"
          className="max-h-[32rem] w-full rounded-2xl border bg-card object-contain" />
      )}

      {post.categories.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Kategori">
          {post.categories.map((c) => {
            const meta = CATEGORIES[c]
            return (
              <li key={c}>
                <a href={`#/jelajah?kategori=${c}`} className="inline-flex items-center gap-1 rounded-full bg-card/80 px-2.5 py-0.5 text-xs font-semibold hover:underline">
                  <meta.icon size={12} aria-hidden /> {meta.short}
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => setOpen(!open)} aria-expanded={open}>
        <MessageCircle aria-hidden /> {count} komentar
      </Button>
      {open && <CommentList postId={post.id} onCountChange={setCount} />}
    </article>
  )
}
