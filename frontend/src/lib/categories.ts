import { BookOpen, Laptop, MessageCircle, Music, Palette, Trees, Trophy, type LucideIcon } from 'lucide-react'

// Talent categories shared by challenges and karya. Must match the Category enum in backend/Models/Category.cs.
// `bg` is the pastel tint for cards and chips, `color` colors and fills the icon.
export type Category = 'Seni' | 'Musik' | 'Teknologi' | 'Olahraga' | 'Komunikasi' | 'Alam' | 'Bahasa'

export const CATEGORIES: Record<Category, { label: string; short: string; icon: LucideIcon; bg: string; color: string }> = {
  Seni: { label: 'Seni & Kreativitas', short: 'Seni', icon: Palette, bg: 'bg-peach/25', color: 'fill-sun text-peach' },
  Musik: { label: 'Musik', short: 'Musik', icon: Music, bg: 'bg-blush/40', color: 'fill-blush text-[#e8667f]' },
  Teknologi: { label: 'Teknologi', short: 'Teknologi', icon: Laptop, bg: 'bg-sky/40', color: 'fill-sky text-[#4a8fd6]' },
  Olahraga: { label: 'Olahraga', short: 'Olahraga', icon: Trophy, bg: 'bg-sun/50', color: 'fill-sun text-[#e9a800]' },
  Komunikasi: { label: 'Komunikasi', short: 'Komunikasi', icon: MessageCircle, bg: 'bg-sky/30', color: 'fill-[#c9b8f5] text-[#7d64d6]' },
  Alam: { label: 'Alam & Lingkungan', short: 'Alam', icon: Trees, bg: 'bg-mint', color: 'fill-[#7cc46b] text-primary' },
  Bahasa: { label: 'Bahasa & Cerita', short: 'Bahasa', icon: BookOpen, bg: 'bg-blush/30', color: 'fill-sky text-[#4a8fd6]' },
}

export const ALL_CATEGORIES = Object.keys(CATEGORIES) as Category[]

// "Seni,Musik" in the URL (?kategori=) <-> ['Seni', 'Musik'], ignoring anything unknown
export const parseCategories = (value: string | null) =>
  (value ?? '').split(',').filter((c): c is Category => c in CATEGORIES)

// API filter: ?category=Seni&category=Musik matches items with any of them
export const categoryQuery = (categories: Category[]) =>
  categories.map((c) => `category=${c}`).join('&')
