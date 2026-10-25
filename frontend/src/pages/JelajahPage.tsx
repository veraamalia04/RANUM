import { useState } from 'react'
import { GraduationCap, Palette } from 'lucide-react'
import CategoryChips from '../components/CategoryChips'
import { Flower, SectionTitle } from '../components/Decorations'
import EmptyState from '../components/EmptyState'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import Loader from '../components/Loader'
import MascotLayout from '../components/MascotLayout'
import { NativeSelect, NativeSelectOption } from '../components/ui/native-select'
import { KELAS, type Post, type User } from '../lib/api'
import { categoryQuery, type Category } from '../lib/categories'
import { useFetch } from '../lib/hooks'
import { navigate } from '../lib/router'
import PostComposer from './jelajah/PostComposer'
import PostCard from './jelajah/PostCard'

// The karya feed: a Siswa sees their kelas, their friends and the teachers; staff see everything (filterable by kelas).
// The feed sits in the middle column with the RANUM mascot on both sides (MascotLayout).
// The category filter lives in the URL (#/jelajah?kategori=Seni,Musik) so Beranda can link to it and Back works.
export default function JelajahPage({ me, categories }: { me: User; categories: Category[] }) {
  const [kelas, setKelas] = useState('')
  const params = [kelas && `kelas=${kelas}`, categoryQuery(categories)].filter(Boolean).join('&')
  const { data, error, reload } = useFetch<Post[]>(params ? `/posts?${params}` : '/posts')
  const filter = (next: Category[]) => navigate(next.length ? `/jelajah?kategori=${next.join(',')}` : '/jelajah')

  return (
    <MascotLayout left="Ayo bagikan karya terbaikmu hari ini!" right="Jangan lupa beri komentar yang baik, ya!">
      <div className="relative grid gap-5">
        <Flower className="absolute -top-2 right-2 size-8 text-sky" />
        <div className="grid gap-1">
          <SectionTitle as="h1">Jelajah Karya</SectionTitle>
          <p className="text-muted-foreground">Lihat ide seru dari teman-temanmu, lalu beri komentar yang menyemangati!</p>
        </div>

        <PostComposer me={me} onPosted={reload} />

        <CategoryChips label="Filter kategori karya" value={categories} onChange={filter} allLabel="Semua" />

        {me.role !== 'Siswa' && (
          <Field label="Tampilkan kelas" inputIcon={GraduationCap}>
            <NativeSelect value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full">
              <NativeSelectOption value="">Semua kelas</NativeSelectOption>
              {KELAS.map((k) => <NativeSelectOption key={k} value={k}>Kelas {k}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
        )}

        <ErrorText error={error} />
        {!data ? <Loader /> : data.length === 0 ? (
          <EmptyState icon={Palette}>
            {categories.length ? 'Belum ada karya di kategori ini.' : 'Belum ada karya di sini. Yuk unggah karya pertamamu!'}
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            {data.map((p, i) => <PostCard key={p.id} post={p} index={i} onDeleted={reload} />)}
          </div>
        )}
      </div>
    </MascotLayout>
  )
}

