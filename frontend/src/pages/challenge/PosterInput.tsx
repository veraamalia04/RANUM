import { useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import ErrorText from '../../components/ErrorText'
import { Button } from '../../components/ui/button'
import { resizeImage } from '../../lib/image'

// Optional challenge poster, uploaded as a resized JPEG data URL
export default function PosterInput({ value, onChange }: { value?: string; onChange: (url?: string) => void }) {
  const [error, setError] = useState('')

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      onChange(await resizeImage(file, 1200))
      setError('')
    } catch {
      setError('File itu bukan gambar yang bisa dibaca')
    }
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">Poster (opsional)</span>
      {value ? (
        <div className="relative">
          <img src={value} alt="Poster challenge" className="max-h-72 w-full rounded-lg border object-cover" />
          <Button type="button" variant="secondary" size="icon-sm" className="absolute top-2 right-2"
            onClick={() => onChange(undefined)} aria-label="Hapus poster" title="Hapus poster">
            <X />
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:bg-muted/50">
          <ImagePlus size={28} aria-hidden />
          <span>Pilih gambar poster</span>
          <input type="file" accept="image/*" onChange={pick} hidden />
        </label>
      )}
      <ErrorText error={error} />
    </div>
  )
}
