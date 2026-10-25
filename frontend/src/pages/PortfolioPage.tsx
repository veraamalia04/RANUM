import { Leaf, SectionTitle } from '../components/Decorations'
import ErrorText from '../components/ErrorText'
import Loader from '../components/Loader'
import type { PortfolioItem, User } from '../lib/api'
import { useFetch } from '../lib/hooks'
import PortfolioGrid from './portfolio/PortfolioGrid'
import PortfolioUpload from './portfolio/PortfolioUpload'

// "Portofolioku": the signed-in Siswa's own portfolio
export default function PortfolioPage({ me }: { me: User }) {
  const { data, error, reload } = useFetch<PortfolioItem[]>(`/users/${me.id}/portfolio`)

  return (
    <div className="relative mx-auto grid max-w-3xl gap-5">
      <Leaf className="absolute -top-1 right-4 size-8 -rotate-12 text-mint" />
      <div className="grid gap-1">
        <SectionTitle as="h1">Portofolioku</SectionTitle>
        <p className="text-muted-foreground">Simpan sertifikat, piagam, dan karya terbaikmu di sini. Teman dan gurumu bisa melihatnya.</p>
      </div>
      <PortfolioUpload onSaved={reload} />
      <ErrorText error={error} />
      {!data ? <Loader /> : data.length === 0
        ? <p className="text-center text-muted-foreground">Portofoliomu masih kosong.</p>
        : <PortfolioGrid items={data} onDeleted={reload} />}
    </div>
  )
}
