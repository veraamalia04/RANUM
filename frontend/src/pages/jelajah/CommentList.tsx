import { useEffect, useState, type FormEvent } from 'react'
import { Send, Trash2 } from 'lucide-react'
import Avatar from '../../components/Avatar'
import ErrorText from '../../components/ErrorText'
import Loader from '../../components/Loader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { api, type Comment } from '../../lib/api'
import { timeAgo } from '../../lib/dates'
import { useAction, useFetch } from '../../lib/hooks'

// Only mounted once the comments are opened, so the feed doesn't fetch every post's comments
export default function CommentList({ postId, onCountChange }: { postId: number; onCountChange: (count: number) => void }) {
  const { data, error, reload } = useFetch<Comment[]>(`/posts/${postId}/comments`)
  const [text, setText] = useState('')
  const { status, error: sendError, run } = useAction()

  // Keeps the "N komentar" button on the card in sync
  useEffect(() => { if (data) onCountChange(data.length) }, [data, onCountChange])

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!await run(() => api(`/posts/${postId}/comments`, 'POST', { text }))) return
    setText('')
    reload()
  }

  async function remove(id: number) {
    if (!confirm('Hapus komentar ini?')) return
    await run(() => api(`/posts/${postId}/comments/${id}`, 'DELETE').then(() => true))
    reload()
  }

  return (
    <div className="grid gap-3 border-t border-dashed pt-3">
      <ErrorText error={error || sendError} />
      {!data ? <Loader /> : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada komentar. Jadilah yang pertama!</p>
      ) : (
        <ul className="grid gap-2">
          {data.map((c) => (
            <li key={c.id} className="flex gap-2">
              <a href={`#/users/${c.author.id}`} aria-label={`Profil ${c.author.username}`}><Avatar user={c.author} size={32} /></a>
              <div className="min-w-0 flex-1 rounded-2xl bg-card px-3 py-2">
                <p className="text-xs">
                  <a href={`#/users/${c.author.id}`} className="font-bold hover:underline">{c.author.username}</a>
                  <span className="text-muted-foreground"> · {timeAgo(c.createdAt)}</span>
                </p>
                <p className="text-sm break-words whitespace-pre-line">{c.text}</p>
              </div>
              {c.canDelete && (
                <Button variant="ghost" size="icon-sm" onClick={() => remove(c.id)} aria-label="Hapus komentar" title="Hapus komentar">
                  <Trash2 />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={send} className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} required maxLength={500}
          aria-label="Tulis komentar" placeholder="Tulis komentar yang baik..." className="rounded-full bg-card" />
        <Button type="submit" size="icon" disabled={status === 'busy'} aria-label="Kirim komentar" title="Kirim komentar"><Send /></Button>
      </form>
    </div>
  )
}
