// "Trivia Hari Ini" on Beranda: a random general-knowledge fact on every visit
// shortcut: a fixed list in code, move to the database if teachers should write their own
export type Trivia = { topic: string; title: string; body: string }

const TRIVIA: Trivia[] = [
  // Hewan
  { topic: 'Hewan', title: 'Gurita punya tiga jantung!', body: 'Dua jantung memompa darah ke insang, satu lagi ke seluruh tubuhnya.' },
  { topic: 'Hewan', title: 'Lebah bisa menari!', body: 'Lebah menari berputar-putar untuk memberi tahu temannya letak bunga.' },
  { topic: 'Hewan', title: 'Komodo hanya ada di Indonesia!', body: 'Kadal terbesar di dunia ini hidup di Pulau Komodo, Rinca, dan Flores.' },
  { topic: 'Hewan', title: 'Kupu-kupu mengecap dengan kaki!', body: 'Kupu-kupu punya perasa di kakinya untuk mencicipi daun dan bunga.' },
  { topic: 'Hewan', title: 'Paus biru adalah hewan terbesar!', body: 'Panjangnya bisa lebih dari 30 meter, lebih panjang dari 2 bus sekolah.' },
  { topic: 'Hewan', title: 'Lumba-lumba tidur sebelah otak!', body: 'Separuh otaknya istirahat, separuhnya tetap bangun supaya bisa bernapas.' },
  // Luar angkasa
  { topic: 'Luar Angkasa', title: 'Satu hari di Venus lebih lama dari setahunnya!', body: 'Venus berputar sangat lambat: 243 hari Bumi untuk sekali berputar.' },
  { topic: 'Luar Angkasa', title: 'Matahari adalah sebuah bintang!', body: 'Matahari begitu besar sehingga sekitar 1,3 juta Bumi bisa muat di dalamnya.' },
  { topic: 'Luar Angkasa', title: 'Bulan menjauh dari Bumi!', body: 'Setiap tahun, Bulan bergeser sekitar 4 cm menjauhi Bumi.' },
  { topic: 'Luar Angkasa', title: 'Jejak kaki di Bulan masih ada!', body: 'Di Bulan tidak ada angin, jadi jejak astronaut bisa bertahan jutaan tahun.' },
  { topic: 'Luar Angkasa', title: 'Saturnus bisa mengapung!', body: 'Saturnus lebih ringan dari air untuk ukurannya, jadi ia akan mengapung di kolam raksasa.' },
  // Tubuh manusia
  { topic: 'Tubuh Kita', title: 'Tulang paling kecil ada di telinga!', body: 'Namanya tulang sanggurdi, ukurannya hanya sekitar 3 milimeter.' },
  { topic: 'Tubuh Kita', title: 'Jantungmu berdetak 100.000 kali sehari!', body: 'Jantung terus bekerja memompa darah, bahkan saat kamu tidur.' },
  { topic: 'Tubuh Kita', title: 'Bayi punya lebih banyak tulang!', body: 'Bayi lahir dengan sekitar 300 tulang, lalu sebagian menyatu menjadi 206 saat dewasa.' },
  { topic: 'Tubuh Kita', title: 'Sidik jarimu tidak ada kembarannya!', body: 'Bahkan anak kembar identik punya sidik jari yang berbeda.' },
  // Bumi & alam
  { topic: 'Bumi', title: 'Pelangi sebenarnya bulat!', body: 'Dari pesawat, pelangi kadang terlihat berbentuk lingkaran penuh.' },
  { topic: 'Bumi', title: 'Petir lebih panas dari Matahari!', body: 'Suhu petir bisa mencapai 30.000°C, sekitar lima kali permukaan Matahari.' },
  { topic: 'Bumi', title: 'Sebagian besar Bumi adalah air!', body: 'Sekitar 71% permukaan Bumi tertutup air, kebanyakan berupa lautan.' },
  { topic: 'Bumi', title: 'Gunung tertinggi ada di bawah laut!', body: 'Mauna Kea di Hawaii lebih tinggi dari Everest kalau diukur dari dasar laut.' },
  { topic: 'Bumi', title: 'Pohon bisa "berbicara"!', body: 'Pohon saling mengirim zat kimia lewat akar dan jamur di dalam tanah.' },
  // Indonesia
  { topic: 'Indonesia', title: 'Indonesia punya lebih dari 17.000 pulau!', body: 'Indonesia adalah negara kepulauan terbesar di dunia.' },
  { topic: 'Indonesia', title: 'Ada lebih dari 700 bahasa daerah!', body: 'Indonesia adalah salah satu negara dengan bahasa daerah terbanyak di dunia.' },
  { topic: 'Indonesia', title: 'Candi Borobudur adalah candi Buddha terbesar!', body: 'Borobudur dibangun sekitar 1.200 tahun lalu dan punya 504 arca Buddha.' },
  { topic: 'Indonesia', title: 'Rafflesia adalah bunga terbesar!', body: 'Rafflesia arnoldii dari Sumatra bisa selebar 1 meter.' },
  // Sains & teknologi
  { topic: 'Sains', title: 'Madu tidak pernah basi!', body: 'Madu yang ditemukan di makam kuno Mesir masih bisa dimakan.' },
  { topic: 'Sains', title: 'Cahaya sangat cepat!', body: 'Cahaya bisa mengelilingi Bumi sekitar 7 kali hanya dalam 1 detik.' },
  { topic: 'Sains', title: 'Air bisa mendidih dan membeku bersamaan!', body: 'Pada tekanan dan suhu tertentu, air bisa berupa es, cair, dan uap sekaligus.' },
  { topic: 'Teknologi', title: 'Komputer pertama sebesar ruangan!', body: 'ENIAC, salah satu komputer pertama, beratnya sekitar 27 ton.' },
  { topic: 'Teknologi', title: 'Robot pertama dibuat untuk pabrik!', body: 'Robot industri pertama, Unimate, bekerja di pabrik mobil tahun 1961.' },
  // Seni, musik, bahasa, olahraga
  { topic: 'Seni', title: 'Lukisan Mona Lisa tidak punya alis!', body: 'Para ahli masih menebak apakah alisnya memang tidak dilukis atau hilang karena dibersihkan.' },
  { topic: 'Musik', title: 'Angklung berasal dari Jawa Barat!', body: 'Angklung diakui UNESCO sebagai warisan budaya dunia sejak 2010.' },
  { topic: 'Musik', title: 'Piano punya 88 tuts!', body: 'Ada 52 tuts putih dan 36 tuts hitam pada piano standar.' },
  { topic: 'Bahasa', title: 'Ada kata yang sama dibaca bolak-balik!', body: '"Katak" dan "kasur rusak" terbaca sama dari depan maupun belakang. Namanya palindrom.' },
  { topic: 'Olahraga', title: 'Bulu tangkis adalah olahraga raket tercepat!', body: 'Kok bisa melesat lebih dari 400 km/jam saat di-smash.' },
  { topic: 'Olahraga', title: 'Bola sepak dulu dibuat dari kandung kemih babi!', body: 'Sebelum ada karet, bola dibuat dari kantung hewan yang ditiup.' },
]

// A random fact, never the same one as `current` (so "Fakta lain" always changes)
export function randomTrivia(current?: Trivia) {
  const pool = TRIVIA.filter((t) => t !== current)
  return pool[Math.floor(Math.random() * pool.length)]
}
