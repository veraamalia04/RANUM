#!/usr/bin/env python3
"""Fills a dev database with demo data (students, friendships, karya, comments, portfolio, challenges) through the API,
so every backend rule still applies. Needs the dev seed accounts (admin/admin123, guru/guru, vera/vera, kelas 4).

Usage (backend running with the new code):
  python3 seed-demo/seed.py                              # http://localhost:5090/api
  python3 seed-demo/seed.py http://localhost:5091/api

Runs once: it stops if the demo student "aulia" already exists. Images are crops of design-fe.jpeg and the avatars.
"""
import base64
import http.cookiejar
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5090/api'
HERE = Path(__file__).parent


class Client:
    def __init__(self, username, password):
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.user = self.call('POST', '/auth/login', {'username': username, 'password': password})

    def call(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(API + path, data=data, method=method, headers={'Content-Type': 'application/json'})
        try:
            with self.opener.open(req) as res:
                text = res.read()
                return json.loads(text) if text else None
        except urllib.error.HTTPError as e:
            raise SystemExit(f'{method} {path} -> {e.code} {e.read().decode()[:300]}')


def jpeg(name):
    return 'data:image/jpeg;base64,' + base64.b64encode((HERE / f'{name}.jpg').read_bytes()).decode()


def pdf(title, line):
    """A small valid one-page PDF certificate with two lines of text."""
    stream = f'BT /F1 26 Tf 60 230 Td ({title}) Tj ET BT /F1 14 Tf 60 190 Td ({line}) Tj ET'.encode()
    objects = [
        b'<</Type/Catalog/Pages 2 0 R>>',
        b'<</Type/Pages/Kids[3 0 R]/Count 1>>',
        b'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 320]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
        b'<</Length %d>>stream\n' % len(stream) + stream + b'\nendstream',
        b'<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>',
    ]
    out, offsets = bytearray(b'%PDF-1.4\n'), []
    for i, obj in enumerate(objects, 1):
        offsets.append(len(out))
        out += b'%d 0 obj\n' % i + obj + b'\nendobj\n'
    xref = len(out)
    out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(objects) + 1)
    out += b''.join(b'%010d 00000 n \n' % o for o in offsets)
    out += b'trailer<</Size %d/Root 1 0 R>>\nstartxref\n%d\n%%%%EOF\n' % (len(objects) + 1, xref)
    return 'data:application/pdf;base64,' + base64.b64encode(bytes(out)).decode()


guru = Client('guru', 'guru')
admin = Client('admin', 'admin123')
if any(u['username'] == 'aulia' for u in admin.call('GET', '/users')):
    raise SystemExit('Demo data already seeded (user "aulia" exists). Nothing to do.')

# --- Students: kelas 4 (vera's classmates) and kelas 5 (friends from another kelas) ---
STUDENTS = [
    ('aulia', 4, 'tiger.webp', 'senang', 'Suka melukis dan bernyanyi', 'Bandung', '2016-04-12'),
    ('maya', 4, 'giraffe.webp', 'semangat', 'Jago menari dan suka bunga', 'Yogyakarta', '2016-08-03'),
    ('jati', 4, 'monkey.webp', 'penasaran', 'Penasaran sama robot dan planet', 'Malang', '2016-01-25'),
    ('alana', 4, 'zebra.webp', 'gembira', 'Senang menulis cerita pendek', 'Bogor', '2016-11-30'),
    ('raka', 4, 'racoon.webp', 'semangat', 'Pemain sepak bola andalan kelas', 'Surabaya', '2015-12-09'),
    ('bima', 5, 'capybara.webp', 'biasa', 'Suka main gitar dan origami', 'Semarang', '2015-06-17'),
    ('citra', 5, 'flying_rat.webp', 'senang', 'Hobi membaca komik sains', 'Denpasar', '2015-09-21'),
]
kids = {}
for name, kelas, avatar, mood, bio, place, born in STUDENTS:
    guru.call('POST', '/users', {'username': name, 'password': f'{name}123', 'role': 'Siswa', 'kelas': kelas})
    kids[name] = Client(name, f'{name}123')
    kids[name].call('PUT', '/auth/me', {'avatar': avatar, 'mood': mood, 'bio': bio, 'birthPlace': place, 'birthDate': born})
vera = Client('vera', 'vera')
if not vera.user['profileComplete']:  # fresh database: the seeded account has no profile yet
    vera.call('PUT', '/auth/me', {'avatar': 'fox.webp', 'mood': 'gembira', 'bio': 'Suka menggambar hewan', 'birthPlace': 'Jakarta', 'birthDate': '2016-02-14'})
ids = {name: c.user['id'] for name, c in kids.items()} | {'vera': vera.user['id']}
print(f'{len(STUDENTS)} students created (password: <name>123)')

# --- Friendships: vera has friends in kelas 4 and 5, one request waiting for her, one she sent ---
vera.call('POST', f"/friends/{ids['aulia']}")
kids['aulia'].call('POST', f"/friends/{ids['vera']}/accept")
kids['bima'].call('POST', f"/friends/{ids['vera']}")
vera.call('POST', f"/friends/{ids['bima']}/accept")
kids['citra'].call('POST', f"/friends/{ids['vera']}")  # pending: the Teman badge shows 1
vera.call('POST', f"/friends/{ids['maya']}")            # outgoing request
kids['jati'].call('POST', f"/friends/{ids['raka']}")
kids['raka'].call('POST', f"/friends/{ids['jati']}/accept")
print('friendships created')

# --- Challenges for kelas 4, with categories and posters ---
CHALLENGES = [
    ('Tantangan: Dunia dari Bentuk', 'Coba gambar sesuatu menggunakan hanya lingkaran dan segitiga!', ['Seni', 'Teknologi'], 'poster-bentuk', [
        {'type': 'PilihanGanda', 'text': 'Bentuk apa yang punya tiga sisi?', 'options': ['Lingkaran', 'Segitiga', 'Persegi'], 'correctIndex': 1},
        {'type': 'Menggambar', 'text': 'Gambar rumah impianmu dari bentuk-bentuk sederhana'},
    ]),
    ('Detektif Alam Mini', 'Temukan 3 hal menarik di sekitarmu!', ['Alam'], 'poster-alam', [
        {'type': 'PilihanGanda', 'text': 'Hewan apa yang membantu bunga berkembang biak?', 'options': ['Lebah', 'Kucing', 'Ikan'], 'correctIndex': 0},
        {'type': 'Essay', 'text': 'Ceritakan satu hal menarik yang kamu temukan di halaman rumah.'},
    ]),
    ('Ceritakan dengan Emoji', 'Buat cerita mini menggunakan 5 emoji!', ['Bahasa', 'Komunikasi'], 'poster-emoji', [
        {'type': 'Essay', 'text': 'Tulis cerita pendek dari 5 emoji pilihanmu.'},
    ]),
    ('Musik dari Benda di Rumah', 'Buat alat musik sederhana dari barang bekas.', ['Musik', 'Seni'], None, [
        {'type': 'PilihanGanda', 'text': 'Alat musik yang dipukul disebut...', 'options': ['Perkusi', 'Tiup', 'Petik'], 'correctIndex': 0},
        {'type': 'Menggambar', 'text': 'Gambar alat musik buatanmu'},
    ]),
    ('Robot Penolong', 'Rancang robot yang bisa membantu di sekolah.', ['Teknologi'], None, [
        {'type': 'Essay', 'text': 'Robotmu bisa membantu apa saja?'},
        {'type': 'Menggambar', 'text': 'Gambar robotmu'},
    ]),
    ('Olahraga Pagi Ceria', 'Catat olahraga pagimu selama seminggu.', ['Olahraga'], None, [
        {'type': 'PilihanGanda', 'text': 'Berapa menit sebaiknya anak berolahraga setiap hari?', 'options': ['5 menit', '60 menit', '300 menit'], 'correctIndex': 1},
    ]),
    ('Kenalan dengan Teman Baru', 'Wawancarai satu teman dan ceritakan hobinya.', ['Komunikasi', 'Bahasa'], None, [
        {'type': 'Essay', 'text': 'Siapa teman yang kamu wawancarai, dan apa hobinya?'},
    ]),
]
challenge_ids = {}
for title, desc, categories, poster, questions in CHALLENGES:
    body = {'title': title, 'description': desc, 'kelas': 4, 'categories': categories, 'questions': questions}
    if poster:
        body['posterUrl'] = jpeg(poster)
    challenge_ids[title] = guru.call('POST', '/challenges', body)['id']


def answer(kid, title, picks):
    """Accept and submit: picks maps question index -> choice index, text, or image name."""
    cid = challenge_ids[title]
    kid.call('POST', f'/challenges/{cid}/accept')
    questions = kid.call('GET', f'/challenges/{cid}')['questions']
    answers = []
    for i, q in enumerate(questions):
        a = {'questionId': q['id']}
        if q['type'] == 'PilihanGanda':
            a['choiceIndex'] = picks[i]
        elif q['type'] == 'Essay':
            a['text'] = picks[i]
        else:
            a['imageUrl'] = jpeg(picks[i])
        answers.append(a)
    kid.call('POST', f'/challenges/{cid}/submissions', {'answers': answers})
    return cid


def grade_all(cid, score, feedback):
    for s in guru.call('GET', f'/challenges/{cid}/submissions'):
        manual = {a['id']: score for a in s['answers'] if a['choiceIndex'] is None}
        guru.call('PUT', f"/challenges/{cid}/submissions/{s['id']}/grade", {'scores': manual, 'feedback': feedback})


# vera: two graded results on her profile, one waiting for grading, one accepted but not done yet.
# Two challenges stay new, so the Beranda carousel has cards to show.
c1 = answer(vera, 'Tantangan: Dunia dari Bentuk', {0: 1, 1: 'rumah-impian'})
answer(kids['aulia'], 'Tantangan: Dunia dari Bentuk', {0: 1, 1: 'rumah'})
grade_all(c1, 92, 'Rumahnya warna-warni, keren sekali!')
c2 = answer(vera, 'Detektif Alam Mini', {0: 0, 1: 'Aku menemukan kupu-kupu kuning yang hinggap di bunga sepatu.'})
answer(kids['jati'], 'Detektif Alam Mini', {0: 2, 1: 'Ada semut yang berbaris membawa remah roti.'})
grade_all(c2, 85, 'Pengamatan yang teliti!')
answer(vera, 'Ceritakan dengan Emoji', {0: '🌞🐶🎈🍰🎉 Pagi itu anjingku menemukan balon di pesta ulang tahun!'})
answer(kids['alana'], 'Ceritakan dengan Emoji', {0: '🚀🌙⭐👽🏠 Aku terbang ke bulan dan bertemu alien yang ramah.'})
# Half done: a saved draft she can continue on the Tantangan page ("Draft tersimpan")
music = challenge_ids['Musik dari Benda di Rumah']
vera.call('POST', f'/challenges/{music}/accept')
first_question = vera.call('GET', f'/challenges/{music}')['questions'][0]['id']
vera.call('PUT', f'/challenges/{music}/draft', {'answers': [{'questionId': first_question, 'choiceIndex': 0}]})
print(f'{len(CHALLENGES)} challenges with submissions and grades')

# --- Karya on the Jelajah feed (oldest first, so the newest ends on top) ---
POSTS = [
    (guru, 'Selamat pagi anak-anak! 🌻 Minggu ini kita cari ide seru dari alam. Jangan lupa unggah karya terbaik kalian ya!', None, ['Alam']),
    (kids['maya'], 'Taman bunga di depan rumah nenek. Aku gambar pakai krayon 🌸', 'bunga', ['Seni', 'Alam']),
    (kids['jati'], 'Tata surya versi aku! Planet favoritku Saturnus karena punya cincin 🪐', 'planet', ['Teknologi', 'Seni']),
    (kids['bima'], 'Belajar origami kapibara, susah tapi seru!', 'capybara', ['Seni']),
    (kids['aulia'], 'Rumah di bukit yang aku lukis dengan cat air 🏡', 'rumah', ['Seni']),
    (kids['alana'], 'Hari ini aku menulis puisi pendek:\n"Hujan turun pelan-pelan,\nmenyiram bunga di halaman,\nlalu pelangi datang berkawan."', None, ['Bahasa']),
    (kids['raka'], 'Gambar maskot tim sepak bola kelas kita! ⚽', 'tiger', ['Olahraga', 'Seni']),
    (vera, 'Kucing oranye yang suka tidur di jendela kelas 😺', 'kucing', ['Seni']),
    (kids['citra'], 'Fakta seru: gurita punya tiga jantung! Ini gambarku 🐙', 'gurita', ['Alam']),
    (vera, 'Penyu laut yang aku lihat di akuarium. Warnanya cantik sekali!', 'penyu', ['Alam', 'Seni']),
]
post_ids = []
for author, text, image, categories in POSTS:
    post_ids.append(author.call('POST', '/posts', {'text': text, 'imageUrl': jpeg(image) if image else None, 'categories': categories})['id'])

COMMENTS = [
    (1, kids['aulia'], 'Bunganya cantik banget, Maya!'), (1, vera, 'Warnanya ceria 🌸'),
    (2, vera, 'Aku juga suka Saturnus!'), (2, guru, 'Bagus, Jati! Coba tambahkan nama planetnya ya.'),
    (4, kids['maya'], 'Langitnya bagus sekali'), (4, guru, 'Teknik cat airnya rapi 👏'),
    (5, vera, 'Puisinya indah, Alana!'),
    (7, kids['aulia'], 'Lucu banget kucingnya'), (7, kids['bima'], 'Mirip kucing di rumahku!'), (7, guru, 'Ekspresinya hidup sekali, Vera.'),
    (9, kids['aulia'], 'Wah penyunya keren!'),
]
for index, who, text in COMMENTS:
    who.call('POST', f'/posts/{post_ids[index]}/comments', {'text': text})
print(f'{len(POSTS)} karya and {len(COMMENTS)} comments')

# --- Portfolio ---
vera.call('POST', '/portfolio', {'title': 'Sertifikat Lomba Mewarnai', 'description': 'Juara 2 tingkat sekolah', 'fileUrl': pdf('Sertifikat Juara 2', 'Lomba Mewarnai - diberikan kepada Vera')})
vera.call('POST', '/portfolio', {'title': 'Cerita Planet Biru', 'description': 'Ilustrasi untuk cerita tentang laut.', 'fileUrl': jpeg('penyu')})
vera.call('POST', '/portfolio', {'title': 'Rumah Impianku', 'description': 'Karya pertamaku di Ranum!', 'fileUrl': jpeg('rumah-impian')})
kids['aulia'].call('POST', '/portfolio', {'title': 'Lukisan Rumah di Bukit', 'fileUrl': jpeg('rumah')})
kids['aulia'].call('POST', '/portfolio', {'title': 'Piagam Paduan Suara', 'description': 'Tampil di acara 17 Agustus', 'fileUrl': pdf('Piagam Penghargaan', 'Paduan Suara HUT RI - Aulia')})
kids['bima'].call('POST', '/portfolio', {'title': 'Origami Hewan', 'fileUrl': jpeg('capybara')})
print('portfolio items created')
print('Done! Log in as vera / vera to see everything.')
