import { cn } from '../../lib/utils'

// One multiple choice option, shared by the answer form and the answer review
export const choiceClass = (state: 'selected' | 'correct' | 'wrong' | null) =>
  cn('flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
    state === 'selected' && 'border-primary bg-primary/5 ring-2 ring-primary/30',
    state === 'correct' && 'border-green-500 bg-green-50 text-green-800',
    state === 'wrong' && 'border-red-400 bg-red-50 text-red-800',
    state === null && 'hover:bg-muted/60')
