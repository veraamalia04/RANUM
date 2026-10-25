import { Balloon, Butterfly, Cloud, Pencil, Rainbow, SunFace } from '../components/Decorations'
import Footer from '../components/Footer'
import CuriousSection from './landing/CuriousSection'
import { navLinks, scrollToSection, socialLinks } from './landing/data'
import DiscoverSection from './landing/DiscoverSection'
import FinalCta from './landing/FinalCta'
import GrowthSection from './landing/GrowthSection'
import Hero from './landing/Hero'
import JourneySection from './landing/JourneySection'
import LandingNav from './landing/LandingNav'

// Public landing page for visitors who are not signed in. Every "Start Exploring" leads to #/login.
export default function LandingPage() {
  return (
    // overflow-x-clip: the absolute decorations must never cause a horizontal scroll
    <div className="overflow-x-clip">
      <LandingNav />
      <main>
        <Hero />
        {/* Yellow "paper" background; each section inside is a cream card (paperCard) */}
        <div className="relative isolate grid gap-6 bg-sun/45 px-3 py-8">
          {/* Scenery peeking out at the page edges, like the design */}
          <Rainbow className="absolute top-[38%] -left-24 -z-10 hidden w-64 rotate-[70deg] lg:block" />
          <Cloud className="absolute top-[28%] -right-10 -z-10 hidden w-40 lg:block" />
          <Cloud className="absolute top-[62%] -left-12 -z-10 hidden w-36 lg:block" />
          <SunFace className="absolute top-[72%] -right-6 -z-10 hidden w-24 lg:block" />
          <Balloon className="absolute top-[8%] -left-1 -z-10 hidden w-10 text-peach lg:block motion-safe:animate-drift" />
          <Balloon className="absolute top-[50%] right-1 -z-10 hidden w-9 text-sky lg:block motion-safe:animate-drift motion-safe:[animation-delay:-3s]" />
          <Butterfly className="absolute top-[18%] right-2 hidden w-10 lg:block motion-safe:animate-drift motion-safe:[animation-delay:-1s]" />
          <Butterfly className="absolute top-[84%] left-2 hidden w-9 lg:block motion-safe:animate-drift motion-safe:[animation-delay:-4s]" />
          <Pencil className="absolute bottom-24 -right-1 z-10 hidden w-8 -rotate-[30deg] lg:block" />
          <DiscoverSection />
          <CuriousSection />
          <JourneySection />
          <GrowthSection />
        </div>
        <FinalCta />
      </main>
      <Footer className="mt-0" links={navLinks.map((l) => ({ label: l.label, onClick: () => scrollToSection(l.section) }))} socials={socialLinks} />
    </div>
  )
}
