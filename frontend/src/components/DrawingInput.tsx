import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { Brush, Eraser, ImageUp, RefreshCw, Upload } from 'lucide-react'
import { resizeImage } from '../lib/image'
import { cn } from '../lib/utils'
import ErrorText from './ErrorText'
import Segmented from './Segmented'
import { Button, buttonVariants } from './ui/button'

type Mode = 'draw' | 'upload'

const COLORS = [
  { value: '#3a2e1f', name: 'Cokelat tua' },
  { value: '#e5484d', name: 'Merah' },
  { value: '#ff8a00', name: 'Oranye' },
  { value: '#ffc93c', name: 'Kuning' },
  { value: '#2dbe60', name: 'Hijau' },
  { value: '#3fa7d6', name: 'Biru' },
  { value: '#7c6cf2', name: 'Ungu' },
  { value: '#ffffff', name: 'Penghapus' },
]
const SIZES = [6, 14, 28]
const W = 800
const H = 600

const swatch = (active: boolean) =>
  cn('grid size-8 place-items-center rounded-full border transition-transform', active && 'scale-110 ring-2 ring-primary ring-offset-2')

// A drawing answer: draw on the built-in canvas, or upload a photo of a paper drawing
export default function DrawingInput({ value, onChange }: { value?: string; onChange: (url: string | undefined) => void }) {
  const [mode, setMode] = useState<Mode>('draw')
  const [error, setError] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    onChange(undefined)
  }

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      onChange(await resizeImage(file, 1024))
      setError('')
    } catch {
      setError('File itu bukan gambar yang bisa dibaca')
    }
  }

  return (
    <div className="grid gap-3">
      <Segmented label="Cara menjawab" value={mode} onChange={switchMode} options={[
        { value: 'draw', label: 'Gambar di sini', icon: Brush },
        { value: 'upload', label: 'Upload foto', icon: ImageUp },
      ]} />

      {mode === 'draw' ? (
        <DrawingPad onChange={onChange} />
      ) : value ? (
        <div className="grid justify-items-start gap-2">
          <img src={value} alt="Gambar yang kamu upload" className="max-h-80 rounded-lg border" />
          <label className={buttonVariants({ variant: 'outline' })}>
            <RefreshCw aria-hidden /> Ganti foto
            <input type="file" accept="image/*" onChange={pick} hidden />
          </label>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-sm text-muted-foreground hover:bg-muted/50">
          <Upload size={28} aria-hidden />
          <span>Pilih foto gambarmu</span>
          <input type="file" accept="image/*" onChange={pick} hidden />
        </label>
      )}
      <ErrorText error={error} />
    </div>
  )
}

function DrawingPad({ onChange }: { onChange: (url: string | undefined) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0].value)
  const [size, setSize] = useState(SIZES[1])

  const ctx = () => canvasRef.current!.getContext('2d')!

  function clear() {
    // White background so the exported JPEG isn't black
    ctx().fillStyle = '#fff'
    ctx().fillRect(0, 0, W, H)
  }

  useEffect(clear, [])

  function point(e: PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height }
  }

  function line(to: { x: number; y: number }) {
    const c = ctx()
    c.strokeStyle = color
    c.lineWidth = size
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    c.moveTo(last.current!.x, last.current!.y)
    c.lineTo(to.x, to.y)
    c.stroke()
    last.current = to
  }

  function down(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = point(e)
    line(last.current)
  }

  function up() {
    if (!last.current) return
    last.current = null
    onChange(canvasRef.current!.toDataURL('image/jpeg', 0.85))
  }

  return (
    <div className="grid gap-3">
      <canvas ref={canvasRef} width={W} height={H} aria-label="Kanvas gambar" className="w-full touch-none rounded-lg border bg-white"
        onPointerDown={down} onPointerMove={(e) => last.current && line(point(e))} onPointerUp={up} onPointerCancel={up} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Warna">
          {COLORS.map((c) => (
            <button key={c.value} type="button" role="radio" aria-checked={color === c.value} aria-label={c.name} title={c.name}
              className={swatch(color === c.value)} style={{ background: c.value }} onClick={() => setColor(c.value)}>
              {c.name === 'Penghapus' && <Eraser size={14} aria-hidden />}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5" role="radiogroup" aria-label="Ukuran kuas">
          {SIZES.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={size === s} aria-label={`Kuas ${s}`}
              className={swatch(size === s)} onClick={() => setSize(s)}>
              <span className="rounded-full bg-foreground" style={{ width: s / 2 + 4, height: s / 2 + 4 }} />
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" className="ml-auto" onClick={() => { clear(); onChange(undefined) }}>
          <RefreshCw aria-hidden /> Mulai ulang
        </Button>
      </div>
    </div>
  )
}
