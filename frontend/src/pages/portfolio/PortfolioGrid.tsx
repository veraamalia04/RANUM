import { useState } from 'react'
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { api, portfolioFileSrc, type PortfolioItem } from '../../lib/api'
import { cn } from '../../lib/utils'

// Portfolio cards: photos open in a Dialog, PDFs open in a new tab
export default function PortfolioGrid({ items, onDeleted, className }: { items: PortfolioItem[]; onDeleted: () => void; className?: string }) {
  const [viewing, setViewing] = useState<PortfolioItem>()

  async function remove(item: PortfolioItem) {
    if (!confirm(`Hapus “${item.title}” dari portofolio?`)) return
    await api(`/portfolio/${item.id}`, 'DELETE').then(onDeleted, (e: Error) => alert(e.message))
  }

  return (
    <>
      <ul className={cn('grid gap-4 sm:grid-cols-2', className)}>
        {items.map((item) => (
          <li key={item.id} className="relative flex gap-3 rounded-3xl border bg-card p-3 shadow-sm">
            {item.fileType === 'Foto' ? (
              <button type="button" onClick={() => setViewing(item)} aria-label={`Lihat ${item.title}`}
                className="shrink-0 overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <img src={portfolioFileSrc(item.id)} alt="" loading="lazy" className="size-24 object-cover transition motion-safe:hover:scale-105" />
              </button>
            ) : (
              <a href={portfolioFileSrc(item.id)} target="_blank" rel="noreferrer" aria-label={`Buka PDF ${item.title}`}
                className="grid size-24 shrink-0 place-items-center rounded-2xl bg-sky/40 text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <FileText size={36} aria-hidden />
              </a>
            )}
            <div className="grid min-w-0 content-center gap-1.5 pr-6">
              <h3 className="leading-tight font-bold break-words">{item.title}</h3>
              {item.description && <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
              <span className="justify-self-start rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold">
                {item.fileType === 'Pdf' ? 'PDF · ' : ''}Tersimpan di portofolio
              </span>
            </div>
            {item.canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label={`Pilihan untuk ${item.title}`}
                  className="absolute top-2 right-2 grid size-7 place-items-center rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <MoreHorizontal size={18} aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem variant="destructive" onClick={() => remove(item)}><Trash2 aria-hidden /> Hapus</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(undefined)}>
        <DialogContent className="sm:max-w-2xl">
          {viewing && (
            <>
              <DialogTitle className="text-xl font-bold">{viewing.title}</DialogTitle>
              <img src={portfolioFileSrc(viewing.id)} alt={viewing.title} className="max-h-[70dvh] w-full rounded-2xl object-contain" />
              {viewing.description && <DialogDescription className="whitespace-pre-line">{viewing.description}</DialogDescription>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
