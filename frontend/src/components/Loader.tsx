import { LoaderCircle } from 'lucide-react'

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={fullScreen ? 'grid min-h-svh place-items-center' : 'grid place-items-center py-10'}>
      <LoaderCircle className="animate-spin text-muted-foreground" size={fullScreen ? 32 : 24} aria-label="Memuat" />
    </div>
  )
}
