import AcceptButton from '../components/AcceptButton'
import BackLink from '../components/BackLink'
import ErrorText from '../components/ErrorText'
import Loader from '../components/Loader'
import MascotLayout from '../components/MascotLayout'
import { Badge } from '../components/ui/badge'
import type { User } from '../lib/api'
import { CATEGORIES } from '../lib/categories'
import { kelasLabel, posterSrc, type ChallengeDetail } from '../lib/challenge'
import { useFetch } from '../lib/hooks'
import AnswerForm from './challenge/AnswerForm'
import MyResult from './challenge/MyResult'
import TeacherView from './challenge/TeacherView'

export default function ChallengeDetailPage({ id, me }: { id: number; me: User }) {
  const { data: challenge, error, reload } = useFetch<ChallengeDetail>(`/challenges/${id}`)

  if (error) return <ErrorText error={error === 'Not Found' ? 'Challenge tidak ditemukan' : error} />
  if (!challenge) return <Loader />

  return (
    <MascotLayout left="Kerjakan pelan-pelan, jawabanmu tersimpan otomatis!" right="Kamu hebat! Semangat terus, ya!">
      <div className="grid gap-4">
        <BackLink to="/challenges">Tantangan</BackLink>
        {challenge.hasPoster && <img src={posterSrc(challenge.id)} alt={`Poster ${challenge.title}`} className="max-h-96 w-full rounded-3xl border object-cover" />}
        <header className="grid gap-2">
          <h1 className="text-3xl font-bold">{challenge.title}</h1>
          {challenge.description && <p className="text-muted-foreground">{challenge.description}</p>}
          <div className="flex flex-wrap gap-1.5">
            {challenge.categories.map((c) => <Badge key={c}>{CATEGORIES[c].label}</Badge>)}
            <Badge variant="outline">{kelasLabel(challenge.kelas)}</Badge>
            <Badge variant="outline">{challenge.questions.length} soal</Badge>
            <Badge variant="outline">dari {challenge.createdBy}</Badge>
          </div>
        </header>

        {me.role !== 'Siswa' ? (
          <TeacherView challenge={challenge} canGrade={me.role === 'Admin' || challenge.createdById === me.id} />
        ) : challenge.mySubmission ? (
          <MyResult challenge={challenge} submission={challenge.mySubmission} />
        ) : !challenge.accepted ? (
          // Accepting reloads this page, which then shows the answer form right away
          <AcceptButton id={challenge.id} onAccepted={reload} />
        ) : (
          <AnswerForm challenge={challenge} onSubmitted={reload} />
        )}
      </div>
    </MascotLayout>
  )
}
