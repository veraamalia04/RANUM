import { useState } from 'react'
import { ArrowRight, Menu } from 'lucide-react'
import { Underline } from '../../components/Decorations'
import { Button, buttonVariants } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../../components/ui/sheet'
import { navLinks, scrollToSection } from './data'

const linkClass = 'relative rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

// Sticky floating pill: logo, section links, Login + Start Exploring; on mobile the links move into a Sheet
export default function LandingNav() {
  const [open, setOpen] = useState(false)
  const go = (section: string) => { setOpen(false); scrollToSection(section) }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 rounded-full bg-card px-5 shadow-md">
        <button type="button" onClick={() => go('home')} className="rounded-full font-heading text-3xl font-extrabold tracking-wide text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          RANUM
        </button>
        <nav aria-label="Menu utama" className="ml-6 hidden items-center gap-3 md:flex">
          {navLinks.map((l, i) => (
            <button key={l.section} type="button" onClick={() => go(l.section)} aria-current={i === 0 ? 'true' : undefined} className={linkClass}>
              {l.label}
              {i === 0 && <Underline className="absolute inset-x-3 -bottom-0.5 w-auto text-primary" />}
            </button>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <a href="#/login" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-primary/40 bg-transparent px-5' })}>Login</a>
          <a href="#/login" className={buttonVariants({ variant: 'sun', size: 'lg', className: 'px-5' })}>Start Exploring <ArrowRight aria-hidden /></a>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="ml-auto md:hidden" aria-label="Buka menu" />}>
            <Menu />
          </SheetTrigger>
          <SheetContent className="bg-background p-6">
            <SheetTitle className="font-heading text-3xl font-extrabold text-primary">RANUM</SheetTitle>
            <nav aria-label="Menu utama" className="grid gap-1">
              {navLinks.map((l) => (
                <button key={l.section} type="button" onClick={() => go(l.section)} className={`${linkClass} text-left text-lg`}>{l.label}</button>
              ))}
            </nav>
            <Separator />
            <a href="#/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>Login</a>
            <a href="#/login" className={buttonVariants({ variant: 'sun', size: 'lg' })}>Start Exploring <ArrowRight aria-hidden /></a>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
