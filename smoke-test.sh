#!/usr/bin/env bash
# Checks the API rules against a backend running on its own fresh database (your dev ranum.db is untouched).
# Usage:
#   rm -f backend/smoke.db
#   (cd backend && ConnectionStrings__Default="Data Source=smoke.db" dotnet run --launch-profile http --urls http://localhost:5091) &
#   API=http://localhost:5091/api ./smoke-test.sh
set -u
API=${API:-http://localhost:5090/api}
JAR=$(mktemp -d)
fail=0

# expect <status> <cookie-name> <method> <path> [json]
expect() {
  local want=$1 who=$2 method=$3 path=$4 body=${5:-}
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" -b "$JAR/$who" -c "$JAR/$who" \
    -H 'Content-Type: application/json' ${body:+-d "$body"} "$API$path")
  if [ "$got" = "$want" ]; then echo "ok   $who $method $path -> $got"; else echo "FAIL $who $method $path -> $got (want $want)"; fail=1; fi
}

# expect_body <cookie-name> <path> <grep -E pattern>: GET body must match
expect_body() {
  local who=$1 path=$2 pattern=$3
  if curl -s -b "$JAR/$who" "$API$path" | grep -qE "$pattern"; then echo "ok   $who GET $path ~ $pattern"; else echo "FAIL $who GET $path !~ $pattern"; fail=1; fi
}

expect 401 anon  GET  /auth/me
expect 401 anon  POST /auth/login '{"username":"admin","password":"salah"}'
expect 200 admin POST /auth/login '{"username":"admin","password":"admin123"}'
expect 201 admin POST /users '{"username":"guru1","password":"guru123","role":"Guru"}'
expect 201 admin POST /users '{"username":"siswa1","password":"siswa123","role":"Siswa","kelas":10}'
expect 403 admin POST /users '{"username":"admin2","password":"admin123","role":"Admin"}'
expect 409 admin POST /users '{"username":"guru1","password":"guru123","role":"Guru"}'

expect 200 guru  POST /auth/login '{"username":"guru1","password":"guru123"}'
expect 201 guru  POST /users '{"username":"siswa2","password":"siswa123","role":"Siswa","kelas":11}'
expect 400 guru  POST /users '{"username":"siswa3","password":"siswa123","role":"Siswa"}'
expect 403 guru  POST /users '{"username":"guru2","password":"guru123","role":"Guru"}'
expect 400 guru  POST /users '{"username":"siswa4","password":"siswa123","role":"Siswa","kelas":13}'
expect 400 guru  POST /users '{"username":"siswa5","password":"siswa123","role":"Siswa","kelas":"4A"}'
expect 200 guru  GET  /users

expect 200 siswa POST /auth/login '{"username":"siswa2","password":"siswa123"}'
expect 200 siswa GET  /auth/me
expect 403 siswa GET  /users
expect 403 siswa POST /users '{"username":"x123","password":"siswa123","role":"Siswa","kelas":10}'
expect 200 siswa PUT  /auth/me '{"avatar":"fox.webp","mood":"senang","bio":"Jago menggambar","birthPlace":"Bandung","birthDate":"2015-03-21"}'
expect 400 siswa PUT  /auth/me '{"avatar":null,"mood":null,"bio":null,"birthPlace":null,"birthDate":null}'
expect 400 siswa PUT  /auth/me '{"avatar":"../appsettings.json","mood":"senang","bio":"Jago","birthPlace":"Bandung","birthDate":"2015-03-21"}'
expect 400 siswa PUT  /auth/me '{"avatar":"fox.webp","mood":"jahat","bio":"Jago","birthPlace":"Bandung","birthDate":"2015-03-21"}'
expect 400 siswa PUT  /auth/me '{"avatar":"fox.webp","mood":"senang","bio":"Jago","birthPlace":"Bandung","birthDate":"2999-01-01"}'
expect 400 siswa PUT  /auth/me '{"avatar":"fox.webp","mood":"senang","birthPlace":"Bandung","birthDate":"2015-03-21"}'
expect 400 siswa PUT  /auth/me "{\"avatar\":\"fox.webp\",\"mood\":\"senang\",\"bio\":\"$(printf 'a%.0s' {1..201})\",\"birthPlace\":\"Bandung\",\"birthDate\":\"2015-03-21\"}"
expect_body siswa /avatars 'fox\.webp'
expect 200 anon  GET  /avatars/fox.webp
expect 400 siswa PUT  /auth/password '{"currentPassword":"salah","newPassword":"baru1234"}'
expect 204 siswa PUT  /auth/password '{"currentPassword":"siswa123","newPassword":"baru1234"}'
expect 200 siswa POST /auth/login '{"username":"siswa2","password":"baru1234"}'
expect 204 siswa POST /auth/logout
expect 401 siswa GET  /auth/me

# --- Challenges (ids assume a fresh database) ---
CH='{"title":"Kuis Hewan","kelas":11,"questions":[
  {"type":"PilihanGanda","text":"Hewan berkaki 8?","options":["Semut","Laba-laba","Kucing"],"correctIndex":1},
  {"type":"Essay","text":"Ceritakan hewan favoritmu"},
  {"type":"Menggambar","text":"Gambar kucing"}]}'
expect 400 guru  POST /challenges '{"title":"X","kelas":11,"questions":[{"type":"PilihanGanda","text":"A?","options":["satu"],"correctIndex":0}]}'
expect 400 guru  POST /challenges '{"title":"X","kelas":11,"questions":[]}'
expect 201 guru  POST /challenges "$CH"
expect 200 siswa POST /auth/login '{"username":"siswa2","password":"baru1234"}'
expect 403 siswa POST /challenges "$CH"
expect_body siswa /challenges/1 '"correctIndex":null'
expect 200 siswa2b POST /auth/login '{"username":"siswa1","password":"siswa123"}'
# Every Siswa can take every challenge; kelas is only a suggestion
expect 200 siswa2b GET /challenges/1
expect_body siswa2b /challenges '"title":"Kuis Hewan"'
expect 400 siswa POST /challenges/1/submissions '{"answers":[{"questionId":1,"choiceIndex":1},{"questionId":2,"text":"Kucing lucu"},{"questionId":3,"imageUrl":"data:image/jpeg;base64,/9j/4AAQ"}]}'
expect 403 guru  POST /challenges/1/accept
expect 204 siswa2b POST /challenges/1/accept
expect 204 siswa POST /challenges/1/accept
expect 409 siswa POST /challenges/1/accept
expect_body siswa /challenges '"accepted":true'
expect 404 siswa GET /challenges/1/poster
expect 400 guru  POST /challenges '{"title":"X","kelas":4,"posterUrl":"data:image/png;base64,AAAA","questions":[{"type":"Essay","text":"A?"}]}'
expect 400 siswa POST /challenges/1/submissions '{"answers":[{"questionId":1,"choiceIndex":1}]}'
expect 400 siswa POST /challenges/1/submissions '{"answers":[{"questionId":1,"choiceIndex":1},{"questionId":2,"text":"Kucing"},{"questionId":3,"imageUrl":"data:image/png;base64,AAAA"}]}'
expect 200 siswa POST /challenges/1/submissions '{"answers":[{"questionId":1,"choiceIndex":1},{"questionId":2,"text":"Kucing lucu"},{"questionId":3,"imageUrl":"data:image/jpeg;base64,/9j/4AAQ"}]}'
expect 409 siswa POST /challenges/1/submissions '{"answers":[{"questionId":1,"choiceIndex":0},{"questionId":2,"text":"x"},{"questionId":3,"imageUrl":"data:image/jpeg;base64,/9j/4AAQ"}]}'
expect_body siswa /challenges/1 '"correctIndex":1'
expect_body siswa /challenges/my-results '^\[\]$'
expect 403 siswa GET  /challenges/1/submissions
expect 400 guru  PUT  /challenges/1/submissions/1/grade '{"scores":{"2":80,"3":0}}'
expect 400 guru  PUT  /challenges/1/submissions/1/grade '{"scores":{"2":80}}'
expect 201 admin POST /users '{"username":"guru2","password":"guru123","role":"Guru"}'
expect 200 guru2 POST /auth/login '{"username":"guru2","password":"guru123"}'
expect 403 guru2 PUT  /challenges/1/submissions/1/grade '{"scores":{"2":80,"3":90}}'
expect 403 guru2 DELETE /challenges/1
expect 200 guru  PUT  /challenges/1/submissions/1/grade '{"scores":{"2":80,"3":90},"feedback":"Bagus!"}'
expect_body siswa /challenges/my-results '"score":90'
expect_body guru  /challenges '"pendingCount":0'
expect 204 admin DELETE /challenges/1
expect_body siswa /challenges/my-results '^\[\]$'

# --- Teman, Karya, Portofolio (post and portfolio ids assume a fresh database) ---
id_of() { curl -s -b "$JAR/$1" "$API/auth/me" | grep -oE '"id":[0-9]+' | head -1 | cut -d: -f2; }
expect 201 admin POST /users '{"username":"siswa6","password":"siswa123","role":"Siswa","kelas":12}'
expect 200 stranger POST /auth/login '{"username":"siswa6","password":"siswa123"}'
S=$(id_of siswa) S2=$(id_of siswa2b) G=$(id_of guru)
JPEG='data:image/jpeg;base64,/9j/4AAQ'

expect 400 siswa POST /posts '{"text":"  "}'
expect 400 siswa POST /posts '{"imageUrl":"data:image/png;base64,AAAA"}'
expect 201 siswa POST /posts "{\"text\":\"Gambar kucingku\",\"imageUrl\":\"$JPEG\"}"
expect 200 siswa GET  /posts/1/image
expect_body siswa2b /posts '^\[\]$'
expect 404 siswa2b GET /posts/1/comments
expect 404 siswa2b GET /users/$S/profile

expect 403 guru  POST /friends/$S
expect 400 siswa POST /friends/$S
expect 400 siswa POST /friends/$G
expect 201 siswa POST /friends/$S2
expect 409 siswa POST /friends/$S2
expect 404 siswa POST /friends/$S2/accept
expect_body siswa2b /friends '"incoming":\[\{"id":'"$S"
expect 204 siswa2b POST /friends/$S/accept
expect_body siswa "/friends/search?q=siswa1" '"state":"Friends"'
expect_body siswa "/friends/search" '^\[\]$'

expect 200 siswa2b GET /users/$S/profile
# A public profile has no birth place (Bandung)
expect_body siswa2b /users/$S/profile '^[^B]*$'
expect_body siswa2b /posts 'Gambar kucingku'
expect 400 siswa2b POST /posts/1/comments '{"text":""}'
expect 201 siswa2b POST /posts/1/comments '{"text":"Keren!"}'
expect_body siswa /posts '"commentCount":1'
expect 403 siswa2b DELETE /posts/1
expect 403 siswa DELETE /posts/1/comments/1
expect 404 stranger GET /posts/1/comments

expect 201 siswa POST /portfolio "{\"title\":\"Piagam lomba\",\"fileUrl\":\"$JPEG\"}"
expect 201 siswa POST /portfolio '{"title":"Sertifikat","fileUrl":"data:application/pdf;base64,JVBERi0xLjQK"}'
expect 400 siswa POST /portfolio '{"title":"Palsu","fileUrl":"data:application/pdf;base64,aGVsbG8="}'
expect 400 siswa POST /portfolio '{"title":"PNG","fileUrl":"data:image/png;base64,AAAA"}'
expect 403 guru  POST /portfolio "{\"title\":\"X\",\"fileUrl\":\"$JPEG\"}"
expect_body siswa2b /users/$S/portfolio '"fileType":"Pdf"'
expect 200 siswa2b GET /portfolio/2/file
expect 404 stranger GET /users/$S/portfolio
expect 404 stranger GET /portfolio/2/file
expect 403 siswa2b DELETE /portfolio/1
expect 204 guru  DELETE /portfolio/1

expect 204 siswa DELETE /friends/$S2
expect 404 siswa2b GET /users/$S/profile
expect 204 guru  DELETE /posts/1

# --- Kategori (challenge id 2 assumes a fresh database) ---
expect 400 guru  POST /challenges '{"title":"X","kelas":11,"categories":["Sihir"],"questions":[{"type":"Essay","text":"A?"}]}'
expect 201 guru  POST /challenges '{"title":"Kat","categories":["Seni","Musik","Seni"],"questions":[{"type":"Essay","text":"A?"},{"type":"Menggambar","text":"B"}]}'
expect_body siswa "/challenges?category=Musik" '"title":"Kat"'
expect_body siswa "/challenges?category=Olahraga" '^\[\]$'
# Any of the categories matches; the duplicate Seni was stored once
expect_body siswa "/challenges?category=Olahraga&category=Seni" '"categories":\["Seni","Musik"\]'
expect 400 siswa GET "/challenges?category=Sihir"
expect 400 siswa POST /posts '{"text":"x","categories":["Sihir"]}'
expect 201 siswa POST /posts '{"text":"Lagu ciptaanku","categories":["Musik","Seni"]}'
expect_body siswa "/posts?category=Musik" 'Lagu ciptaanku'
expect_body siswa "/posts?category=Olahraga" '^\[\]$'

# --- Draft jawaban ---
Q=$(curl -s -b "$JAR/siswa" "$API/challenges/2" | grep -oE '"questions":\[\{"id":[0-9]+' | grep -oE '[0-9]+$')
expect 400 siswa PUT /challenges/2/draft '{"answers":[]}'
expect 400 siswa2b PUT /challenges/2/draft '{"answers":[]}'
expect 404 siswa GET /challenges/2/draft
expect 204 siswa POST /challenges/2/accept
expect 400 siswa PUT /challenges/2/draft "{\"answers\":[{\"questionId\":$((Q+1)),\"imageUrl\":\"data:image/png;base64,AAAA\"}]}"
expect 204 siswa PUT /challenges/2/draft "{\"answers\":[{\"questionId\":$Q,\"text\":\"setengah jadi\"},{\"questionId\":999,\"text\":\"bukan soal ini\"}]}"
expect_body siswa /challenges/2/draft 'setengah jadi'
# The answer for question 999 (not in this challenge) was dropped: exactly one answer left
expect_body siswa /challenges/2/draft '"answers":\[\{"questionId":[0-9]+,[^{}]*\}\]'
expect_body siswa /challenges '"hasDraft":true'
expect 404 siswa2b GET /challenges/2/draft
expect 204 siswa PUT /challenges/2/draft "{\"answers\":[{\"questionId\":$Q,\"text\":\"sudah lengkap\"}]}"
expect_body siswa /challenges/2/draft 'sudah lengkap'
expect 200 siswa POST /challenges/2/submissions "{\"answers\":[{\"questionId\":$Q,\"text\":\"sudah lengkap\"},{\"questionId\":$((Q+1)),\"imageUrl\":\"$JPEG\"}]}"
expect 404 siswa GET /challenges/2/draft
expect 409 siswa PUT /challenges/2/draft '{"answers":[]}'

rm -rf "$JAR"
exit $fail
