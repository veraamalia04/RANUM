import { cn } from '../lib/utils'

// A footer link is either a route (href) or an action, like scrolling to a landing section
export type FooterLink = { label: string; href?: string; onClick?: () => void }
export type SocialLink = { label: 'Instagram' | 'YouTube' | 'TikTok'; url: string }

const linkClass = 'rounded-full px-2 py-1 text-sm text-background/90 hover:text-background focus-visible:ring-2 focus-visible:ring-sun focus-visible:outline-none'

// Green wavy RANUM footer, shared by the app and the landing page
export default function Footer({ links, socials = [], className }: { links: FooterLink[]; socials?: SocialLink[]; className?: string }) {
  // No fake "#" links: a network only shows up once its URL is filled in
  const shownSocials = socials.filter((s) => s.url)
  return (
    <footer className={cn('relative mt-16 bg-primary text-background', className)}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden className="absolute bottom-full left-0 h-8 w-full text-primary sm:h-12">
        <path fill="currentColor" d="M0 40C180 10 360 0 540 20s360 40 540 20 270-40 360-30V60H0z" />
      </svg>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
        <div>
          <p className="font-heading text-3xl font-extrabold tracking-wide">RANUM</p>
          <p className="text-sm text-background/85">Grow Into Yourself.</p>
        </div>
        <nav aria-label="Menu footer" className="flex flex-wrap gap-x-3 gap-y-1">
          {links.map((l) => l.href
            ? <a key={l.label} href={l.href} className={linkClass}>{l.label}</a>
            : <button key={l.label} type="button" onClick={l.onClick} className={linkClass}>{l.label}</button>)}
        </nav>
        {shownSocials.length > 0 && (
          <ul className="flex gap-2">
            {shownSocials.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full bg-background/15 hover:bg-background/25 focus-visible:ring-2 focus-visible:ring-sun focus-visible:outline-none">
                  <SocialIcon name={s.label} />
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-background/80">© 2026 RANUM</p>
      </div>
    </footer>
  )
}

// lucide-react 1.x dropped brand icons, so these are simple hand-made outlines
function SocialIcon({ name }: { name: SocialLink['label'] }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'size-5', 'aria-hidden': true }
  if (name === 'Instagram') return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
  if (name === 'YouTube') return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></svg>
  return <svg {...props}><path d="M14 3v11a4 4 0 1 1-4-4" /><path d="M14 3c0 3 2.5 5 5 5" /></svg>
}
