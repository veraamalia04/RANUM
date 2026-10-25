import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ImagePlus, Send, X } from 'lucide-react'
import Avatar from '../../components/Avatar'
import CategoryChips from '../../components/CategoryChips'
import { Sparkle } from '../../components/Decorations'
import ErrorText from '../../components/ErrorText'
import SubmitButton from '../../components/SubmitButton'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { api, type Post, type User } from '../../lib/api'
import type { Category } from '../../lib/categories'
import { useAction } from '../../lib/hooks'
import { resizeImage } from '../../lib/image'

// Share a karya: some text, a photo, or both
export default function PostComposer({ me, onPosted }: { me: User; onPosted: (post: Post) => void }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<string>()
  const [categories, setCategories] = useState<Category[]>([])
  const { status, error, setError, run } = useAction()

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setImage(await resizeImage(file, 1200))
      setError('')
    } catch {
      setError('File itu bukan gambar yang bisa dibaca')
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() && !image) return setError('Tulis ceritamu atau pilih foto dulu')
    const post = await run(() => api<Post>('/posts', 'POST', { text, imageUrl: image ?? null, categories }))
    if (!post) return
    setText('')
    setImage(undefined)
    setCategories([])
    onPosted(post)
  }

  return (
    <form onSubmit={submit} className="relative grid gap-3 rounded-3xl border bg-sun/30 p-4 shadow-sm">
      <Sparkle className="absolute -top-3 right-6 size-6 text-peach" />
      <div className="flex gap-3">
        <Avatar user={me} size={44} />
        <Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={3}
          aria-label="Cerita karyamu" placeholder="Ceritakan karyamu hari ini..." className="rounded-2xl bg-card" />
      </div>
      {image && (
        <div className="relative">
          <img src={image} alt="Foto karya yang akan diunggah" className="max-h-80 w-full rounded-2xl border object-contain" />
          <Button type="button" variant="secondary" size="icon-sm" className="absolute top-2 right-2"
            onClick={() => setImage(undefined)} aria-label="Hapus foto" title="Hapus foto">
            <X />
          </Button>
        </div>
      )}
      <div className="grid gap-1.5">
        <span className="text-sm font-semibold">Kategori karyamu (boleh lebih dari satu)</span>
        <CategoryChips label="Kategori karyamu" value={categories} onChange={setCategories} />
      </div>
      <ErrorText error={error} />
      <div className="flex items-center justify-between gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-sun/50 focus-within:ring-2 focus-within:ring-ring">
          <ImagePlus size={18} aria-hidden /> Foto
          <input type="file" accept="image/*" onChange={pick} className="sr-only" />
        </label>
        <SubmitButton status={status} icon={Send} doneLabel="Terkirim!">Unggah karya</SubmitButton>
      </div>
    </form>
  )
}
