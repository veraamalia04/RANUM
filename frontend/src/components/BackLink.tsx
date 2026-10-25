import { ArrowLeft } from 'lucide-react'

export default function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <a href={`#${to}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft size={16} aria-hidden /> {children}
    </a>
  )
}
