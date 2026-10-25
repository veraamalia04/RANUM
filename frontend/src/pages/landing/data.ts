import { Heart, Laptop, Lightbulb, MessageCircle, Music, Palette, Puzzle, Search, Sprout, Star, Trophy, Users } from 'lucide-react'
import type { SocialLink } from '../../components/Footer'

// All landing page content lives here (copy from landing-page-belum-login.jpeg); the sections only .map() over it.

// Cream card on the yellow page background, used by every middle section
export const paperCard = 'mx-auto w-full max-w-6xl rounded-[2.5rem] bg-background shadow-sm'

// The hash router owns "#/...", so section links scroll instead of using "#id" anchors
export const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export const navLinks = [
  { label: 'Home', section: 'home' },
  { label: 'Explore', section: 'explore' },
  { label: 'How It Works', section: 'how-it-works' },
  { label: 'About', section: 'about' },
]

// `className` tints the card, `iconClass` colors the big icon like the illustrations in the design
export const pillars = [
  { title: 'DISCOVER', text: 'Temukan hal-hal yang kamu sukai.', icon: Palette, className: 'bg-sun/40', iconClass: 'fill-sun text-peach' },
  { title: 'EXPLORE', text: 'Coba berbagai aktivitas dan tantangan.', icon: Puzzle, className: 'bg-sky/40', iconClass: 'fill-sky text-[#4a8fd6]' },
  { title: 'GROW', text: 'Kembangkan kemampuanmu sedikit demi sedikit.', icon: Sprout, className: 'bg-mint', iconClass: 'fill-[#7cc46b] text-primary' },
]

export const curiosityCategories = [
  { title: 'Creative', description: 'Lukis, desain, buat karya!', icon: Palette, className: 'bg-blush/35', iconClass: 'fill-sun text-peach' },
  { title: 'Music', description: 'Dengar, belajar, berkarya!', icon: Music, className: 'bg-sky/35', iconClass: 'fill-[#7fbef5] text-[#4a8fd6]' },
  { title: 'Technology', description: 'Kode, bangun, inovasi!', icon: Laptop, className: 'bg-mint', iconClass: 'fill-sky text-[#4a8fd6]' },
  { title: 'Communication', description: 'Berani berbicara, luas pertemanan!', icon: MessageCircle, className: 'bg-[#ebe4fb]', iconClass: 'fill-[#c9b8f5] text-[#7d64d6]' },
  { title: 'Sports', description: 'Jaga kesehatan, raih semangat!', icon: Trophy, className: 'bg-peach/20', iconClass: 'fill-sun text-peach' },
]

// `className` is the blob behind the icon, `badge` the number bubble on top
export const journeySteps = [
  { number: '01', title: 'DISCOVER', text: 'Kenali minat dan potensimu.', icon: Search, className: 'bg-sun/45', badge: 'bg-sun text-primary' },
  { number: '02', title: 'EXPLORE', text: 'Ikuti aktivitas dan tantangan.', icon: Star, className: 'bg-sky/45', badge: 'bg-[#4a8fd6] text-white' },
  { number: '03', title: 'GROW', text: 'Bangun karya dan perkembanganmu.', icon: Sprout, className: 'bg-mint', badge: 'bg-primary text-primary-foreground' },
]

// Example numbers for the "Show Your Growth" illustration, not real data.
// `bar` colors the bar inside shadcn's Progress (written out in full so Tailwind sees the classes)
export const growthSkills = [
  { label: 'Creativity', value: 75, icon: Star, iconClass: 'fill-sun text-sun', bar: '[&_[data-slot=progress-indicator]]:bg-primary' },
  { label: 'Curiosity', value: 65, icon: Lightbulb, iconClass: 'text-peach', bar: '[&_[data-slot=progress-indicator]]:bg-sun' },
  { label: 'Collaboration', value: 50, icon: Users, iconClass: 'text-[#4a8fd6]', bar: '[&_[data-slot=progress-indicator]]:bg-[#5aa9f0]' },
  { label: 'Confidence', value: 35, icon: Heart, iconClass: 'fill-blush text-[#e8667f]', bar: '[&_[data-slot=progress-indicator]]:bg-blush' },
]

// Fill in a URL to show that network's icon in the footer
export const socialLinks: SocialLink[] = [
  { label: 'Instagram', url: '' },
  { label: 'YouTube', url: '' },
  { label: 'TikTok', url: '' },
]
