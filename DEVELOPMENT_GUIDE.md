# 📘 EduFlow — Panduan Pengembangan (Development Guide)

> **Tujuan dokumen ini**: Panduan high-level untuk developer atau AI coding assistant dalam membangun EduFlow. Instruksi ditulis secara ringkas agar mudah diikuti tanpa overload detail.

---

## 🎯 Tentang Proyek

**EduFlow** adalah Personal Learning OS — sebuah web app yang membantu siswa mengelola proses belajar dan guru mengelola administrasi akademik.

**Tech Stack Wajib:**
- Frontend: **Next.js 14+** (App Router) + **Tailwind CSS v3** + **shadcn/ui**
- Backend: **Supabase** (Auth, PostgreSQL, Storage)
- Libraries: Chart.js, Mermaid.js, jsPDF, qrcode, Framer Motion

**Dua Role Utama:**
- **Siswa** — consume content, track progress
- **Guru** — create content, manage students

---

## 🏗️ Fase Pengembangan

Ikuti urutan fase ini. Setiap fase harus selesai dan berfungsi sebelum lanjut ke fase berikutnya.

---

### FASE 1: Project Setup & Authentication

**Goal**: App bisa diakses, user bisa register/login, dan diarahkan ke dashboard sesuai role.

**Instruksi:**
1. Init project Next.js dengan App Router dan Tailwind CSS. Install shadcn/ui.
2. Setup Supabase project. Ambil `SUPABASE_URL` dan `SUPABASE_ANON_KEY`, simpan di `.env.local`.
3. Install `@supabase/ssr` untuk auth. Buat dua helper: `createBrowserClient` dan `createServerClient`.
4. Buat middleware Next.js yang:
   - Refresh session token di setiap request
   - Redirect user yang belum login ke `/login`
   - Redirect user yang sudah login dari `/login` ke `/dashboard`
5. Di Supabase, buat tabel `profiles` (id, full_name, role, class_group, avatar_url, created_at). Buat database trigger: ketika user baru register di `auth.users`, otomatis buat row di `profiles`.
6. Buat halaman `/login` dan `/register` dengan UI yang modern. Register harus ada pilihan role (siswa/guru).
7. Buat layout dashboard (`/dashboard`) dengan sidebar navigasi. Menu sidebar berbeda berdasarkan role:
   - Siswa: Dashboard, Pathways, Study Cards, Toolbox
   - Guru: Dashboard, Pathways, Study Cards, Toolbox
8. Buat landing page yang menarik di `/` (hero section, fitur overview, CTA login).

**Validasi**: User bisa register, login, melihat dashboard kosong dengan sidebar yang sesuai role.

---

### FASE 2: Academic Dashboard

**Goal**: Siswa melihat nilai & progress mereka. Guru melihat statistik kelas.

**Instruksi:**
1. Di Supabase, buat tabel `subjects` (id, name, class_group, teacher_id) dan `grades` (id, student_id, subject_id, score, type, created_at). Aktifkan RLS.
2. **Dashboard Siswa** — Tampilkan:
   - Card ringkasan: rata-rata nilai, jumlah mapel, trend (naik/turun)
   - Chart.js Line Chart: trend nilai per waktu
   - Chart.js Bar Chart: nilai per mata pelajaran
   - Tabel nilai terbaru
3. **Dashboard Guru** — Tampilkan:
   - Card ringkasan: jumlah siswa, rata-rata kelas, mapel yang diajar
   - Chart.js Bar Chart: distribusi nilai kelas
   - Tabel: top 5 siswa, siswa yang perlu perhatian (nilai rendah)
   - Form input/edit nilai siswa
4. Gunakan `react-chartjs-2` sebagai wrapper React untuk Chart.js.
5. Buat komponen chart sebagai Client Component (`'use client'`).
6. Data diambil via Supabase client, dengan RLS memastikan siswa hanya lihat data sendiri.

**Validasi**: Siswa lihat chart nilai mereka. Guru bisa input nilai dan lihat statistik kelas.

---

### FASE 3: Interactive Roadmap (Pathways)

**Goal**: Guru bisa membuat learning roadmap visual. Siswa bisa mengikuti dan menandai progress.

**Instruksi:**
1. Di Supabase, buat tabel `roadmaps` (id, title, description, mermaid_code, created_by, is_published, created_at) dan `roadmap_progress` (id, student_id, roadmap_id, node_id, status, completed_at).
2. Buat komponen `MermaidRenderer` sebagai Client Component:
   - Import mermaid secara dynamic (hindari SSR error)
   - Render diagram dari string mermaid code
   - Support dark/light theme
3. **Halaman Guru** (`/pathways`):
   - List roadmap yang sudah dibuat
   - Form buat/edit roadmap: text editor untuk mermaid code + live preview
   - Tombol publish/unpublish
   - Sediakan beberapa template mermaid code siap pakai
4. **Halaman Siswa** (`/pathways`):
   - List roadmap yang published
   - Klik roadmap → lihat diagram full
   - Klik node di diagram → tandai sebagai selesai
   - Warna node berdasarkan status: abu (locked), biru (in-progress), hijau (selesai)
5. Progress disimpan per-siswa per-roadmap di `roadmap_progress`.

**Validasi**: Guru buat roadmap dengan mermaid code, siswa lihat dan tandai progress. Warna node berubah.

---

### FASE 4: Smart Flashcards (Spaced Repetition)

**Goal**: Guru buat bank soal flashcard. Siswa berlatih dengan sistem spaced repetition.

**Instruksi:**
1. Di Supabase, buat tabel:
   - `flashcard_decks` (id, title, subject_id, created_by, is_published)
   - `flashcards` (id, deck_id, front, back, order_index)
   - `flashcard_reviews` (id, student_id, flashcard_id, repetition, efactor, interval, next_review, last_reviewed)
2. Implementasi algoritma **SM-2** di file utility terpisah:
   - Input: card state saat ini + quality rating (1-5)
   - Output: repetition, efactor, interval, next_review date baru
   - Minimum efactor = 1.3, default = 2.5
   - Quality < 3 = reset repetition ke 0, interval ke 1
3. **Halaman Guru** (`/study-cards`):
   - CRUD deck flashcard
   - Dalam setiap deck: CRUD kartu (front/back)
   - Publish deck agar bisa diakses siswa
4. **Halaman Siswa** (`/study-cards`):
   - List deck yang published
   - Mode review: tampilkan kartu satu per satu
   - UI: card flip animation (3D CSS transform)
   - Setelah flip, siswa rate pemahaman (1-5 atau simplified: Lupa / Sulit / Mudah)
   - Hitung SM-2, update `flashcard_reviews`, tentukan `next_review`
   - Tampilkan jumlah kartu "due today"
   - Session summary: berapa kartu di-review, akurasi

**Validasi**: Guru buat deck + cards. Siswa review, rating tersimpan, jadwal review berikutnya sesuai SM-2.

---

### FASE 5: Educator Toolbox

**Goal**: Tools utilitas untuk guru (PDF/QR/jadwal) dan siswa (sertifikat).

**Instruksi:**
1. **Guru Toolbox** — Tiga fitur:
   - **Laporan Nilai PDF**: Ambil data grades dari Supabase, generate PDF pakai `jsPDF`. Isi: header sekolah, tabel nilai siswa, rata-rata. Semua client-side.
   - **QR Code Generator**: Input URL/teks → generate QR pakai library `qrcode` → tampilkan preview → download sebagai PNG atau embed ke PDF.
   - **Manajemen Jadwal**: CRUD jadwal (tabel `schedules`) — judul, tanggal, waktu, kelas. Tampilkan dalam format kalender sederhana atau list.
2. **Siswa Toolbox** — Satu fitur:
   - **Sertifikat Pencapaian**: Generate PDF sertifikat berdasarkan roadmap yang selesai atau pencapaian tertentu. Template sertifikat yang menarik dengan nama siswa, judul pencapaian, tanggal.
3. Semua PDF/QR generation harus **client-side only** (tidak ada API call ke server untuk generate).
4. Di Supabase, buat tabel `schedules` (id, teacher_id, title, description, date, time_start, time_end, class_group).

**Validasi**: Guru generate PDF laporan nilai, QR code, dan kelola jadwal. Siswa download sertifikat.

---

### FASE 6: Polish & Deployment (Termasuk Sistem Kode Kelas & Branding)

**Goal**: Aplikasi siap production — responsif, cepat, aman, dan memiliki *branding* yang baik.

**Instruksi:**
1. **[UPDATE] Sistem Kode Kelas (Class Code)**:
   - Implementasi tabel `classes` dengan auto-generate `invite_code` (6 karakter) untuk Guru.
   - Siswa tidak lagi menginput kelas saat pendaftaran.
   - Dashboard Siswa yang belum memiliki kelas akan dikunci dan meminta input Kode Kelas untuk bergabung.
2. **[UPDATE] Branding EduFlow**:
   - Ganti ikon standar (seperti `GraduationCap`) dengan logo kustom aplikasi di semua halaman utama (Landing, Login, Register, Sidebar).
3. Pastikan semua halaman responsif (mobile, tablet, desktop).
4. Tambahkan loading skeleton/spinner di setiap halaman yang fetch data.
5. Tambahkan empty states yang informatif (misal: "Belum ada roadmap").
6. Tambahkan error handling yang user-friendly (toast notifications).
7. Implementasi animasi transisi antar halaman dengan Framer Motion.
8. Support dark mode (Tailwind `dark:` classes + theme toggle).
9. Optimasi: lazy load chart/mermaid components, image optimization.
10. Tambah SEO meta tags di setiap halaman.
11. Deploy ke **Vercel** (connect repo GitHub, set environment variables).

**Validasi**: Test di mobile, cek Lighthouse score, flow pendaftaran dan gabung kelas via kode berfungsi, logo aplikasi terpasang dengan benar.

---

## 📐 Aturan Desain (Design Rules)

Ikuti aturan ini untuk konsistensi visual:

| Aspek | Aturan |
|-------|--------|
| **Font** | Inter (Google Fonts) |
| **Border Radius** | Gunakan `rounded-xl` atau `rounded-2xl` untuk cards |
| **Warna Utama** | Indigo/Violet gradient (`from-indigo-500 to-violet-600`) |
| **Background** | Light: `bg-slate-50`, Dark: `bg-slate-950` |
| **Cards** | Glass morphism effect: `bg-white/80 backdrop-blur-sm border border-white/20` |
| **Shadows** | Soft shadow: `shadow-lg shadow-indigo-500/10` |
| **Spacing** | Gunakan kelipatan 4 (`p-4`, `gap-6`, `mb-8`) |
| **Animasi** | Framer Motion untuk mount/unmount, CSS transition untuk hover |
| **Icons** | Lucide React — konsisten satu set icon |

---

## 🔒 Keamanan (Security Checklist)

- [ ] Aktifkan RLS di semua tabel Supabase
- [ ] Gunakan `getUser()` (bukan `getSession()`) untuk validasi di server
- [ ] Jangan expose `service_role` key di frontend
- [ ] Validasi role di server sebelum operasi sensitif (insert/update/delete)
- [ ] Sanitize input mermaid code untuk mencegah XSS

---

## 📁 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

> Hanya dua env vars yang dibutuhkan. Jangan gunakan `service_role` key di client.

---

## 💡 Tips untuk AI Assistant / Developer

1. **Selalu mulai dari Fase 1** — jangan loncat fase. Auth harus jalan dulu.
2. **Gunakan Server Components** sebagai default, tandai `'use client'` hanya jika butuh interaktivity (chart, mermaid, form).
3. **RLS adalah keamanan utama** — jangan bypass dengan `service_role` key.
4. **SM-2 algorithm** sudah terdokumentasi dengan baik, implementasi cukup ~30 baris kode JavaScript.
5. **Mermaid.js harus di-render client-side** — gunakan dynamic import atau `useEffect`.
6. **jsPDF dan qrcode 100% client-side** — tidak perlu API route.
7. **Test setiap fase** sebelum lanjut. Jangan stack technical debt.
8. **Gunakan shadcn/ui components** (Button, Card, Dialog, Input, Table, dll) untuk konsistensi.
9. **Framer Motion** cukup untuk `initial`, `animate`, dan `exit` — tidak perlu animasi kompleks.
10. **Jika tidak yakin tentang schema**, lihat kembali bagian Database Schema di implementation plan.
