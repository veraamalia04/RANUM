import { Brush, ListChecks, PenLine, type LucideIcon } from 'lucide-react'
import type { Category } from './categories'

export type QuestionType = 'PilihanGanda' | 'Essay' | 'Menggambar'

export const QUESTION_TYPES: Record<QuestionType, { label: string; icon: LucideIcon; color: string }> = {
  PilihanGanda: { label: 'Pilihan Ganda', icon: ListChecks, color: '#3fa7d6' },
  Essay: { label: 'Essay', icon: PenLine, color: '#7c6cf2' },
  Menggambar: { label: 'Menggambar', icon: Brush, color: '#ff5e3a' },
}

export const LETTERS = 'ABCDEF'

export type Question = { id: number; type: QuestionType; text: string; options: string[]; correctIndex: number | null }

export type Answer = {
  id: number
  questionId: number
  choiceIndex: number | null
  text: string | null
  imageUrl: string | null
  score: number | null
}

export type Submission = {
  id: number
  studentId: number
  studentName: string
  studentAvatar: string | null
  submittedAt: string
  score: number | null
  feedback: string | null
  answers: Answer[]
}

type ChallengeBase = {
  id: number
  title: string
  description: string | null
  // Only a suggestion: every Siswa can take every challenge. null = semua kelas
  kelas: number | null
  categories: Category[]
  createdById: number
  createdBy: string
  createdAt: string
  hasPoster: boolean
  // Siswa only: the challenge is in their list
  accepted: boolean
}

export const kelasLabel = (kelas: number | null) => (kelas ? `Disarankan kelas ${kelas}` : 'Semua kelas')

export const posterSrc = (id: number) => `/api/challenges/${id}/poster`

export type ChallengeSummary = ChallengeBase & {
  types: QuestionType[]
  questionCount: number
  submissionCount: number
  pendingCount: number
  mySubmissionId: number | null
  myScore: number | null
  // Siswa only: answers are saved as a draft
  hasDraft: boolean
}

export type ChallengeDetail = ChallengeBase & { questions: Question[]; mySubmission: Submission | null }

// Where a challenge stands for the signed-in Siswa (the tabs on #/challenges)
export type ChallengeStatus = 'baru' | 'dikerjakan' | 'menunggu' | 'selesai'
export const challengeStatus = (c: ChallengeSummary): ChallengeStatus =>
  c.mySubmissionId !== null ? (c.myScore === null ? 'menunggu' : 'selesai') : c.accepted ? 'dikerjakan' : 'baru'

export type Result = { challengeId: number; title: string; score: number; feedback: string | null; gradedAt: string }

// Tailwind classes for a score badge
export const scoreColor = (score: number) =>
  score >= 85 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
