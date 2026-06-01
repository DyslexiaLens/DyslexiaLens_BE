## DyslexiaLens Backend - Daftar Pengecekan Implementasi

## ✅ Fase 1: Scaffold & Setup (SELESAI)

### Inisialisasi Proyek

- [x] Inisialisasi proyek Node dengan `npm init`
- [x] Install dependency utama (express, pg, jsonwebtoken, bcrypt, multer, express-validator, dotenv, cors, helmet, morgan)
- [x] Install dev dependency (nodemon, eslint, @eslint/js)
- [x] Konfigurasi modul ESM (`"type": "module"` di package.json)
- [x] Siapkan script di `package.json` (dev, start, migrate, lint, lint:fix)

### Konfigurasi & Bootstrap

- [x] Buat file `.env.example`
- [x] Buat file `.env` untuk development lokal
- [x] Buat `src/config/env.js` untuk validasi environment
- [x] Buat `src/config/database.js` (koneksi pool PostgreSQL)
- [x] Buat `src/app.js` (setup Express app)
- [x] Buat `src/server.js` (bootstrap server)
- [x] Pasang middleware: cors, helmet, express.json, morgan, dan static folder untuk uploads

### Utilities & Helper

- [x] `src/utils/httpError.js` (custom error class)
- [x] `src/utils/asyncHandler.js` (wrapper try-catch)
- [x] `src/utils/response.js` (format response sukses)
- [x] `src/utils/jwt.js` (sign & verify token)
- [x] `src/utils/password.js` (hash & compare password)
- [x] `src/utils/otp.js` (generator OTP)

### Middleware

- [x] `src/middlewares/authMiddleware.js` (verifikasi JWT)
- [x] `src/middlewares/errorHandler.js` (global error handler)
- [x] `src/middlewares/uploadMiddleware.js` (multer dengan validasi tipe & ukuran)

### Validator

- [x] `src/validators/authValidator.js` (register, login, OTP, password)
- [x] `src/validators/profileValidator.js` (profile, address)
- [x] `src/validators/historyValidator.js` (params list history)
- [x] `src/validators/uploadValidator.js` (validasi upload file)
- [x] `src/validators/validationResult.js` (handler error validasi)

### Skema Database

- [x] `migrations/001_init_schema.sql` (table users, addresses, OTP, histories)
- [x] Tambah index untuk performa
- [x] Tambah foreign key dengan cascade delete bila diperlukan
- [x] Buat `src/config/migrate.js` (runner migration)

---

## ✅ Fase 2: Services & Business Logic (SELESAI)

### Models (Lapisan Data)

- [x] `src/models/userModel.js` (create, find, update, fungsi password)
- [x] `src/models/otpModel.js` (create, find, mark-as-used)
- [x] `src/models/historyModel.js` (detection, translation, list, delete)

### Services (Logika Bisnis)

- [x] `src/services/mockAiService.js` (mock AI, mudah diganti)
- [x] `src/services/authService.js` (register, login, forgot, reset, change)
- [x] `src/services/profileService.js` (get, update profile & address)
- [x] `src/services/aiService.js` (point integrasi untuk upload detection/translation)
- [x] `src/services/historyService.js` (list, detail, delete)

### Controllers (Lapisan HTTP)

- [x] `src/controllers/authController.js`
- [x] `src/controllers/profileController.js`
- [x] `src/controllers/aiController.js`
- [x] `src/controllers/historyController.js`

### Routes

- [x] `src/routes/authRoutes.js`
- [x] `src/routes/profileRoutes.js`
- [x] `src/routes/aiRoutes.js`
- [x] `src/routes/historyRoutes.js`
- [x] `src/routes/index.js` (router utama + health)

---

## ✅ Fase 3: Kualitas & Dokumentasi (SELESAI)

### Kualitas Kode

- [x] `eslint.config.js` disiapkan
- [x] Jalankan ESLint & perbaiki masalah

### Pengujian Postman

- [x] `postman/DyslexiaLens-Backend.postman_collection.json` (koleksi API)
- [x] `postman/DyslexiaLens-Local.postman_environment.json` (environment)
- [x] Tambahkan skrip test di Postman
- [x] Chain variable (access_token, otp_code, history_id)
- [x] Sertakan kasus negatif untuk auth
- [x] Susun koleksi menjadi folder saja, tidak ada request di root
- [x] Tambahkan alias endpoint untuk `/analysis/*`, `/history`, `/auth/me`, `/auth/logout`, `/uploads`

### Dokumentasi

- [x] `README.md` (panduan setup & endpoint)
- [x] `SETUP.md` (referensi cepat & troubleshooting)
- [x] `API_CONTRACT.md` (detail endpoint & praktik terbaik)
- [x] `.gitignore` diperbarui
- [x] `TEST_RESULTS.md` (ringkasan validasi terbaru)

### Upload File

- [x] `uploads/.gitkeep` (placeholder folder)

---

## 📋 Fase Berikutnya: Testing & Validasi (PERLU INPUT USER)

### 1. Koneksi PostgreSQL

- [ ] Pastikan service PostgreSQL berjalan
- [ ] Update `DATABASE_URL` di `.env` dengan kredensial lokal
- [ ] Tes koneksi: `psql -U <user> -d dyslexialens`

### 2. Jalankan Migration

```bash
npm run migrate
```

- [ ] Pastikan semua tabel tercipta
- [ ] Pastikan index dibuat

### 3. Jalankan Server

```bash
npm run dev
```

- [ ] Pastikan server mendengarkan di port 5000
- [ ] Cek endpoint health: `GET http://localhost:5000/api/v1/health`

### 4. Smoke Test API (Postman/Curl)

- [ ] Register user baru
- [ ] Login dan capture token
- [ ] Get profile dengan token
- [ ] Update profile
- [ ] Forgot password → verify OTP → reset password
- [ ] Upload detection image
- [ ] Get histories
- [ ] Delete history

### 5. Run Lint Final Check

```bash
npm run lint
```

- [ ] Tidak ada error
- [ ] Tidak ada warning

---

## 🚀 Kesiapan Deploy

### Checklist Pra-Production

- [ ] Update `.env` untuk production
- [ ] Ganti `JWT_SECRET` dengan string random (32+ chars)
- [ ] Update `DATABASE_URL` ke DB production
- [ ] Set `NODE_ENV=production`
- [x] Konfigurasi CORS ke domain frontend
- [ ] Tambahkan rate limiting (opsional)
- [ ] Setup logging (opsional)

### Opsi Deploy

1. **Node Server** (VPS, Heroku, Railway, Render)
   - [ ] `npm install`
   - [ ] `npm run migrate`
   - [ ] `npm run start` (atau gunakan PM2)

2. **Docker** (Container)
   - [ ] Buat Dockerfile
   - [ ] Build & test lokal
   - [ ] Push ke registry

3. **Serverless** (AWS Lambda, GCF)
   - [ ] Adaptasi kode supaya stateless
   - [ ] Gunakan database terkelola

---

## 📚 Struktur File (Ringkasan)

```
back-end/
├── src/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── migrations/
├── postman/
├── uploads/
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 🎯 Cek Fitur

### Sistem Autentikasi

- [x] Register
- [x] Login
- [x] Forgot Password (OTP)
- [x] Verify OTP
- [x] Reset Password
- [x] Change Password

### Manajemen Profil

- [x] Get Profile
- [x] Update Profile
- [x] Update Address

### Upload & AI

- [x] Upload detection image
- [x] Upload translation image
- [x] Mock AI service
- [x] Simpan hasil ke history

### Manajemen History

- [x] Get detection histories
- [x] Get translation histories
- [x] Get history detail
- [x] Delete history

### Fitur Sistem

- [x] Health check
- [x] Global error handler
- [x] Validasi request
- [x] JWT auth
- [x] File upload
- [x] CORS & security headers

---

Generated: May 16, 2026
