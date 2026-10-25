# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Ranum: a colorful, kid-friendly school app. `backend/` is an ASP.NET Core (.NET 10) Minimal API, `frontend/` is React 19 + TypeScript + Vite. UI text is in Indonesian.

## Commands

```bash
# Backend (http://localhost:5090). Applies pending migrations and seeds accounts on startup.
cd backend && dotnet run --launch-profile http
cd backend && dotnet build

# Migrations (dotnet-ef is a local tool: run `dotnet tool restore` once)
dotnet ef migrations add <Name> --project backend --output-dir Data/Migrations

# Frontend (http://localhost:5173)
cd frontend && npm run dev
cd frontend && npm run build     # tsc -b && vite build (this is the typecheck)
cd frontend && npm run lint      # oxlint
```

Never delete `backend/ranum.db` to change the schema. Change the entities, then add a migration.

Demo accounts (Development only, from `Seed:Accounts` in `appsettings.Development.json`):
- `admin` / `admin123`
- `guru` / `guru`
- `vera` / `vera` (Siswa, kelas 4)

The login page shows one-click demo buttons in dev.

**Demo data:** `python3 seed-demo/seed.py [api-url]` (default `http://localhost:5090/api`) adds students (`aulia`, `maya`, `jati`, `alana`, `raka` in kelas 4, `bima`, `citra` in kelas 5; password `<name>123`), friendships, challenges with categories and grades, karya, comments, and portfolio items through the API. It runs once (stops if `aulia` exists). Its images are crops of `design-fe.jpeg`.

**Tests:** there is no unit test project. `./smoke-test.sh` (repo root) checks the API rules over HTTP using curl, against its own throwaway database on port 5091 (see the usage comment at the top of the script). It creates fixed usernames and assumes challenge id 1, so it needs a fresh `smoke.db` each run. To check a single rule, run one `curl` with a cookie jar (`-c`/`-b`). `backend/Ranum.Api.http` has sample requests.

**UI testing with puppeteer:** open pages in `browser.createBrowserContext()`. In the default context, headless Chrome here ignores clicks and typing.

## Backend layout

- `Routes/Api.cs`: **every endpoint, in one file** (Laravel `routes/api.php` style). Each route maps to a static method in `Handlers/` and sets its auth policy.
- `Handlers/`: one static class per area (`AuthHandler`, `ProfileHandler`, `UsersHandler`, `ChallengesHandler`, `FriendsHandler`, `PostsHandler`, `PortfolioHandler`). `Visibility` holds the shared "who may see whom" rules. Dependencies are injected as method parameters, and handlers return `IResult`.
  - A handler whose only parameter is `HttpContext` must be cast to `Delegate` in the route file (see logout). Otherwise it binds as a `RequestDelegate` and its result is dropped (analyzer warning ASP0016).
- `Dtos/Requests/` and `Dtos/Responses/`: records. Responses have static `From(entity)` mappers.
  - Request validation is DataAnnotations, run by `AddValidation()` (.NET 10). Failures return a 400 ProblemDetails with `errors`.
  - Business-rule errors use `Http/ApiResults` and return `{ message }`.
- `Models/`: EF entities only. Computed get-only properties (`AppUser.IsProfileComplete`, `Answer.NeedsManualGrade`) are not mapped to columns.
- `Auth/Policies.cs`:
  - Policies `Staff` (Guru or Admin) and `Siswa`.
  - `ClaimsPrincipal` helpers (`GetUserId`, `IsAdmin`, `IsSiswa`).
  - Use `db.CurrentUserAsync(principal)` to load the signed-in user.
- `Data/`: `AppDbContext`, `DbSeeder` (migrate + seed accounts), `Migrations/`, and `avatars/`.

## Architecture

**Dev wiring:** the Vite dev server proxies `/api` to `http://localhost:5090` (`frontend/vite.config.ts`), so the browser sees the frontend and API as the same origin. Auth relies on this: it uses a cookie (`SameSite=Strict`), not JWT, and CORS is not configured. If the frontend and API are ever deployed on different origins, both the auth cookie and CORS need rework.

**Auth and roles:**
- Cookie auth. The cookie events return 401/403 instead of redirecting.
- Claims: `NameIdentifier` = user id, `Role` = `Siswa | Guru | Admin`.
- Guru can create and list only Siswa. Admin can create Guru or Siswa and lists everyone. No one can create an Admin through the API; admins come only from `Seed:Accounts`, and startup throws if no admin exists.
- A Siswa has a `Kelas` (int 1–12).
- Users cannot change their own username or kelas.

**Profile:**
- Fields: `avatar`, `mood`, `bio`, `birthPlace`, `birthDate`.
- All five are required by `PUT /api/auth/me`, so a saved profile is always complete. The API returns `profileComplete`.
- The frontend never shows a half-empty profile:
  - A Siswa with an incomplete profile sees only `ProfileSetupPage`; the whole app is gated.
  - Other roles see the setup form on `#/profile`.
- Avatars are a fixed set of image files in `backend/Data/avatars/`:
  - `AvatarCatalog` lists them, `GET /api/avatars` returns the names, and they are served as static files at `/api/avatars/{name}`.
  - Only a name from that catalog is accepted.
  - To add avatars, drop files into that folder and restart.
- The mood ids are duplicated in `backend/Models/Moods.cs` and `frontend/src/lib/moods.ts` (which adds icons and colors). Keep them in sync.

**Challenges:**
- A Guru/Admin posts a challenge, optionally suggested for one kelas (`Kelas` is nullable and only a label: "Disarankan kelas X" / "Semua kelas"). It has ordered questions of type `PilihanGanda` (options + `CorrectIndex`), `Essay`, or `Menggambar`.
- A challenge can have an optional poster (JPEG data URL in `Challenge.PosterUrl`), served as an image by `GET /api/challenges/{id}/poster`. Responses only carry `hasPoster`.
- **Every Siswa can see and take every challenge**, whatever their kelas. They must accept a challenge (`POST .../accept`, an `Enrollment` row) before submitting, and submit once (unique index on ChallengeId + StudentId). `CorrectIndex` is hidden from a Siswa until they have submitted.
- Challenges and karya have any number of talent categories (`Category` enum in `Models/Category.cs`, duplicated as `CATEGORIES` in `frontend/src/lib/categories.ts`; keep them in sync). They are stored as a JSON array column (EF primitive collection with string elements). `?category=Seni&category=Musik` on `GET /api/challenges` and `GET /api/posts` keeps items with **any** of them.
- A Siswa's Beranda (`HomePage`) shows the challenges they have not accepted as a card carousel (`pages/home/ChallengeCarousel`), filtered by the multi-select "Temukan Bakatmu" chips. "Terima & Kerjakan" accepts and goes straight to `#/challenges/:id`, which shows the answer form once accepted.
- `#/challenges` (nav "Tantangan") shows a Siswa every challenge of their kelas in tabs by `challengeStatus()`: baru, dikerjakan, menunggu (nilai), selesai.
- Drafts: `AnswerForm` autosaves 1.5 s after the last change to `PUT /api/challenges/{id}/draft` (one `ChallengeDraft` per student and challenge, the `SubmitRequest` JSON). Only for accepted, unsubmitted challenges; JPEG-checked; answers for other questions are dropped. Submitting deletes the draft. `hasDraft` is on the challenge summary.
- Scoring:
  - Every answer gets a score from 0 to 100.
  - Multiple choice is scored on submit, as 100 or 0.
  - The creating guru (or an admin) grades essay and drawing answers 1–100 through `PUT .../grade`, which is keyed by answer id.
  - `Submission.FinalizeIfGraded()` sets the final score (the rounded average) once every answer has a score. `Score == null` means the submission is still waiting for grading.
- Graded results appear on the Siswa profile through `GET /api/challenges/my-results`.
- Drawing answers are JPEG data URLs validated by `ImageData.IsJpegDataUrl`. They come either from the canvas in `DrawingInput` or from an upload resized by `lib/image.ts`.

**Teman, Karya, Portofolio** (rules in `Handlers/Visibility.cs`):
- Teman (Siswa only, any kelas): a `Friendship` row per pair, `Pending` until the addressee accepts. Sending to someone who already asked you accepts it. `DELETE /api/friends/{userId}` rejects, cancels or unfriends. `GET /api/friends/search` with an empty `q` lists classmates.
- A Siswa may see another Siswa (profile, portfolio, karya) only if they share a kelas or are friends; everyone sees staff, staff see everyone. Otherwise 404. `GET /api/users/{id}/profile` returns a `PublicProfileResponse` (no birth date or place).
- Karya (`Post`, `#/jelajah`): text and/or one JPEG. `Post.Kelas` snapshots the author's kelas (null = staff, visible to all). Comments only, **no likes by design**. The feed returns the newest 50.
- Portofolio (`PortfolioItem`, `#/portfolio`): uploaded by Siswa only; one JPEG or PDF data URL (`ImageData.IsPdfDataUrl`: real `%PDF-` bytes, max 5 MB), served inline by `GET /api/portfolio/{id}/file`.
- Authors delete their own karya, comments and portfolio items; staff can delete any (moderation).

**Data:**
- SQLite via EF Core.
- Role and question type are stored as strings.
- JSON uses `JsonStringEnumConverter`.
- SQLite can't translate some LINQ, for example `Distinct()` inside a collection projection, which needs APPLY. Do that part in memory after `ToListAsync()`.

## Frontend layout (`frontend/src`)

- `lib/`: non-UI code.
  - `api.ts`: the `api()` fetch wrapper and its error-message picking, plus types.
  - `hooks.ts`:
    - `useFetch(path)` returns `{ data, error, reload }`.
    - `useAction()` returns `{ status, error, run }` for submits.
  - `router.ts`: a tiny hash router plus `navigate()`.
  - `challenge.ts`, `moods.ts`, `dates.ts`, `image.ts`.
- `components/`: reusable UI. Use these instead of hand-rolling markup:
  - `Field` (label + control, optional `inputIcon`), `SubmitButton` (renders `useAction` status), `ErrorText`, `Loader`, `EmptyState`, `Segmented`, `BackLink`, `CategoryChips` (multi-select category toggles; `big` = round "Temukan Bakatmu" style), `Footer`, `Decorations`, `MascotLayout`.
  - `Backdrop` (the fixed sky/hills scenery behind every signed-in page and the login page, rendered once in `App`), `Mascot` (hops, jumps with a note when clicked), `Sprinkles` (twinkling stars/hearts/flowers at given positions).
  - `Avatar`, `AvatarPicker`, `MoodPicker`, `RoleChip`, `ScoreBadge`, `DrawingInput`, `TopBar`.
- `forms/`:
  - `ProfileForm`, shared by profile setup and Settings.
  - `PasswordForm`.
- `pages/`: one `*Page.tsx` per route. Larger page parts live in a subfolder (`pages/challenge/`).
- `App.tsx`: only loads the session, gates profile setup, and maps routes to pages (`renderPage`).
- Routes: `#/`, `#/login`, `#/challenges`, `#/challenges/new`, `#/challenges/:id`, `#/jelajah`, `#/teman`, `#/portfolio`, `#/users/:id`, `#/profile`, `#/settings`, `#/users`. Navigation uses plain `<a href="#/...">`.
  - Mascot pages: `#/jelajah` and `#/challenges*` (except `/new`) wrap their content in `components/MascotLayout` (a centered `max-w-2xl` column; from `xl` six random mascots, three per side, with a handwritten note sit sticky beside it). `App` gives those routes a wider `max-w-7xl` container.
  - Query strings: `parseRoute()` in `lib/router.ts` splits `#/jelajah?kategori=Seni,Musik`; `App` matches on the path only and keys `<main>` by path, so changing a filter doesn't remount the page. Category filters on Jelajah and Tantangan live in `?kategori=`.
  - Signed out: `LandingPage` (sections in `pages/landing/`, content arrays in `landing/data.ts`) for every route except `#/login`. Its nav scrolls with `scrollIntoView`; never use `#id` anchors, the hash router would read them as routes.
  - Beranda (`#/`): `HomePage` is the Siswa dashboard from `dashboard-sudah-login.jpeg`; Guru/Admin get `StaffHomePage` (quick actions, counts, answers waiting for a grade, own challenges, students per kelas, newest karya), which reuses `HomePage`'s exported `Hero`.
  - The Tailwind Vite plugin in dev may not pick up classes from a newly created file; restart `npm run dev` if new classes don't apply.
  - Siswa nav: Beranda, Tantangan, Jelajah, Teman, Portofolioku (`short` label "Portofolio" in the 5-item bottom bar). Staff nav: Beranda, Tantangan, Jelajah, Kelola Akun. Profil, Pengaturan and Keluar live in the avatar dropdown.
  - `#/users` and `#/challenges/new` are only for Guru/Admin; `#/teman` and `#/portfolio` only for Siswa.
- Icons come only from `lucide-react`.
- Mascot images live in `public/images/mascots/` (`1.png`–`4.png`, `main.png` = the sun with the graduation cap); `lib/mascots.ts` lists them (`MASCOTS`, `MAIN_MASCOT`, `randomMascots`). Add a file there and to that list to use a new one. The landing page follows `landing-page-belum-login.jpeg`.
- The macOS filesystem is case-insensitive. Don't create two files whose names differ only by case (the `*Page.tsx` suffix avoids this). After renaming a file this way, restart Vite.
- Styling is Tailwind v4 + shadcn/ui (`base-nova` style, Base UI primitives). Generated components live in `components/ui/` (add more with `npx shadcn@latest add <name>`). Theme tokens are in `index.css`: primary and text = RANUM green `#2F684E` on cream, accent colors `sun`/`sky`/`peach`/`blush`/`mint` (`bg-sun`, `bg-sky/40`, ...), Baloo 2 headings and Nunito body, `animate-float`, and a `sun` Button variant. Decorations (flowers, leaves, doodles, `Blob`, `SectionTitle`, `Illustration` with a fallback for missing `/public/images` files) are in `components/Decorations.tsx`; wrap motion in `motion-safe:`; `cn()` is in `lib/utils.ts`; the `@/` alias points to `src/`.
  - Mobile (<640px, `sm:`) turns the nav into a fixed bottom bar. Don't put `backdrop-blur` or `transform` on the header, or the fixed nav gets trapped inside it.
