import { Angry, Frown, Laugh, Lightbulb, Meh, Moon, Smile, Zap, type LucideIcon } from 'lucide-react'

// Ids must match backend/Models/Moods.cs
export const MOODS: { id: string; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'senang', label: 'Senang', icon: Smile, color: '#ffb800' },
  { id: 'gembira', label: 'Gembira', icon: Laugh, color: '#ff8a00' },
  { id: 'semangat', label: 'Semangat', icon: Zap, color: '#ff5e3a' },
  { id: 'penasaran', label: 'Penasaran', icon: Lightbulb, color: '#2dbe60' },
  { id: 'ngantuk', label: 'Ngantuk', icon: Moon, color: '#7c6cf2' },
  { id: 'biasa', label: 'Biasa', icon: Meh, color: '#3fa7d6' },
  { id: 'sedih', label: 'Sedih', icon: Frown, color: '#5b8def' },
  { id: 'marah', label: 'Marah', icon: Angry, color: '#e5484d' },
]

export const findMood = (id: string | null) => MOODS.find((m) => m.id === id)
