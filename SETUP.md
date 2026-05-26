# Panduan Setup - DyslexiaLens Backend

Referensi cepat untuk menyiapkan lingkungan pengembangan lokal dan langkah dasar deploy ke production.

## Prasyarat

- Node.js v18+ (cek: `node --version`)
- PostgreSQL 14+ (cek: `psql --version`)
- npm v9+ (cek: `npm --version`)
- Git (cek: `git --version`)

## Setup Pengembangan Lokal (sekitar 5 menit)

### 1. Clone & Install

```bash
cd "d:/Homework/Dicoding/DBS Coding Camp/Capstone/back-end"
npm install
```

### 2. Siapkan Database

```bash
# Buat database PostgreSQL
createdb dyslexialens

# Atau pakai psql
psql -U postgres -c "CREATE DATABASE dyslexialens;"
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit file `.env` sesuai lingkungan:

```ini
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dyslexialens
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=10
MAX_FILE_SIZE_MB=5
```

### 4. Jalankan Migration

```bash
npm run migrate
```

Ekspektasi output:

```
Migration success: 001_init_schema.sql
All migrations completed
```

### 5. Jalankan Server

```bash
npm run dev
```

Ekspektasi output:

```
Server running on port 5000
```

### 6. Uji Endpoint Health

```bash
curl http://localhost:5000/api/v1/health
```

Contoh response:

```json
{
  "success": true,
  "message": "API healthy",
  "data": { "status": "ok" }
}
```

## Pengujian dengan Postman

1. Import collection: `postman/DyslexiaLens-Backend.postman_collection.json`
2. Import environment: `postman/DyslexiaLens-Local.postman_environment.json`
3. Jalankan koleksi dari atas ke bawah (variabel akan di-chain otomatis seperti token)

Contoh flow yang dianjurkan:

- Health → Register → Login → Get Profile → Forgot Password → Verify OTP → Reset Password

## Troubleshooting Umum

### Error: "password authentication failed"

```powershell
# Pastikan service PostgreSQL berjalan
Get-Service postgresql* | Select-Object Name,Status

# Tes koneksi manual
psql -U postgres -d dyslexialens -c "SELECT 1;"

# Cek kredensial PostgreSQL (user/password)
```

### Error: "Database dyslexialens does not exist"

```bash
# Buat database
createdb dyslexialens

# Verifikasi
psql -l | grep dyslexialens
```

### Error: "Port 5000 already in use"

```bash
# Ganti port di .env atau hentikan proses yang menggunakan port
lsof -i :5000
kill -9 <PID>

# Atau ubah PORT di .env ke 5001
```

### Error: "Cannot find module 'pg'"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Kualitas Kode

### Jalankan Lint

```bash
npm run lint
```

### Auto-fix Lint

```bash
npm run lint:fix
```

## Contoh Format Response

Semua endpoint mengikuti format respon berikut.

Success (2xx):

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* payload */
  }
}
```

Error (4xx, 5xx):

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": null atau [{ "msg": "...", "path": "field" }]
}
```

## Cheat Sheet Endpoint

Auth:

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/verify-otp
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me (requires auth)
POST /api/v1/auth/logout (requires auth)
PATCH /api/v1/auth/change-password (requires auth)
```

Profil:

```
GET /api/v1/profile (requires auth)
PATCH /api/v1/profile (requires auth)
PATCH /api/v1/profile/address (requires auth)
```

AI Upload:

```
POST /api/v1/analysis/predict (requires auth, multipart)
POST /api/v1/analysis/translate (requires auth, multipart)
POST /api/v1/uploads (requires auth, multipart)
```

History:

```
GET /api/v1/history (requires auth)
GET /api/v1/history/:id (requires auth)
DELETE /api/v1/history/:id (requires auth)
GET /api/v1/histories/detections (requires auth)
GET /api/v1/histories/translations (requires auth)
GET /api/v1/histories/:type/:id (requires auth)
DELETE /api/v1/histories/:type/:id (requires auth)
```

System:

```
GET /api/v1/health (no auth required)
```

## Urutan Jalankan Postman

Jalankan koleksi sesuai urutan folder:

1. System
2. Auth
3. Profile
4. AI
5. History
6. Negative Tests

Gunakan environment `postman/DyslexiaLens-Local.postman_environment.json`.

## Penggunaan Token JWT

Sertakan header berikut pada setiap request yang membutuhkan autentikasi:

```bash
# Contoh dengan curl
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:5000/api/v1/profile
```

## Mock AI Service

Saat ini menggunakan mock di `src/services/mockAiService.js`.
Untuk mengganti dengan AI asli, buat `src/services/realAiService.js` dan update `src/services/aiService.js` untuk mengimpor service baru.

## Deployment Singkat

1. Update `.env` untuk production (NODE_ENV=production, JWT_SECRET kuat, DATABASE_URL production)
2. Jalankan `npm run migrate` pada database production
3. Jalankan `npm run start` atau gunakan PM2 / Docker sesuai kebutuhan

## Variabel Environment (ringkasan)

| Variable            | Contoh                              | Keterangan                      |
| ------------------- | ----------------------------------- | ------------------------------- |
| NODE_ENV            | development \| production           | Mode runtime                    |
| PORT                | 5000                                | Port yang dipakai               |
| DATABASE_URL        | postgresql://user:pass@host:5432/db | Koneksi PostgreSQL              |
| JWT_SECRET          | abc123...                           | Kunci penanda token (32+ chars) |
| JWT_EXPIRES_IN      | 7d                                  | Masa berlaku token              |
| OTP_EXPIRES_MINUTES | 10                                  | Masa berlaku OTP (menit)        |
| MAX_FILE_SIZE_MB    | 5                                   | Batas ukuran unggah (MB)        |

## Penyimpanan Upload

Saat ini file disimpan di filesystem lokal (`/uploads`). Untuk pindah ke cloud storage (S3/GCS), update middleware upload dan controller untuk menyimpan URL cloud.

## Backup Database Singkat

```bash
# Backup
pg_dump dyslexialens > backup-$(date +%Y%m%d).sql

# Restore
psql dyslexialens < backup-20260516.sql
```

## Checklist Optimasi

- [ ] Tambah caching (Redis)
- [ ] Tambah index bila perlu
- [ ] Implement pagination
- [ ] Tambah rate limiting
- [ ] Aktifkan gzip
- [ ] Gunakan CDN untuk aset statis

- [ ] Monitor slow queries in PostgreSQL
- [ ] Set connection pool size appropriately

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Restrict CORS to frontend domain only
- [ ] Enable HTTPS-only cookies
- [ ] Add rate limiting on auth endpoints
- [ ] Sanitize user input (done via express-validator)
- [ ] Don't expose sensitive errors in production
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Use environment variables for secrets (never hardcode)
- [ ] Enable request logging for audit trail

## Common Issues & Solutions

| Issue                           | Solution                                                                  |
| ------------------------------- | ------------------------------------------------------------------------- |
| Server crashes on startup       | Check .env has JWT_SECRET, Database URL valid                             |
| 401 Unauthorized on valid token | Verify Authorization header format: `Bearer <token>`                      |
| File upload always fails        | Check `/uploads` folder exists and writable, file size < MAX_FILE_SIZE_MB |
| Slow queries                    | Check database indexes, use `EXPLAIN ANALYZE` on slow queries             |
| Memory leak                     | Profile with: `node --inspect src/server.js`                              |
| CORS error from frontend        | Configure CORS in `.env` or update `src/app.js` allowed origins           |

## Need Help?

1. Check README.md for detailed documentation
2. Check postman collection for endpoint examples
3. Run `npm run lint` to catch code issues
4. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql.log`
5. Check Node process: `Get-Process node` (Windows) or `ps aux | grep node` (Unix)

---

Last Updated: May 16, 2026
