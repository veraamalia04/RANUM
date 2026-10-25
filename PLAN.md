# PLAN.md

## Tahap 2 (sudah dikerjakan, 2026-10-24): Kategori untuk karya, dan alur Tantangan

> Satu penyimpangan kecil dari rencana: kartu di tab **Baru** membuka halaman detail, lalu tombol "Terima & Kerjakan" di sana langsung menampilkan form pengerjaan. Tombol tidak ditaruh langsung di kartu, karena kartunya adalah link dan tombol di dalam link tidak valid untuk aksesibilitas.

### A. Kategori bersama

Kategori yang ada di "Temukan Bakatmu" (Seni, Musik, Teknologi, Olahraga, Komunikasi, Alam, Bahasa) menjadi **satu daftar kategori untuk seluruh aplikasi**. Satu karya bisa punya **banyak kategori**. Mengklik sebuah kategori memfilter karya dan tantangan berdasarkan kategori itu.

**Keputusan** (✔ = sudah dikonfirmasi):
1. **Daftar kategori:** tetap 7 kategori yang sekarang. Di Beranda hanya 5 yang terlihat karena barisnya bisa digeser; Alam dan Bahasa ada di ujung kanan.
2. **Kategori karya:** boleh 0 sampai 7 kategori per karya, dipilih dengan chip saat mengunggah. Karya tanpa kategori tetap boleh.
3. ✔ **Tantangan juga bisa punya banyak kategori.** Kategori tunggal yang sudah tersimpan di challenge dipindahkan otomatis oleh migration.
4. ✔ **Filter bisa memilih banyak kategori sekaligus.** Satu klik menyalakan sebuah kategori, klik lagi mematikannya, dan ada tombol "Semua" untuk menghapus filter.
   - Hasilnya berisi item yang punya **salah satu** kategori terpilih (ATAU). Contoh: Seni + Musik menampilkan karya Seni, karya Musik, dan karya yang punya keduanya.
   - Alasannya: kalau syaratnya harus punya semua kategori (DAN), hasilnya hampir selalu kosong untuk anak-anak.
5. ✔ **Filter ada di Beranda dan di Jelajah.**
   - "Temukan Bakatmu" di Beranda tetap ada dan sekarang bisa memilih banyak kategori. Pilihannya memfilter carousel "Tantangan Seru Untukmu" dan foto di "Karya Teman".
   - Jelajah punya baris chip yang sama untuk memfilter feed karya, dengan pilihan tersimpan di URL (`#/jelajah?kategori=Seni,Musik`).
   - Halaman Tantangan juga punya baris chip yang sama.
6. **Mengubah kategori setelah karya diunggah:** belum bisa, karena karya memang tidak bisa diedit.

**Backend:**
- Ganti nama enum `ChallengeCategory` menjadi `Category`. Datanya disimpan sebagai string, jadi isi database tidak berubah karena nama enum.
- `Post.Categories` dan `Challenge.Categories` bertipe `List<Category>`. Ini primitive collection EF Core yang disimpan sebagai array JSON di satu kolom, jadi tidak perlu tabel penghubung.
  - Filter: `p.Categories.Contains(category)`. EF Core menerjemahkannya ke `json_each` di SQLite.
  - Kalau ternyata tidak bisa diterjemahkan, filter dilakukan di memori setelah query. Polanya sama dengan catatan `Distinct()` di `CLAUDE.md`.
- Migration `Categories`:
  - Tambah kolom `Posts.Categories` dan `Challenges.Categories`.
  - Salin data lama dengan SQL: `UPDATE Challenges SET Categories = json_array(Category) WHERE Category IS NOT NULL`.
  - Hapus kolom `Challenges.Category`.
- Request:
  - `CreatePostRequest` dan `CreateChallengeRequest` menerima `categories: Category[]` (opsional).
  - Kategori dobel dibuang di handler dengan `Distinct()`.
  - Nilai yang bukan kategori langsung ditolak 400 oleh JSON enum binding.
- Response: `PostResponse`, `ChallengeSummaryResponse`, dan `ChallengeDetailResponse` mengirim `categories`.
- Endpoint (kategori bisa diulang):
  - `GET /api/posts?category=Seni&category=Musik`
  - `GET /api/challenges?category=Seni&category=Musik`

  Parameternya `Category[]? category`. Filternya `p.Categories.Any(c => categories.Contains(c))`, jadi hasilnya item yang punya salah satu kategori terpilih. Kedua endpoint tetap memakai aturan visibilitas yang sudah ada.

**Frontend:**
- `CATEGORIES` dipindah dari `lib/challenge.ts` ke **`lib/categories.ts`**, karena sekarang dipakai bersama oleh karya dan tantangan.
- Komponen baru `components/CategoryChips.tsx`: selalu bisa memilih banyak kategori, dengan `value: Category[]` dan `onChange`. Komponen ini dipakai di form unggah karya, form buat tantangan, filter Jelajah, filter Tantangan, dan "Temukan Bakatmu" di Beranda.
  - Isinya ikon kategori dengan warna pastelnya. Chip yang aktif diberi border hijau dan tanda centang.
  - Chip ditandai `aria-pressed`, supaya bisa dipakai dengan keyboard dan pembaca layar.
  - Prop `big` menampilkan versi bulat besar seperti desain "Temukan Bakatmu".
- `PostComposer` mendapat baris chip "Kategori karyamu".
- `PostCard` menampilkan chip kategori. Mengklik chip membuka `#/jelajah?kategori=…`.
- Di `ChallengeFormPage`, `NativeSelect` kategori diganti dengan `CategoryChips multiple`.
- **Query di hash router:** `router.ts` mendapat helper `useHashRoute()` yang mengembalikan `{ path, query }`.
  - `App.tsx` mencocokkan route berdasarkan `path` saja, supaya `#/jelajah?kategori=Seni` tetap membuka JelajahPage.
  - Mengganti filter memanggil `navigate('/jelajah?kategori=Seni,Musik')`, supaya filter tersimpan di URL dan tombol Back tetap bekerja.
- "Temukan Bakatmu" di Beranda memakai `CategoryChips big` (bisa memilih banyak) dan memfilter carousel serta "Karya Teman" di Beranda. Ditambah link "Lihat karya kategori ini di Jelajah →" yang membawa pilihan kategori yang sama.

### B. Alur Tantangan

**Masalah sekarang:** setelah siswa menekan Accept di Beranda, Dialog hanya tertutup dan siswa harus mencari tantangan itu sendiri. Siswa juga tidak punya menu Tantangan di nav, karena aksesnya cuma link "Lihat tantanganku".

**Keputusan default (ubah kalau tidak sesuai):**
1. **Terima, lalu langsung mengerjakan.** Setelah Accept berhasil (di carousel Beranda maupun di halaman detail), siswa langsung diarahkan ke `#/challenges/:id`. Halaman itu sudah menampilkan form pengerjaan (`AnswerForm`) untuk tantangan yang sudah diterima, jadi tidak perlu halaman baru. Teks tombol diganti dari "Accept" menjadi **"Terima & Kerjakan"**.
2. **Menu nav khusus "Tantangan"** untuk Siswa, dengan ikon `Trophy`, mengarah ke `#/challenges`. Urutan nav Siswa menjadi: Beranda, Tantangan, Jelajah, Teman, Portofolioku.
   - Bottom nav mobile berisi 5 item. Label "Portofolioku" disingkat menjadi "Portofolio" di mobile supaya muat di lebar 375 px.
   - Nav staff tidak berubah, karena staff sudah punya menu "Challenge". Labelnya diseragamkan menjadi "Tantangan".
3. **Halaman Tantangan (`#/challenges`) untuk Siswa menjadi pusat semua tantangan,** dengan tab `Segmented`:
   - **Baru:** belum diterima. Tombol "Terima & Kerjakan" langsung membuka form pengerjaan.
   - **Dikerjakan:** sudah diterima tapi belum dikumpulkan. Tombolnya "Lanjutkan".
   - **Menunggu nilai:** sudah dikumpulkan dan masih menunggu penilaian guru.
   - **Selesai:** sudah dinilai, dengan `ScoreBadge`.

   Di atas tab ada `CategoryChips` untuk filter kategori. Tab yang terbuka saat masuk adalah "Dikerjakan" kalau isinya ada, kalau tidak "Baru".
4. ✔ **Draft jawaban:** jawaban tersimpan otomatis, jadi siswa bisa keluar lalu melanjutkan nanti, bahkan dari perangkat lain (lihat bagian C).
5. Tab dan tombol "Lanjutkan" memakai data yang sudah ada di `GET /api/challenges` (`accepted`, `mySubmissionId`, `myScore`), ditambah field baru `hasDraft`.

**Frontend:**
- `AcceptButton` mendapat prop `goToWork`. Setelah berhasil, tombol ini memanggil `navigate(`/challenges/${id}`)`, dipakai oleh `ChallengeCarousel` dan `ChallengeDetailPage`.
- `TopBar`: tambahkan `{ to: '/challenges', label: 'Tantangan', icon: Trophy }` ke nav Siswa, dan hapus pemetaan "/challenges → Beranda" di `sectionOf`.
- `ChallengesPage`: tambahkan tab untuk Siswa (logika pengelompokan di `lib/challenge.ts`: `challengeStatus(c)` → `'baru' | 'dikerjakan' | 'menunggu' | 'selesai'`). Kartunya memakai gaya kartu pastel seperti di Beranda.
- `ChallengeDetailPage`: tampilan disesuaikan dengan tema baru, `BackLink` diarahkan ke "Tantangan", dan progress pengerjaan dibuat lebih menonjol.
- Link "Lihat tantanganku" di Beranda tetap ada, mengarah ke `#/challenges`.

### C. Draft jawaban tantangan

**Keputusan default (ubah kalau tidak sesuai):**
1. **Draft disimpan di server**, bukan di browser. Anak sering berganti perangkat (komputer sekolah lalu tablet di rumah), dan draft di browser hilang kalau data browser dihapus.
2. **Simpan otomatis**, sekitar 1,5 detik setelah jawaban terakhir berubah. Tidak ada tombol "Simpan draft". Di form muncul status kecil: "Menyimpan…" → "Tersimpan otomatis 10.42".
3. **Satu draft per siswa per tantangan.** Draft hanya bisa dibuat untuk tantangan yang sudah diterima dan belum dikumpulkan.
4. **Draft terhapus otomatis** saat jawaban dikumpulkan, atau saat tantangannya dihapus guru.
5. **Gambar dan foto ikut tersimpan di draft**, dengan validasi JPEG yang sama seperti saat mengumpulkan jawaban. Dengan begitu, isi draft selalu aman ditampilkan sebagai `<img>`.
6. **Guru tidak melihat draft.** Guru hanya melihat jawaban yang sudah dikumpulkan.

**Backend:**
- Entity `ChallengeDraft { Id, ChallengeId, StudentId, AnswersJson, UpdatedAt }`.
  - Index unik pada `(ChallengeId, StudentId)`.
  - Cascade dari `Challenge`, jadi draft ikut terhapus saat tantangan dihapus.
  - `AnswersJson` berisi `List<AnswerInput>` yang di-serialize, memakai bentuk jawaban yang sama dengan saat mengumpulkan.
  - Isinya sengaja tidak dinormalisasi, karena draft hanya dibaca kembali oleh form.
- Endpoint (policy `Siswa`):

  | Method | Path | Aturan |
  |---|---|---|
  | GET | `/api/challenges/{id}/draft` | `{ answers, updatedAt }`, atau 404 kalau belum ada draft |
  | PUT | `/api/challenges/{id}/draft` | Body `{ answers: AnswerInput[] }`. Buat atau timpa draft → 204. Belum diterima → 400. Sudah dikumpulkan → 409. Kelas lain → 404. `imageUrl` yang bukan JPEG → 400 |

- `ChallengesHandler.Submit` menghapus draft siswa itu di transaksi yang sama.
- `ChallengeSummaryResponse` mendapat `hasDraft` (boolean).

**Frontend:**
- `AnswerForm`:
  - Saat dibuka, form mengambil `GET …/draft` dan mengisi jawaban dari draft kalau ada.
  - Setiap perubahan jawaban menjadwalkan `PUT …/draft` 1,5 detik kemudian (debounce dengan `setTimeout` di `useEffect`, tanpa library baru).
  - Status penyimpanan ditampilkan di sebelah progress.
  - Kalau penyimpanan gagal, misalnya karena koneksi putus, muncul pesan "Belum tersimpan, cek koneksimu". Jawaban tetap ada di layar, dan percobaan berikutnya terjadi saat jawaban berubah lagi.
- Tab "Dikerjakan" di halaman Tantangan menampilkan label "Draft tersimpan" untuk tantangan yang punya `hasDraft`.

### Pengecekan

- `smoke-test.sh`:
  - Karya dengan `categories: ["Seni","Musik"]` → 201.
  - `GET /posts?category=Musik` berisi karya itu, sedangkan `?category=Olahraga` tidak.
  - Kategori tidak dikenal → 400.
  - Challenge dengan beberapa kategori, lalu filter `GET /challenges?category=…`.
  - Filter dua kategori mengembalikan item yang punya salah satunya.
  - Kategori dobel hanya tersimpan satu kali.
  - Draft:
    - PUT sebelum tantangan diterima → 400. Setelah diterima → 204, dan GET mengembalikan isi draft itu.
    - Siswa lain atau siswa kelas lain → 404.
    - `imageUrl` PNG → 400.
    - Setelah jawaban dikumpulkan, GET draft → 404 dan PUT draft → 409.
- `seed-demo/seed.py` diperbarui supaya karya dan tantangan contoh punya kategori.
- Puppeteer:
  - Pilih Seni + Musik di Temukan Bakatmu → carousel dan Karya Teman di Beranda terfilter. Lalu buka link ke Jelajah → feed terfilter dengan kategori yang sama.
  - Terima tantangan di Beranda → langsung masuk form pengerjaan.
  - Isi sebagian jawaban, tunggu muncul "Tersimpan otomatis", muat ulang halaman → jawaban masih ada.
  - Tab-tab di halaman Tantangan.
  - Bottom nav 5 item di lebar 375 px tanpa scroll horizontal.
- `npm run build`, `npm run lint`, dan `dotnet build`.
- `CLAUDE.md` diperbarui: kategori bersama (`lib/categories.ts` ↔ enum `Category`), query di hash router, dan nav Tantangan.

### Urutan kerja

1. Backend:
   - Enum `Category`, kolom kategori, dan filter banyak kategori.
   - Entity `ChallengeDraft` beserta endpoint-nya. Draft dihapus saat jawaban dikumpulkan.
   - Satu migration (`CategoriesAndDrafts`) yang juga memindahkan data kategori lama.
   - Smoke test.
2. Frontend dasar: `lib/categories.ts`, `CategoryChips`, dan query di router.
3. Kategori di karya: composer, kartu, dan filter Jelajah.
4. Kategori di tantangan: form guru, filter di halaman Tantangan, dan Temukan Bakatmu yang bisa memilih banyak kategori di Beranda.
5. Alur tantangan: "Terima & Kerjakan", nav Tantangan, dan tab di `ChallengesPage`.
6. Draft otomatis di `AnswerForm`.
7. Perbarui seed demo (kategori dan satu draft milik Vera), cek dengan puppeteer, lalu perbarui `CLAUDE.md`.

---

> **Status tahap 1 (2026-10-24): semua fitur di bawah ini sudah dikerjakan.** Sisa pekerjaan: file ilustrasi asli (`public/images/mascot.png` masih kosong, `ranum-hero.png` dan `sample-drawing.png` belum ada) dan URL media sosial di `pages/landing/data.ts`.

## Fitur yang sudah ada

- **Akun dan login:** login pakai cookie, dengan role Siswa, Guru, dan Admin. Guru membuat akun Siswa, Admin membuat akun Guru atau Siswa, dan akun Admin hanya datang dari seed. Ada halaman ganti password dan tombol demo di halaman login.
- **Kelola Akun** (`#/users`, khusus Guru/Admin): melihat daftar akun dan membuat akun baru.
- **Profil:** avatar dari katalog, mood, bio, tempat lahir, dan tanggal lahir. Siswa wajib mengisi profil dulu sebelum bisa memakai aplikasi. Profil bisa diubah di `#/settings`.
- **Challenge:**
  - Guru/Admin membuat challenge untuk satu kelas, dengan poster opsional.
  - Jenis soal: pilihan ganda, essay, dan menggambar (gambar di canvas atau upload foto).
  - Siswa harus menerima challenge dulu, lalu mengirim jawaban satu kali.
  - Pilihan ganda dinilai otomatis. Essay dan gambar dinilai guru dengan skor 1–100. Skor akhir adalah rata-rata semua soal.
  - Guru/Admin bisa menghapus challenge.
- **Beranda Siswa:** carousel poster challenge yang belum diterima. Challenge yang sudah diterima ada di `#/challenges`, dan hasil yang sudah dinilai muncul di profil.
- **Smoke test** API: `smoke-test.sh`.

## Desain frontend (`design-fe.jpeg`)

Mockup ini adalah **Beranda Siswa** versi desktop. Halaman lain (Login, Dashboard, Portofolio/Detail) hanya tampil sebagai thumbnail kecil dengan catatan "same cheerful vibe", jadi halaman-halaman itu memakai gaya yang sama tanpa layout khusus.

### Gaya visual (tema global)

**Warna.** Ganti token di `frontend/src/index.css`. Primary berubah dari oranye menjadi hijau, jadi `CLAUDE.md` ("primary = orange") juga ikut diperbarui.

| Token | Warna | Dipakai untuk |
|---|---|---|
Nilai warna di bawah mengikuti spesifikasi teks terbaru, yang sedikit berbeda dari palet di gambar.

| Token | Warna | Dipakai untuk |
|---|---|---|
| `--primary` dan `--foreground` | Ranum Green `#2F684E` | Tombol utama, nav aktif, **warna teks utama** (tidak ada hitam murni), dan footer |
| `--background` | Cream `#FFF9E9` | Latar halaman |
| `--color-sun` | Yellow `#FFD68B` | Hero, kartu unggah, tombol CTA ("Mulai Sekarang", "Start Exploring") |
| `--color-sky` | Sky Blue `#A7D8FF` | Kartu trivia, kartu Explore, dan dekorasi |
| `--color-peach` | Orange `#FF9A58` | Aksen kartu |
| `--color-blush` | Soft Pink `#FFB6C1` | Aksen kartu |
| `--color-mint` | Pastel Green `#D9F2C7` (turunan, karena tidak ada di spesifikasi) | Kartu Grow, kartu "Karya Teman", chip "Tersimpan di portofolio" |

- Warna aksen didaftarkan di `@theme` supaya bisa dipakai sebagai class Tailwind, misalnya `bg-sun`, `bg-sky/40`, dan `bg-mint`.
- `--muted-foreground` diganti hijau keabu-abuan, turunan dari Ranum Green, supaya teks sekunder juga tidak hitam atau abu netral. Kontrasnya dicek supaya tetap ≥ 4.5:1 di atas cream.
- Kartu memakai `rounded-2xl` atau `rounded-3xl`, tombol berbentuk pill (`rounded-full`), latar pastel tipis, border halus, dan bayangan lembut.
- Mode gelap tidak dibuat dulu, karena desainnya hanya mode terang.

**Font.**
- Judul memakai **Baloo 2** (`@fontsource-variable/baloo-2`) di `--font-heading`.
- Teks isi memakai **Nunito** (`@fontsource-variable/nunito`) di `--font-sans`, menggantikan Geist. Paket `@fontsource-variable/geist` dihapus.
- Logo "RANUM" berupa teks Baloo 2 extra-bold berwarna `--primary`.

**Dekorasi** ditaruh di **satu file** `components/Decorations.tsx`, bukan banyak file kecil:
- `Flower`, `Leaf`, `Star`, `Sparkle`: ikon lucide (`Flower2`, `Leaf`, `Star`, `Sparkles`) dengan warna pastel.
- `DoodleArrow`, `CurvyLine`, `Underline`, `Blob`: SVG path inline sederhana, karena bentuk ini tidak ada di lucide.
- Semuanya `aria-hidden` dan `pointer-events-none`, menerima `className` untuk posisi absolut, dan disembunyikan di layar kecil kalau menutupi teks.
- Setiap judul section diawali ikon daun (`Sprout`) hijau.
- **Ilustrasi** seperti maskot matahari bertopi wisuda, brokoli, gurita, dan karakter anak **tidak bisa dibuat dengan kode**. File dari desainer ditaruh di `frontend/public/images/`. Di sana sudah ada `mascot.png` yang bisa langsung dipakai.
  - Komponen `Illustration` (di `Decorations.tsx`) menampilkan `<img>`. Kalau file belum ada (`onError`), komponen ini menampilkan fallback berupa blob kuning dan ikon besar, supaya layout tidak rusak.

**Animasi** (CSS saja, tanpa dependency baru):
- `@keyframes float` di `index.css`, dipakai sebagai `motion-safe:animate-float` untuk dekorasi hero.
- Kartu yang di-hover naik sedikit (`hover:-translate-y-1 hover:shadow-lg`), dan ikonnya membesar sedikit (`group-hover:scale-110`).
- Semua animasi memakai `motion-safe:`, supaya mati untuk pengguna yang mengaktifkan `prefers-reduced-motion`.

### Layout global

**Header (`TopBar`).**
- Kiri: logo RANUM.
- Tengah: nav berupa teks dengan garis bawah hijau untuk halaman aktif.
- Kanan: avatar dengan dropdown (`ChevronDown`) berisi **Profil**, **Pengaturan**, dan **Keluar**. Tombol logout yang sekarang dipindahkan ke dropdown ini.
- Nav Siswa: **Beranda** `#/`, **Jelajah** `#/jelajah` (feed Karya), **Teman** `#/teman`, **Portofolioku** `#/portfolio`.
- Nav staff: Beranda, Challenge, Jelajah, Kelola Akun.
- Menu "Challenge" dan "Profil" hilang dari nav Siswa:
  - Challenge yang belum diterima ada di Beranda.
  - Challenge yang sudah diterima (`#/challenges`) bisa dibuka dari link "Lihat tantanganku" di Beranda.
  - Profil bisa dibuka dari dropdown avatar.
- Mobile tetap memakai bottom nav dengan 4 item yang sama. Aturan di `CLAUDE.md` tetap berlaku: tanpa `backdrop-blur` atau `transform` di header.

**Footer** (baru, `components/Footer.tsx`, dipakai di aplikasi dan di landing page):
- Pita hijau `--primary` dengan tepi atas bergelombang (SVG path), dan teks cream.
- Isi: "RANUM", tagline "Grow Into Yourself.", link nav (diterima lewat prop `links`), dan "© 2026 RANUM".
- Ikon media sosial hanya muncul di landing page (lihat di bawah).
- Di dalam aplikasi, footer hanya tampil di desktop, karena mobile sudah punya bottom nav.

## Landing page publik

Landing page ini adalah halaman yang dilihat **pengunjung yang belum login**. Sumbernya spesifikasi teks yang kamu tempel, ditambah gaya dari `design-fe.jpeg`. Nadanya harus terasa seperti "a little magical space where children discover what makes them unique", bukan template SaaS. Copywriting dipakai persis seperti yang diberikan, termasuk judul berbahasa Inggris.

### Routing (menyesuaikan `App.tsx`)

Sekarang, `App` langsung menampilkan `LoginPage` kalau user belum login. Ini diubah menjadi:

- Belum login + `#/` atau route lain → `LandingPage`.
- Belum login + `#/login` → `LoginPage`.
  - `LoginPage` diberi tampilan baru: kartu cream di tengah, logo RANUM, tombol hijau, dan dekorasi.
  - Setelah login, user diarahkan ke `#/` seperti sekarang.
- Sudah login → aplikasi seperti biasa. Landing page tidak ditampilkan lagi, dan Beranda menjadi Beranda Siswa.

**Link nav ke section.** Hash router memakai `#/...`, jadi link anchor biasa seperti `#about` akan dibaca sebagai route. Karena itu, link nav landing ("Home", "Explore", "How It Works", "About") berupa `<button>` yang memanggil `document.getElementById(id).scrollIntoView({ behavior: 'smooth' })`. Pemetaannya:

| Link | Section |
|---|---|
| Home | Hero |
| About | A Little Space to Discover |
| Explore | What Are You Curious About? |
| How It Works | Your Journey Starts Here |

"Login" dan "Start Exploring →" mengarah ke `#/login`.

### Struktur file

Strukturnya mengikuti pola `pages/challenge/`:

```
pages/LandingPage.tsx          // susunan section dalam <main>, plus LandingNav dan Footer
pages/landing/data.ts          // semua array: navLinks, pillars, curiosityCategories, journeySteps, growthSkills, socialLinks
pages/landing/LandingNav.tsx
pages/landing/Hero.tsx
pages/landing/DiscoverSection.tsx
pages/landing/CuriousSection.tsx
pages/landing/JourneySection.tsx
pages/landing/GrowthSection.tsx
pages/landing/FinalCta.tsx
components/Decorations.tsx     // dipakai bersama landing page dan aplikasi
```

- Semua kartu yang berulang dirender dengan `.map()` dari `data.ts`, termasuk nav, pilar, kategori, langkah, dan progress.
- Setiap section punya `id` dan `aria-labelledby` yang menunjuk ke `<h2>`-nya.
- Urutan heading: satu `<h1>` di hero, lalu `<h2>` untuk tiap section, lalu `<h3>` untuk judul kartu.

**Komponen shadcn yang dipakai:**
- Sudah ada: `Button`, `Card`, `Badge`, `Progress`.
- Perlu ditambahkan: **`Sheet`** dan **`Separator`**, dengan `npx shadcn@latest add sheet separator`.

### Section (dari atas ke bawah)

1. **Navbar (`LandingNav`).**
   - Container pill `rounded-full`, latar `bg-background/80`, border halus, bayangan lembut, `sticky top-4`.
   - Kiri logo RANUM, tengah 4 link (Home aktif, ditandai garis bawah doodle), kanan tombol outline "Login" dan tombol kuning "Start Exploring →".
   - Mobile: logo di kiri dan tombol `Menu` di kanan (`aria-label="Buka menu"`). Tombol ini membuka `Sheet` dari kanan, berisi link dan dua tombol. `Sheet` dari Base UI sudah menangani fokus dan tombol Esc.
   - Landing page tidak punya bottom nav, jadi larangan `backdrop-blur` di `CLAUDE.md` tidak berlaku di sini. Meskipun begitu, cukup pakai latar semi-transparan tanpa blur.
2. **Hero.**
   - Desktop 2 kolom, mobile vertikal.
   - Kiri: `<h1>` RANUM berukuran besar, subjudul "Ruang Eksplorasi Bakat dan Pengembangan Diri Anak", tagline "Grow Into Yourself.", dan CTA kuning "Start Exploring →".
   - Kanan: `<Illustration src="/images/ranum-hero.png" alt="Anak-anak RANUM bertopi wisuda di antara bunga dan daun">` dengan fallback. Teks tulisan tangan "Big dreams start with curiosity" ada di kanan atas, ditambah `DoodleArrow` dan bintang.
   - Latar cream dengan `Blob` kuning di sisi kiri dan kanan. Dekorasi hero memakai `motion-safe:animate-float`.
3. **A Little Space to Discover** (`id="about"`).
   - Judul dan deskripsi persis dari spesifikasi.
   - 3 kartu dari `pillars`:
     - DISCOVER: `Compass`, `bg-sun/40`.
     - EXPLORE: `Puzzle`, `bg-sky/40`.
     - GROW: `Sprout`, `bg-mint`.
   - Kartu `rounded-3xl` dengan satu sudut dibuat sedikit berbeda (misalnya `rounded-tr-[4rem]`) supaya terasa organik.
4. **What Are You Curious About?** (`id="explore"`).
   - Area latar hijau muda dengan tepi bergelombang. Subjudul "Pilih minatmu, temukan duniamu!".
   - 5 kartu dari `curiosityCategories`:
     - Creative: `Palette`.
     - Music: `Music`.
     - Technology: `Laptop`.
     - Communication: `MessageCircle`.
     - Sports: `Trophy`. `Volleyball` tidak ada di lucide 1.59.
   - Setiap kartu punya warna pastel berbeda. Saat di-hover, kartu naik, ikon membesar, dan bayangan bertambah.
   - Mobile: scroll horizontal `snap-x`. Tablet: 2 kolom.
5. **Your Journey Starts Here** (`id="how-it-works"`).
   - 3 langkah dari `journeySteps`: 01 Discover (`Search`), 02 Explore (`Star`), 03 Grow (`Sprout`).
   - Desktop: horizontal, dihubungkan oleh `CurvyLine` SVG putus-putus di antara langkah.
   - Mobile: timeline vertikal dengan garis putus-putus di kiri. Ini dibuat dengan CSS `border-l-2 border-dashed`, tanpa SVG.
6. **Show Your Growth.**
   - Kiri: kartu karya contoh berisi gambar (`/images/sample-drawing.png`, dengan fallback), "My First Digital Drawing", "Created by: Aulia", `Badge` "Creative Exploration", `Badge` "Completed", dan titik pagination statis.
   - Kanan: kartu "My Progress", berisi 4 `Progress` dari `growthSkills`:
     - Creativity 80: `Star`.
     - Curiosity 70: `Lightbulb`.
     - Collaboration 60: `Users`.
     - Confidence 50: `Heart`.
   - Bar progress diberi warna pastel yang berbeda dan dibuat lebih tebal.
   - Ini **data contoh statis** untuk ilustrasi. Tidak ada backend untuk metrik ini.
   - Mobile: satu kolom.
7. **Final CTA.**
   - Blok kuning `rounded-3xl` lebar, dengan judul "Ready to Grow Into Yourself?", subjudul "Your talents don't have to look like anyone else's.", dan tombol "Start Exploring →".
   - Dekorasi: bunga, daun, bintang, `Blob` hijau, dan `<Illustration src="/images/mascot.png">`.
   - Mobile: vertikal.
8. **Footer.** `Footer` bersama, dengan link landing dan ikon media sosial.

### Aksesibilitas dan responsif

- Semua tombol yang hanya berisi ikon punya `aria-label`, semua `<img>` punya `alt`, dan dekorasi memakai `aria-hidden`.
- Fokus keyboard terlihat jelas: `focus-visible:ring-2 ring-primary ring-offset-2` di link dan tombol custom.
- `overflow-x-clip` di pembungkus landing page, supaya dekorasi absolut tidak membuat halaman bisa digeser ke samping.
- Cek manual di lebar 375, 768, dan 1280 px dengan puppeteer (pakai `createBrowserContext()`, sesuai `CLAUDE.md`). Pastikan tidak ada scroll horizontal dan tidak ada dekorasi yang menutupi teks.

### Perlu diputuskan untuk landing page

Defaultnya ada dalam kurung.

- **Ikon media sosial:** lucide 1.59 sudah tidak punya ikon brand (Instagram, YouTube, TikTok), dan URL akunnya juga belum ada. (Default: SVG brand sederhana inline di `Footer`. Ikon baru ditampilkan kalau URL di `socialLinks` diisi, supaya tidak ada link `#` palsu.)
- **Bahasa:** `CLAUDE.md` bilang semua teks UI berbahasa Indonesia, sedangkan spesifikasi memakai judul dan menu berbahasa Inggris. (Default: ikuti spesifikasi persis untuk landing page saja. Teks di dalam aplikasi tetap berbahasa Indonesia.)
- **"Aulia" dan angka progress** adalah contoh statis. (Default: biarkan statis. Kalau nanti mau memakai data asli, angka itu bisa diambil dari skor challenge per kategori, tapi itu fitur terpisah.)
- **Daftar akun:** tidak ada pendaftaran mandiri, karena akun dibuat oleh guru. Jadi "Start Exploring" mengarah ke Login. (Default: begitu. Di halaman login ditambahkan teks "Belum punya akun? Minta ke gurumu.")

### Beranda Siswa (`HomePage`), dari atas ke bawah

1. **Hero.**
   - Kartu kuning-krem lebar dengan judul "Hai, {username}!" berukuran besar memakai font heading, subjudul "Siap menemukan hal seru hari ini?", dan teks kecil "Setiap langkah kecil adalah awal yang hebat."
   - Ilustrasi maskot ada di kanan, dengan dekorasi bunga di sekitarnya.
   - User belum punya nama tampilan, jadi yang ditampilkan adalah `username`.
2. **"Tantangan Seru Untukmu".** Carousel challenge yang belum diterima ini **menggantikan carousel poster ala TIX ID**.
   - Desktop menampilkan 3 kartu, dengan panah kiri/kanan dan titik halaman di bawahnya. Mobile memakai scroll horizontal dengan `snap-x`.
   - Setiap kartu berisi poster di kiri atau atas, chip kategori, judul, potongan deskripsi, dan tombol kuning "Mulai Sekarang →" yang membuka Dialog detail dan tombol terima yang sudah ada (`AcceptButton`).
   - Warna latar kartu bergiliran: peach, mint, blush.
3. **"Trivia Hari Ini".** Kartu biru di samping carousel (di mobile, posisinya di bawah carousel) berisi fakta singkat dan link "Jelajah trivia →".
4. **"Yuk, Jelajah!".** Bagian ini terdiri dari dua kartu berdampingan:
   - **Temukan Bakatmu:** ikon kategori dalam lingkaran (Seni, Musik, Teknologi, Olahraga, Komunikasi) dengan panah geser.
   - **Karya Teman:** "Lihat ide seru dari teman sekelas", berisi 4 thumbnail foto karya terbaru dari `/api/posts` (hanya karya yang punya foto). Ada chip "Karya teman sekelas" dan tombol ke `#/jelajah`.
5. **"Portofolioku".** Satu baris berisi:
   - Kartu unggah: lingkaran kuning dengan `+`, judul "Punya karya baru?", dan tombol hijau "Unggah Karya" yang membuka `PortfolioForm` di Dialog.
   - 2 item portofolio terbaru: thumbnail, judul, chip mint "Tersimpan di portofolio", dan menu `…` (`MoreHorizontal`) berisi Hapus.
   - Kartu catatan: "Kamu yang menentukan karya mana yang ingin dibagikan."
6. **"Teman Sekelas".**
   - Deretan avatar bulat beserta nama. Setiap avatar menjadi link ke `#/users/:id`.
   - Tombol outline "Temukan teman →" mengarah ke `#/teman`.
   - Datanya dari `GET /api/friends/search` dengan `q` kosong, yang mengembalikan teman sekelas. Aturan ini ditambahkan di bagian Teman di bawah.

Beranda Guru/Admin tetap seperti sekarang (kosong). Desain ini hanya untuk Siswa.

### Bagian desain yang bertentangan dengan rencana atau butuh data baru

Ini perlu diputuskan. Defaultnya ada dalam kurung.

- **Tombol "❤ Beri semangat"** di kartu Karya Teman pada dasarnya sama dengan like, padahal kamu minta tidak ada like. (Default: diganti tombol "Beri komentar" yang membuka karyanya di `#/jelajah`.)
- **Chip kategori challenge** ("Seni & Kreativitas", "Alam & Lingkungan", "Bahasa & Cerita") dan **"Temukan Bakatmu"** membutuhkan field kategori baru di Challenge. (Default: ditambahkan sebagai enum opsional `Kategori` di Challenge, dipilih guru di `ChallengeFormPage`. Mengklik kategori di Temukan Bakatmu memfilter carousel tantangan.)
- **"Trivia Hari Ini"** butuh sumber konten. (Default: daftar trivia statis di `lib/trivia.ts`, dipilih berdasarkan tanggal hari ini. Link "Jelajah trivia" tidak dibuat.)
- **"Unggah gambar, cerita, foto proyek, atau rekaman musik"**: rekaman musik berarti audio, padahal rencananya hanya foto dan PDF. (Default: teksnya diubah menjadi "gambar, foto proyek, atau dokumen PDF", dan audio tidak dibuat.)
- **"Kamu yang menentukan karya mana yang ingin dibagikan"** bisa diartikan portofolio bersifat privat dan siswa memilih item mana yang dibagikan. (Default: kalimatnya hanya hiasan, dan aturan visibilitas tetap seperti di bagian Portofolio.)

## Fitur baru: Karya

Siswa mengunggah karya berupa teks, foto, atau keduanya, lalu karya tampil di feed seperti media sosial. **Tidak ada like.** Komentar boleh.

### Keputusan default (ubah kalau tidak sesuai)

1. **Pengunggah:** semua role boleh mengunggah, karena guru juga bisa memamerkan contoh karya.
2. **Visibilitas:** Siswa melihat karya teman sekelasnya, karya **teman** (dari fitur Teman di bawah, kelas mana pun), dan karya Guru/Admin. Guru/Admin melihat semua karya, dan bisa memfilter per kelas.
3. **Hapus:** penulis bisa menghapus karya dan komentarnya sendiri. Guru/Admin bisa menghapus karya dan komentar siapa pun, sebagai moderasi untuk aplikasi anak.
4. **Edit:** tidak ada. Kalau salah, hapus lalu unggah ulang.
5. **Foto:** maksimal 1 foto per karya, berupa JPEG data URL. Pakai ulang `resizeImage` dan `ImageData.IsJpegDataUrl`, sama seperti poster challenge.
6. **Tidak dibuat (YAGNI):** like, share, notifikasi, mention, hashtag, edit, banyak foto per karya, dan pagination. Feed menampilkan 50 karya terbaru, ditandai dengan komentar `shortcut:`.

### Backend

**Model** (`Models/Post.cs`):

```cs
public class Post
{
    public int Id { get; set; }
    public int AuthorId { get; set; }
    public AppUser? Author { get; set; }
    // Snapshot of the author's kelas; null = posted by staff, visible to every kelas
    public int? Kelas { get; set; }
    public string? Text { get; set; }
    public string? ImageUrl { get; set; }   // JPEG data URL, served by GET /api/posts/{id}/image
    public DateTime CreatedAt { get; set; }
    public List<Comment> Comments { get; set; } = [];
}

public class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int AuthorId { get; set; }
    public AppUser? Author { get; set; }
    public required string Text { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

- Tambahkan `DbSet<Post>` ke `AppDbContext`. Komentar ikut terhapus (cascade) saat karyanya dihapus.
- Buat migration dengan `dotnet ef migrations add Posts --project backend --output-dir Data/Migrations`.

**DTO:**
- `CreatePostRequest(Text?, ImageUrl?)`: teks maksimal 2000 karakter, dan minimal salah satu dari teks atau foto harus diisi.
- `CreateCommentRequest(Text)`: wajib diisi, maksimal 500 karakter.
- `PostResponse`: `id`, `author` (`UserResponse`), `kelas`, `text`, `hasImage`, `createdAt`, `commentCount`, `canDelete`.
- `CommentResponse`: `id`, `author`, `text`, `createdAt`, `canDelete`.

**Endpoint** (`Routes/Api.cs` → `Handlers/PostsHandler.cs`, semuanya `RequireAuthorization()`):

| Method | Path | Aturan |
|---|---|---|
| GET | `/api/posts?kelas=&authorId=` | Feed, terbaru dulu, 50 item. Siswa: kelasnya + karya teman + `Kelas == null`. Staff: semua karya, atau satu kelas kalau `kelas` diisi. `authorId` dipakai di halaman profil teman |
| POST | `/api/posts` | Kelas diisi otomatis dari penulis |
| GET | `/api/posts/{id}/image` | Seperti `ChallengesHandler.Poster` |
| DELETE | `/api/posts/{id}` | Penulis atau staff |
| GET | `/api/posts/{id}/comments` | Terlama dulu |
| POST | `/api/posts/{id}/comments` | |
| DELETE | `/api/posts/{id}/comments/{commentId}` | Penulis komentar atau staff |

- Siswa yang mengakses karya yang tidak boleh dilihatnya mendapat 404, sama seperti challenge.
- Helper visibilitas ditulis satu kali di handler (kelas sama, teman, atau karya staff), lalu dipakai di feed dan di semua endpoint `{id}`.

### Frontend

- Route baru `#/jelajah` → `pages/JelajahPage.tsx`, dengan nav "Jelajah" di `TopBar` (lihat bagian Desain).
  - Feed berbentuk satu kolom kartu `rounded-3xl` dengan latar pastel bergiliran, mengikuti gaya kartu di desain.
- Bagian-bagian halaman ada di `pages/jelajah/`:
  - `PostComposer`: `Textarea` dan tombol foto (pakai ulang pola `PosterInput`/`resizeImage`), memakai `useAction` dan `SubmitButton`.
  - `PostCard`: `Avatar`, nama, `RoleChip`, waktu, teks, foto, tombol hapus kalau `canDelete`, dan tombol "N komentar" untuk membuka komentar.
  - `CommentList`: dibuka di dalam kartu, dimuat lewat `useFetch` hanya saat tombol komentar diklik, dengan form komentar singkat di bawahnya.
- Staff mendapat `Segmented` atau `NativeSelect` untuk filter kelas.
- `EmptyState` muncul saat feed masih kosong.
- Tipe `Post` dan `Comment` ditambahkan ke `lib/api.ts`.

## Fitur baru: Teman

Siswa bisa berteman dengan siswa lain, dari kelas mana pun. Pertemanan harus disetujui oleh siswa yang diajak, jadi tidak ada yang otomatis menjadi teman.

### Keputusan default (ubah kalau tidak sesuai)

1. **Khusus Siswa.** Guru/Admin tidak punya teman dan tidak melihat menu Teman, karena mereka sudah bisa melihat semua karya.
2. **Alur:** kirim permintaan → teman menerima atau menolak. Kalau A mengajak B padahal B sudah lebih dulu mengajak A, keduanya langsung berteman.
3. **Cari teman:** cari berdasarkan username, dan hasilnya hanya berisi akun Siswa.
4. **Profil teman** hanya menampilkan avatar, mood, bio, kelas, dan karyanya. Tempat dan tanggal lahir tidak ditampilkan, demi privasi anak.
5. **Siapa yang boleh membuka profil siswa lain:** teman, teman sekelas, dan Guru/Admin.
6. **Tidak dibuat (YAGNI):** chat, blokir, saran teman, dan daftar teman milik orang lain.

### Backend

**Model** (`Models/Friendship.cs`):

```cs
public enum FriendStatus { Pending, Accepted }

// RequesterId asked AddresseeId; one row per pair (the handler checks the reverse direction)
public class Friendship
{
    public int Id { get; set; }
    public int RequesterId { get; set; }
    public AppUser? Requester { get; set; }
    public int AddresseeId { get; set; }
    public AppUser? Addressee { get; set; }
    public FriendStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

- Index unik pada `(RequesterId, AddresseeId)`, dan `Status` disimpan sebagai string.
- Migration dibuat bersama Karya dan Portofolio dalam satu langkah, misalnya dengan nama `PostsFriendsPortfolio`.

**Endpoint** (`Handlers/FriendsHandler.cs`, policy `Siswa`, kecuali profil):

| Method | Path | Aturan |
|---|---|---|
| GET | `/api/friends` | `{ friends, incoming, outgoing }`, isinya `UserResponse` |
| GET | `/api/friends/search?q=` | Siswa yang username-nya cocok, kecuali diri sendiri, 20 item, beserta status pertemanannya. Kalau `q` kosong, hasilnya teman sekelas (untuk section "Teman Sekelas" di Beranda) |
| POST | `/api/friends/{userId}` | Kirim permintaan. Langsung diterima kalau sudah ada permintaan dari arah sebaliknya. Target harus Siswa dan bukan diri sendiri |
| POST | `/api/friends/{userId}/accept` | Hanya penerima permintaan yang boleh menerima |
| DELETE | `/api/friends/{userId}` | Tolak, batalkan, atau hapus pertemanan. Pakai satu endpoint karena semuanya berarti "hapus baris" |
| GET | `/api/users/{id}/profile` | Profil publik (`PublicProfileResponse`, tanpa tanggal dan tempat lahir). Boleh dibuka teman, teman sekelas, atau staff. Selain itu 404 |

- Helper `AreFriendsAsync(db, a, b)` ditulis sekali, lalu dipakai juga oleh aturan visibilitas Karya.

### Frontend

- Route `#/teman` → `pages/TemanPage.tsx`, khusus Siswa. Nav "Teman" diberi badge jumlah permintaan masuk.
  - Daftar teman tampil sebagai avatar bulat besar beserta nama, seperti section "Teman Sekelas" di Beranda.
  - Tab (`Segmented`): **Teman**, **Permintaan** (masuk dan terkirim), dan **Cari**.
  - Tombol aksi memakai `useAction` dan `SubmitButton`: Tambah, Terima, Tolak, Batalkan, Hapus teman.
- Route `#/users/:id` → `pages/UserProfilePage.tsx`, berisi profil publik dan karyanya (`/api/posts?authorId=`).
  - Nama dan avatar di `PostCard`, `CommentList`, dan daftar teman menjadi link ke halaman ini.
- Tipe `Friend` dan `PublicProfile` ditambahkan ke `lib/api.ts`.

## Fitur baru: Portofolio

Kumpulan pencapaian siswa yang tampil di profilnya, misalnya sertifikat, piagam, atau hasil karya terbaik. Setiap item berupa satu file **foto atau PDF**. Bedanya dengan Karya: Portofolio tidak muncul di feed, tidak bisa dikomentari, dan dimaksudkan untuk disimpan lama.

### Keputusan default (ubah kalau tidak sesuai)

1. **Khusus Siswa** yang bisa mengunggah. Guru/Admin cukup melihat.
2. **Siapa yang bisa melihat:** sama dengan profil publik, yaitu pemilik, teman, teman sekelas, dan Guru/Admin.
3. **Isi item:** judul (wajib), deskripsi (opsional), dan 1 file.
   - Foto di-resize ke JPEG dengan `resizeImage`.
   - PDF maksimal 5 MB.
4. **Hapus:** oleh pemilik dan Guru/Admin. Tidak ada edit; untuk mengubah, hapus lalu unggah ulang.
5. **Tidak dibuat (YAGNI):** banyak file per item, urutan manual, komentar, kategori atau tag, dan preview halaman PDF.

### Backend

**Model** (`Models/PortfolioItem.cs`):

```cs
public class PortfolioItem
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public AppUser? Owner { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    // JPEG or PDF data URL, served by GET /api/portfolio/{id}/file
    public required string FileUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

- Jenis file (foto atau PDF) dibaca dari prefix `FileUrl` dan tidak perlu kolom sendiri. Response mengirim `fileType: "Foto" | "Pdf"`.
- Tambahkan `ImageData.IsPdfDataUrl`. Validasinya: prefix `data:application/pdf;base64,`, isi hasil decode diawali `%PDF-`, dan ukurannya ≤ 5 MB.
  - `shortcut: PDF disimpan sebagai data URL di SQLite seperti poster. Pindahkan ke file di disk kalau database membesar.`
- `CreatePortfolioRequest(Title, Description?, FileUrl)`: judul maksimal 100 karakter, deskripsi maksimal 1000 karakter.
- `PortfolioResponse`: `id`, `title`, `description`, `fileType`, `createdAt`, `canDelete`.

**Endpoint** (`Handlers/PortfolioHandler.cs`):

| Method | Path | Aturan |
|---|---|---|
| GET | `/api/users/{id}/portfolio` | Terbaru dulu. Pakai aturan visibilitas profil publik, jadi selain yang berhak mendapat 404 |
| POST | `/api/portfolio` | Policy `Siswa` |
| GET | `/api/portfolio/{id}/file` | `image/jpeg` atau `application/pdf`, dengan `Content-Disposition: inline` |
| DELETE | `/api/portfolio/{id}` | Pemilik atau staff |

- Aturan "boleh melihat profil" (diri sendiri, teman, teman sekelas, atau staff) diambil dari fitur Teman dan dipakai bersama. Aturan ini tidak ditulis ulang.

### Frontend

- Route `#/portfolio` → `pages/PortfolioPage.tsx` ("Portofolioku", khusus Siswa). Isinya kartu unggah dan grid semua item, dengan gaya kartu yang sama seperti section Portofolioku di Beranda.
- Di `UserProfilePage`, portofolio milik orang lain ditampilkan dalam mode hanya baca.
- Bagian-bagian halaman ada di `pages/portfolio/`:
  - `PortfolioForm`: judul, deskripsi, dan satu input file `accept="image/*,application/pdf"`.
    - Foto → `resizeImage`.
    - PDF → `FileReader.readAsDataURL`. Ukuran file dicek di sisi klien dulu supaya pesan errornya cepat muncul.
  - `PortfolioGrid`: foto tampil sebagai thumbnail dan dibuka di `Dialog`. PDF tampil sebagai kartu dengan ikon `FileText`, dan dibuka di tab baru lewat `/api/portfolio/{id}/file`.
- Tipe `PortfolioItem` ditambahkan ke `lib/api.ts`.

## Pengecekan

- Tambahkan ke `smoke-test.sh` untuk Portofolio:
  - Siswa mengunggah foto → 201.
  - Siswa mengunggah PDF kecil (`%PDF-1.4` di-base64) → 201.
  - Mengunggah file palsu atau PNG → 400.
  - Guru mencoba mengunggah → 403.
  - Siswa asing membuka portofolio → 404.
  - Guru menghapus item → 204.

- Tambahkan ke `smoke-test.sh` untuk Teman:
  - Siswa mengajak siswa lain → 201, lalu diterima → 200.
  - Mengajak diri sendiri atau guru → 400.
  - Siswa yang bukan penerima mencoba menerima → 404.
  - Siswa kelas lain tidak bisa melihat karya, lalu bisa melihatnya setelah berteman.
  - Siswa asing membuka profil → 404.
- Tambahkan ke `smoke-test.sh` untuk Karya:
  - Siswa membuat karya → 201.
  - Karya kosong → 400.
  - Siswa kelas lain membuka karya → 404.
  - Komentar → 201.
  - Siswa lain menghapus karya orang → 403.
  - Guru menghapus karya → 204.
- Jalankan `npm run build` dan `npm run lint`, lalu cek manual di browser untuk alur unggah, komentar, dan hapus.

## Setelah selesai

- Perbarui `CLAUDE.md`:
  - Tambahkan bagian **Karya**, **Teman**, dan **Portofolio** yang menjelaskan aturan visibilitas, hapus, pertemanan, dan validasi PDF.
  - Tambahkan `#/jelajah`, `#/teman`, `#/portfolio`, dan `#/users/:id` ke daftar route.
  - Perbarui deskripsi Beranda, nav, dan tema (primary hijau, warna aksen, font Baloo 2 dan Nunito, `Decorations.tsx`).
  - Jelaskan bahwa pengunjung yang belum login melihat `LandingPage` dan login ada di `#/login`, lalu tambahkan aturan "nav landing memakai `scrollIntoView`, bukan anchor `#id`".

## Urutan kerja

Teman dikerjakan lebih dulu, karena aturan visibilitas Karya bergantung pada pertemanan. Tema dan layout global dikerjakan sebelum halaman baru, supaya halaman baru langsung memakai gaya yang benar.

1. Backend Teman: model, `AreFriendsAsync`, handler, route, dan profil publik.
2. Backend Karya: model, DTO, handler (pakai `AreFriendsAsync`), dan route.
3. Backend Portofolio: model, `IsPdfDataUrl`, handler, dan route. Kalau disetujui, tambahkan juga field `Kategori` di Challenge. Lalu buat satu migration.
4. Tambahkan smoke test untuk aturan Teman, Karya, dan Portofolio.
5. Tema dan layout: token warna, font Baloo 2 dan Nunito, `Decorations.tsx`, animasi float, `TopBar` baru dengan dropdown avatar, dan `Footer`.
   - Lanjutkan dengan landing page publik: routing di `App.tsx`, `pages/landing/`, `LoginPage` baru, dan shadcn `Sheet` + `Separator`. Bagian ini tidak bergantung pada backend baru, jadi bisa dikerjakan paralel.
6. Frontend Jelajah: `#/jelajah`, dengan composer, feed, dan komentar.
7. Frontend Teman: `#/teman`, `#/users/:id`, dan link dari nama atau avatar.
8. Frontend Portofolio: `#/portfolio`, ditambah bagian portofolio di `UserProfilePage`.
9. Beranda Siswa baru, yang menyusun section-section di atas dari endpoint yang sudah ada.
10. Perbarui `CLAUDE.md`.
