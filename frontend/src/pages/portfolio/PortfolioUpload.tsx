import { useState, type ChangeEvent, type FormEvent } from 'react'
import { FileText, Plus, Upload } from 'lucide-react'
import { Sparkle, Star } from '../../components/Decorations'
import ErrorText from '../../components/ErrorText'
import Field from '../../components/Field'
import SubmitButton from '../../components/SubmitButton'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { api } from '../../lib/api'
import { useAction } from '../../lib/hooks'
import { resizeImage } from '../../lib/image'
import { cn } from '../../lib/utils'

// Same limit as ImageData.MaxPdfBytes on the backend; checked here first for a quick message
const MAX_PDF_BYTES = 5 * 1024 * 1024

const readDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

// The yellow "Punya karya baru?" card; opens the upload form in a Dialog
export default function PortfolioUpload({ onSaved, className }: { onSaved: () => void; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('relative flex items-center gap-4 rounded-3xl border-2 border-dashed border-sun bg-sun/25 p-5', className)}>
      <Sparkle className="absolute top-3 right-4 size-5 text-peach" />
      <button type="button" onClick={() => setOpen(true)} aria-label="Unggah ke portofolio"
        className="grid size-16 shrink-0 place-items-center rounded-full bg-sun text-primary shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:hover:scale-105">
        <Plus size={32} strokeWidth={3} aria-hidden />
      </button>
      <div className="grid gap-2">
        <h3 className="text-lg font-bold">Punya karya baru?</h3>
        <p className="text-sm text-muted-foreground">Unggah gambar, foto proyek, atau dokumen PDF.</p>
        <Button size="sm" className="justify-self-start" onClick={() => setOpen(true)}><Upload aria-hidden /> Unggah Karya</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-bold">Tambah ke portofolio</DialogTitle>
          <DialogDescription>Foto atau PDF, misalnya sertifikat, piagam, atau karya terbaikmu.</DialogDescription>
          <PortfolioForm onSaved={() => { setOpen(false); onSaved() }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PortfolioForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<{ url: string; name: string; pdf: boolean }>()
  const { status, error, setError, run } = useAction()

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    const pdf = picked.type === 'application/pdf'
    if (pdf && picked.size > MAX_PDF_BYTES) return setError('PDF terlalu besar, maksimal 5 MB')
    try {
      setFile({ url: pdf ? await readDataUrl(picked) : await resizeImage(picked, 1600), name: picked.name, pdf })
      setError('')
    } catch {
      setError('File itu bukan gambar atau PDF yang bisa dibaca')
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!file) return setError('Pilih foto atau PDF dulu')
    if (await run(() => api('/portfolio', 'POST', { title, description, fileUrl: file.url }))) onSaved()
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <Field label="Judul">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} placeholder="mis. Juara 1 Lomba Mewarnai" />
      </Field>
      <Field label="Cerita singkat (opsional)">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={2} />
      </Field>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center text-sm text-muted-foreground hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring">
        {file?.pdf ? <FileText size={28} aria-hidden /> : file ? <img src={file.url} alt="" className="max-h-40 rounded-xl" /> : <Star className="size-7 fill-sun text-sun" />}
        <span>{file ? file.name : 'Pilih foto atau PDF'}</span>
        <input type="file" accept="image/*,application/pdf" onChange={pick} className="sr-only" />
      </label>
      <ErrorText error={error} />
      <SubmitButton status={status} icon={Upload} big>Simpan ke portofolio</SubmitButton>
    </form>
  )
}
