import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export default function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
      <Icon size={36} aria-hidden />
      <p>{children}</p>
    </div>
  )
}
