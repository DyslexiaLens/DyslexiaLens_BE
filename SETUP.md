# Setup & Development Guide - DyslexiaLens Backend

Dokumen ini menyediakan panduan langkah demi langkah untuk menyiapkan lingkungan pengembangan lokal (local development), mengonfigurasi variabel lingkungan, menguji API dengan Postman/Newman, serta menangani kendala teknis (troubleshooting) secara menyeluruh.

---

## Prasyarat Lingkungan

Sebelum memulai, pastikan perangkat lokal Anda telah terpasang perangkat lunak berikut:

- **Node.js** v18 atau versi LTS terbaru (cek: `node --version`)
- **PostgreSQL** v14 atau lebih baru (cek: `psql --version`)
- **npm** v9 atau lebih baru (cek: `npm --version`)
- **Git** untuk pengelolaan repositori (cek: `git --version`)
- **Layanan SMTP** (seperti Brevo, SendGrid, Mailtrap, atau Gmail) untuk pengiriman OTP email.
- **Akses HTTP** ke model AI DyslexiaLens (lokal atau cloud).

---

## Setup Pengembangan Lokal (Sekitar 5 Menit)

### Langkah 1: Navigasi Proyek & Instalasi Dependensi
Buka terminal Anda, masuk ke direktori backend proyek, dan unduh semua pustaka ketergantungan:
```bash
cd "d:/Homework/Dicoding/DBS Coding Camp/Capstone/back-end"
npm install
```

### Langkah 2: Pembuatan Database PostgreSQL
Buat database baru bernama `dyslexialens` menggunakan perintah terminal PostgreSQL:
```bash
# Menggunakan utilitas command-line
createdb -U postgres dyslexialens

# Atau melalui psql shell langsung
psql -U postgres -c "CREATE DATABASE dyslexialens;"
```

### Langkah 3: Konfigurasi File Environment (`.env`)
Salin berkas template `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Buka file `.env` yang baru dibuat dan isi seluruh variabel lingkungan yang dibutuhkan secara lengkap sesuai panduan berikut.

---

## Daftar Lengkap Variabel Lingkungan (`.env`)

Backend memerlukan konfigurasi lingkungan berikut untuk berjalan dengan lancar. Pastikan semua variabel terisi dengan benar.

| Nama Variabel | Contoh Nilai | Deskripsi / Fungsi |
| :--- | :--- | :--- |
| **NODE_ENV** | `development` | Mode eksekusi runtime (`development` atau `production`). Pada mode `development`, kode OTP akan ikut ditampilkan di respons API untuk mempermudah QA/Testing. |
| **PORT** | `5000` | Port tempat server Express.js mendengarkan koneksi masuk. |
| **DATABASE_URL** | `postgresql://postgres:postgres@localhost:5432/dyslexialens` | String koneksi utama ke PostgreSQL. Jika kosong, backend akan mencoba menggunakan fallback individual (`DB_HOST`, `DB_PORT`, dll.). |
| **DB_HOST** | `localhost` | Fallback alamat host database PostgreSQL. |
| **DB_PORT** | `5432` | Fallback port database PostgreSQL. |
| **DB_NAME** | `dyslexialens` | Fallback nama database PostgreSQL. |
| **DB_USER** | `postgres` | Fallback username database PostgreSQL. |
| **DB_PASSWORD** | `postgres` | Fallback password database PostgreSQL. |
| **JWT_SECRET** | `super-secret-jwt-key-change-in-production` | Kunci rahasia untuk menandatangani signature token akses JWT. Gunakan string acak panjang di production. |
| **JWT_EXPIRES_IN** | `7d` | Masa berlaku Token JWT Akses (misalnya: `7d` untuk 7 hari, `1h` untuk 1 jam). |
| **OTP_EXPIRES_MINUTES**| `10` | Durasi waktu kadaluarsa kode OTP reset password dalam satuan menit. |
| **MAX_FILE_SIZE_MB** | `5` | Batas ukuran berkas gambar yang boleh diunggah pengguna dalam satuan Megabytes. |
| **AI_MODEL_BASE_URL** | `http://localhost:7860` | URL endpoint dasar tempat API model AI disleksia dituanrumahi (misal: Hugging Face Space atau VPS). |
| **AI_MODEL_API_KEY** | `KunciRahasia123!` | API Key rahasia untuk autentikasi pengiriman gambar ke model AI (`X-API-Key`). |
| **AI_MODEL_TIMEOUT_MS**| `30000` | Batas waktu tunggu (timeout) request ke model AI sebelum dibatalkan otomatis oleh backend (dalam milidetik). |
| **SMTP_HOST** | `smtp-relay.brevo.com` | Alamat host server SMTP untuk mengirim email OTP. |
| **SMTP_PORT** | `587` | Port server SMTP (biasanya `587` untuk TLS atau `465` untuk SSL). |
| **SMTP_USER** | `ad1e37001@smtp-brevo.com` | Username autentikasi akun SMTP Mailer. |
| **SMTP_PASS** | `dCNVnLOpKmGQ2PgJ` | Password atau Application Password autentikasi SMTP Mailer. |
| **SMTP_FROM** | `dyslexialens79@gmail.com` | Alamat email resmi pengirim (Sender Address) OTP. |

---

### Langkah 4: Eksekusi Migrasi Skema Database
Untuk membuat tabel-tabel utama (`users`, `user_addresses`, `password_reset_otps`, `detection_histories`, `translation_histories`) beserta indeks pencariannya, jalankan migrasi database SQL otomatis:
```bash
npm run migrate
```
**Ekspektasi Output:**
```
Migration success: 001_init_schema.sql
All migrations completed
```

### Langkah 5: Menjalankan Server Aplikasi
Jalankan server pengembangan lokal dengan fitur restart otomatis (hot-reload) saat kode berubah:
```bash
npm run dev
```
**Ekspektasi Output:**
```
[nodemon] starting `node src/server.js`
Server running on port 5000
```

### Langkah 6: Validasi Cepat dengan Health Check
Buka browser Anda atau jalankan perintah curl di terminal terpisah untuk mengonfirmasi kesehatan API:
```bash
curl http://localhost:5000/api/v1/health
```
**Ekspektasi Respons:**
```json
{
  "success": true,
  "message": "API healthy",
  "data": {
    "status": "healthy"
  }
}
```

---

## Panduan Pengujian API dengan Postman & Newman

Alur kerja backend terlindungi oleh suite pengujian otomatis yang disertakan dalam folder `postman/`.

### 1. Eksekusi via Aplikasi Postman
1. Impor berkas koleksi: `postman/DyslexiaLens-Backend.postman_collection.json`
2. Impor berkas lingkungan: `postman/DyslexiaLens-Local.postman_environment.json`
3. Pilih environment **DyslexiaLens Local** pada sudut kanan atas Postman.
4. Jalankan pengujian per folder dari atas ke bawah untuk memicu alur variabel otomatis (seperti token JWT dan OTP yang di-chain langsung dari respons endpoint sebelumnya):
   - **Urutan Pengujian:** System → Auth → Profile → AI → History → Negative Tests.

### 2. Eksekusi Otomatis via Newman CLI
Jika Anda ingin mengintegrasikannya dengan pipeline CI/CD atau ingin menjalankan pengujian instan dari terminal:
```bash
# Pasang newman global jika belum terpasang
npm install -g newman

# Jalankan suite pengujian lengkap
newman run postman/DyslexiaLens-Backend.postman_collection.json -e postman/DyslexiaLens-Local.postman_environment.json
```

---

## Panduan Penanganan Kendala (Troubleshooting)

Berikut adalah ringkasan masalah umum yang sering dihadapi beserta solusi konkretnya:

### 1. Kendala Koneksi Database PostgreSQL

> **Gejala:** Muncul error `password authentication failed for user` atau `FATAL: database "dyslexialens" does not exist`.

* **Solusi A (Autentikasi):**
  Pastikan password PostgreSQL Anda dalam variabel `DATABASE_URL` atau `DB_PASSWORD` di `.env` sudah tepat. Jika PostgreSQL lokal tidak memerlukan password, sesuaikan isinya menjadi `postgresql://postgres:@localhost:5432/dyslexialens`.
* **Solusi B (Database Belum Ada):**
  Pastikan Anda telah membuat database sebelum menjalankan migrasi. Ketik perintah `createdb -U postgres dyslexialens` di terminal lokal Anda.
* **Solusi C (Koneksi Port):**
  Gunakan perintah PowerShell berikut untuk memastikan PostgreSQL berjalan aktif di sistem Windows Anda:
  ```powershell
  Get-Service postgresql* | Select-Object Name,Status
  ```

### 2. Gagal Menghubungi Model AI (AI Engine Error)

> **Gejala:** Mengunggah gambar ke `/ai/detections` atau `/ai/translations` mengembalikan error status **502 Bad Gateway** atau **504 Gateway Timeout**.

* **Solusi A (Periksa Host & URL):**
  Pastikan URL dalam variabel `AI_MODEL_BASE_URL` di berkas `.env` menunjuk ke server model AI yang aktif (bukan server mati). Pastikan tidak ada slash tambahan di akhir URL jika tidak diperlukan, meskipun backend secara otomatis menanganinya.
* **Solusi B (Kunci API Salah):**
  Pastikan nilai `AI_MODEL_API_KEY` sama persis dengan kunci API yang dipasang pada server model AI disleksia untuk menghindari penolakan akses.
* **Solusi C (Timeout):**
  Jika model AI memerlukan waktu lebih lama untuk melakukan cold-start atau inferensi berkas gambar yang besar, naikkan batas waktu tunggu melalui variabel `AI_MODEL_TIMEOUT_MS=60000` (60 detik) di `.env`.

### 3. Gagal Mengirim Email OTP (SMTP Mailer Error)

> **Gejala:** Endpoint `/auth/forgot-password` atau inisiasi `/auth/change-password` mengembalikan error internal server.

* **Solusi A (Verifikasi Kredensial SMTP):**
  Periksa kembali variabel `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, dan `SMTP_PASS` Anda. Jika menggunakan Brevo/SendGrid, pastikan API Key/SMTP Key yang disalin sudah valid dan belum kadaluarsa.
* **Solusi B (Port Blokir):**
  Beberapa penyedia VPS atau jaringan lokal memblokir port keluar `25` atau `465`. Gunakan port TLS default **`587`** untuk koneksi SMTP aman.
* **Solusi C (Sender Address):**
  Pastikan `SMTP_FROM` merupakan email terverifikasi yang didaftarkan pada akun SMTP Anda. Penyedia SMTP seperti Brevo akan menolak pengiriman jika alamat pengirim tidak dikenal.

### 4. Server Gagal Dijalankan (Startup Port Conflict)

> **Gejala:** Muncul error `EADDRINUSE: address already in use :::5000`.

* **Solusi:**
  Port `5000` sedang digunakan oleh aplikasi lain di komputer Anda. Anda bisa menghentikan proses tersebut atau mengganti port aktif backend dengan mengubah variabel `PORT=5001` di berkas `.env` Anda, kemudian sesuaikan base URL di Postman environment.

---

## Kualitas Kode & Pemeliharaan

### Lakukan Pemeriksaan Linter
Gunakan linter ESLint untuk memastikan gaya dan kualitas penulisan kode tetap bersih dan tidak memiliki potensi bug:
```bash
npm run lint
```

### Jalankan Auto-Fix Linter
Perbaiki pelanggaran gaya penulisan kode (formatting/style) secara otomatis:
```bash
npm run lint:fix
```

### Prosedur Backup & Restore Database Lokal

```bash
# Prosedur Backup seluruh database ke berkas SQL
pg_dump -U postgres dyslexialens > backup-dyslexialens-db.sql

# Prosedur Restore database dari berkas SQL cadangan
psql -U postgres -d dyslexialens < backup-dyslexialens-db.sql
```

---

**Last Updated:** June 1, 2026
