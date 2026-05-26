# DyslexiaLens Backend

Backend API untuk fitur autentikasi, profil pengguna, upload gambar, mock AI dyslexia detection/translation, dan history.

## Stack

- Node.js + Express.js
- PostgreSQL (`pg`)
- JWT auth (`jsonwebtoken`)
- Password hash (`bcrypt`)
- Upload image (`multer`)
- Validation (`express-validator`)
- Environment config (`dotenv`)
- Linting (`eslint`)

## Struktur Folder

- `src/config`: konfigurasi env dan koneksi database.
- `src/routes`: definisi endpoint RESTful.
- `src/controllers`: handler HTTP.
- `src/services`: business logic (mudah ganti mock AI ke AI asli).
- `src/middlewares`: auth JWT, upload middleware, error handler.
- `src/validators`: validasi request.
- `src/models`: query SQL ke PostgreSQL.
- `src/utils`: helper umum.
- `migrations`: SQL schema.
- `postman`: collection + environment untuk testing API.

## Setup

1. Install dependency:

```bash
npm install
```

2. Copy env:

```bash
cp .env.example .env
```

3. Buat database PostgreSQL lalu jalankan migration:

```bash
npm run migrate
```

4. Jalankan server:

```bash
npm run dev
```

## Endpoint Utama

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `PATCH /api/v1/auth/change-password`
- `GET /api/v1/profile`
- `PATCH /api/v1/profile`
- `PATCH /api/v1/profile/address`
- `POST /api/v1/analysis/predict` (multipart, field file: `image`)
- `POST /api/v1/analysis/translate` (multipart, field file: `image`)
- `POST /api/v1/uploads` (multipart, field file: `image`)
- `GET /api/v1/histories/detections`
- `GET /api/v1/histories/translations`
- `GET /api/v1/history`
- `GET /api/v1/history/:id`
- `GET /api/v1/histories/:type/:id`
- `DELETE /api/v1/histories/:type/:id`
- `GET /api/v1/health`

## Format Response

Sukses:

```json
{
  "success": true,
  "message": "Login success",
  "data": {
    "accessToken": "...",
    "user": {
      "id": 1,
      "fullName": "User",
      "email": "user@mail.com"
    }
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "email must be valid",
      "path": "email"
    }
  ]
}
```

## Postman Testing

- Import collection: `postman/DyslexiaLens-Backend.postman_collection.json`
- Import environment: `postman/DyslexiaLens-Local.postman_environment.json`
- Jalankan dari folder paling atas ke bawah: System → Auth → Profile → AI → History → Negative Tests.
- Semua request sudah ada di dalam folder, tidak ada item root.
- Collection test otomatis simpan `access_token`, `otp_code`, dan `history_id`.
- Upload tests memakai file sample di `postman/sample-image.svg`.

## Catatan Mock AI

- Implementasi mock AI ada di `src/services/mockAiService.js`.
- Saat model AI asli tersedia, cukup ganti isi service ini tanpa ubah controller/route utama.

---

## Dokumentasi Lengkap

### Fitur Utama Backend

**Auth & Akun**

- Register dengan validasi email + password min 8 char
- Login generate JWT token (default 7 hari expiry)
- Forgot password + OTP (config: 10 menit expiry)
- Verify OTP + Reset password
- Change password (auth required)
- Mode development: OTP ditampilkan di response untuk QA
- Get current user via `/auth/me`
- Logout via `/auth/logout`

**Profile & Alamat**

- Get profile lengkap (auth required)
- Update profile partial (fullName, phone, birthDate, avatarUrl)
- Upsert address per user (one-to-one)

**AI Upload & Deteksi Disleksia**

- Upload image deteksi dyslexia (multipart): disimpan ke `/uploads`
- Upload image deteksi dyslexia via `/analysis/predict` atau `/ai/detections`
- Upload image translate OCR handwriting via `/analysis/translate` atau `/ai/translations`
- Upload file langsung via `/uploads`
- Mock AI di `src/services/mockAiService.js` untuk development
- Hasil simpan otomatis ke tabel `detection_histories` dan `translation_histories`

**History Management**

- Get detection histories (user-scoped, order by created_at DESC)
- Get translation histories (user-scoped, order by created_at DESC)
- Get all histories via `/history`
- Get detail history by type + id
- Delete history (hard delete current, dapat dijadikan soft delete)

### Error Handling & Response Format

Backend menangani semua error secara terpusat via middleware errorHandler:

| Error Case             | HTTP | Message                  | Details                           |
| ---------------------- | ---- | ------------------------ | --------------------------------- |
| Validasi gagal         | 400  | Validation error         | Array of validation errors        |
| Auth header invalid    | 401  | Unauthorized             | -                                 |
| Token expired/invalid  | 401  | Invalid or expired token | -                                 |
| Email sudah terdaftar  | 409  | Data already exists      | from PostgreSQL unique constraint |
| Resource not found     | 404  | Route/Resource not found | null                              |
| File upload salah tipe | 400  | Only image files allowed | null                              |
| File size >limit       | 413  | Payload Too Large        | null                              |
| Database error         | 500  | Internal server error    | mapped from DB error code         |

Response format konsisten:

```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": null atau [{ msg: "...", path: "fieldName" }]
}
```

### Struktur Database (PostgreSQL 18)

**users** table

```sql
id BIGSERIAL PRIMARY KEY
full_name VARCHAR(120) NOT NULL
email VARCHAR(120) UNIQUE NOT NULL
password_hash TEXT NOT NULL
phone VARCHAR(30)
birth_date DATE
avatar_url TEXT
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

**user_addresses** table (one-to-one)

```sql
id BIGSERIAL PRIMARY KEY
user_id BIGINT UNIQUE NOT NULL (FK → users)
street TEXT NOT NULL
city VARCHAR(100) NOT NULL
province VARCHAR(100) NOT NULL
postal_code VARCHAR(20) NOT NULL
country VARCHAR(100) NOT NULL
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

**password_reset_otps** table

```sql
id BIGSERIAL PRIMARY KEY
user_id BIGINT NOT NULL (FK → users)
otp_code VARCHAR(6) NOT NULL
expires_at TIMESTAMP NOT NULL
is_used BOOLEAN DEFAULT FALSE
created_at TIMESTAMP DEFAULT NOW()
INDEX: idx_password_reset_otps_user_id (user_id)
```

**detection_histories** table

```sql
id BIGSERIAL PRIMARY KEY
user_id BIGINT NOT NULL (FK → users)
image_url TEXT NOT NULL
predicted_text TEXT
confidence NUMERIC(5,2)
result_label VARCHAR(100)
raw_response JSONB
created_at TIMESTAMP DEFAULT NOW()
INDEX: idx_detection_histories_user_id (user_id)
```

**translation_histories** table

```sql
id BIGSERIAL PRIMARY KEY
user_id BIGINT NOT NULL (FK → users)
image_url TEXT NOT NULL
source_text TEXT
translated_text TEXT
source_language VARCHAR(20)
target_language VARCHAR(20)
raw_response JSONB
created_at TIMESTAMP DEFAULT NOW()
INDEX: idx_translation_histories_user_id (user_id)
```

### Validasi Request & Constraints

**Auth Validator**

- fullName: required, non-empty trim string
- email: required, valid email format
- password: required, min 8 characters
- currentPassword: required for change-password
- newPassword: required, min 8 characters
- otpCode: exactly 6 digits

**Profile Validator**

- fullName: optional, non-empty string
- phone: optional, string format
- birthDate: optional, ISO8601 date format
- avatarUrl: optional, string format

**Address Validator**

- street, city, province, postalCode, country: all required, non-empty strings

**Upload Validator**

- file: required, MIME type must be `image/*`
- size: max 5 MB (configurable via `.env` MAX_FILE_SIZE_MB)

### JWT Authentication Flow

1. User melakukan register/login → server generate JWT token berisi `{ userId, email, iat, exp }`
2. Client kirim token di header: `Authorization: Bearer <accessToken>`
3. Middleware `authMiddleware.js` verify signature dan expiry
4. Jika valid: `req.user` didatangi dengan payload JWT
5. Jika invalid/expired: respond 401 Unauthorized

Token default expiry: 7 hari (configurable: `JWT_EXPIRES_IN` di .env)

### Mock AI Service

File: `src/services/mockAiService.js`

**Function: mockAnalyzeDyslexia(filePath)**

```javascript
{
  imagePath: "uploads/xxx.jpg",
  predictedText: "Ths is smple txt wth dyslxic ptrn" atau "This is normal text",
  confidence: 0.60 - 0.95 (random),
  resultLabel: "LIKELY_DYSLEXIA_PATTERN" atau "NORMAL_PATTERN",
  notes: "Mock AI response..."
}
```

**Function: mockTranslateHandwriting(filePath)**

```javascript
{
  imagePath: "uploads/xxx.jpg",
  sourceText: "Ths is hndwrttn sentence",
  translatedText: "This is handwritten sentence",
  sourceLanguage: "id",
  targetLanguage: "en",
  notes: "Mock AI response..."
}
```

**Cara replace dengan AI asli:**

1. Buat file baru: `src/services/realAiService.js` dengan signature function yang sama
2. Update `src/services/aiService.js`: ganti import dari mockAiService → realAiService
3. Controller dan route tidak perlu diubah (interface-based design)
4. Test minimal untuk memastikan signature output tetap kompatibel

### Deployment Checklist

**Before Deploy to Production:**

- [ ] Ubah `NODE_ENV=production` di `.env`
- [ ] Ganti `JWT_SECRET` ke string random kuat (32+ char). Contoh: `openssl rand -hex 32`
- [ ] Database URL pointing ke PostgreSQL production (cek credential, host, port, database name)
- [ ] `npm run lint` hasilnya clean (0 errors)
- [ ] `npm run migrate` berhasil tanpa error
- [ ] Test endpoint sampling: health, register (new user), login (retrieve token), get profile, update profile

**Development vs Production:**
| Setting | Dev | Prod |
|---------|-----|------|
| NODE_ENV | development | production |
| OTP di response | ✓ (visible) | ✗ (hidden) |
| Morgan log | dev (colored) | combined (file) |
| CORS | \* (allow all) | https://domain.frontend.com (specific) |
| Error detail | full stack | generic message only |
| Health endpoint | ✓ | ✓ |

**Skala & Optimasi (Future Roadmap):**

- Add Redis untuk caching profile, OTP verification
- Pagination ke list histories endpoint
- Rate limiting middleware (express-rate-limit)
- Centralized logging (Winston/Bunyan → file/log service)
- Connection pool optimization (PgBouncer)
- Database read replica untuk analytics
- CDN upload file ke S3/GCS
- Refresh token + token revocation list

### Contoh Integrasi Frontend (Axios)

```javascript
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1";
const client = axios.create({ baseURL: BASE_URL });

// 1. Register
const register = async (fullName, email, password) => {
  const res = await client.post("/auth/register", {
    fullName,
    email,
    password,
  });
  return res.data.data;
};

// 2. Login
const login = async (email, password) => {
  const res = await client.post("/auth/login", { email, password });
  const token = res.data.data.accessToken;
  client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  localStorage.setItem("token", token);
  return res.data.data;
};

// 3. Get Profile
const getProfile = async () => {
  const res = await client.get("/profile");
  return res.data.data;
};

// 4. Upload Detection Image
const uploadDetectionImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const res = await client.post("/ai/detections", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// 5. Get Histories
const getDetectionHistories = async () => {
  const res = await client.get("/histories/detections");
  return res.data.data;
};

// Setup interceptor untuk auto-add token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Folder Structure Penjelasan

```
back-end/
├── src/
│   ├── app.js                    # Express app + middleware setup
│   ├── server.js                 # Bootstrap + listen port
│   ├── config/
│   │   ├── env.js                # Env var validation & export
│   │   ├── database.js           # PostgreSQL pool init
│   │   └── migrate.js            # Run SQL migrations
│   ├── routes/
│   │   ├── index.js              # Main router + health check
│   │   ├── authRoutes.js         # POST /auth/* endpoints
│   │   ├── profileRoutes.js      # GET/PATCH /profile endpoints
│   │   ├── aiRoutes.js           # POST /ai/detections, /ai/translations
│   │   └── historyRoutes.js      # GET/DELETE /histories
│   ├── controllers/              # HTTP request handlers
│   ├── services/                 # Business logic + model operations
│   ├── models/                   # Raw SQL query functions
│   ├── middlewares/              # Global middleware (auth, error, upload)
│   ├── validators/               # express-validator rules
│   └── utils/                    # Helper utilities
├── migrations/                   # SQL migration files
├── postman/                      # Postman collection + env
├── uploads/                      # Uploaded files (git-ignored)
├── .env                          # Environment variables (git-ignored)
├── .env.example                  # Template (.env)
├── .gitignore
├── eslint.config.js              # ESLint configuration (flat config)
├── package.json
└── README.md
```

### NPM Scripts Reference

```bash
npm run dev           # Start with nodemon (auto-reload on change)
npm run start         # Start production server
npm run migrate       # Execute SQL migrations
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix linting issues
```

### Key Design Decisions

- **Service Layer**: Business logic terpisah dari controller, memudahkan testing & debugging
- **Direct SQL**: Menggunakan `pg` pool langsung bukan ORM, untuk kontrol penuh dan performance
- **Custom Error Class**: Consistent HTTP error format via `HttpError` class
- **Async Handler**: Wrapper untuk catch unhandled promise rejection otomatis
- **Express Validator**: Chain validation, parsed ke `req.body`, execute di middleware
- **Multer Upload**: File disimpan lokal ke `/uploads`, path tersimpan ke database
- **JWT Token**: Claim sederhana (userId, email), dapat diperluas sesuai kebutuhan

### Notes untuk Next Phase

- [ ] Implementasi refresh token + access token rotation
- [ ] Add soft delete column ke histories table
- [ ] Implement image optimization & resize (sharp)
- [ ] Add file upload ke cloud storage (S3/GCS)
- [ ] Implement OTP via email (SendGrid/Resend)
- [ ] Add role-based access control (admin, user)
- [ ] Add subscription/quota per user
- [ ] Implement analytics endpoint
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit/integration test coverage

### Support & Troubleshooting

**Server tidak start:**

- Check `.env` ada `JWT_SECRET`
- Check `DATABASE_URL` valid PostgreSQL connection string
- Check port 5000 sudah tidak dipakai aplikasi lain

**Migration gagal:**

- Check PostgreSQL server running
- Check credential di `DATABASE_URL` benar
- Check database sudah dibuat: `createdb dyslexialens`

**Upload endpoint error:**

- Check folder `uploads/` ada dan writable permission
- Check file size < `MAX_FILE_SIZE_MB` di .env
- Check MIME type `image/*`

**JWT token error:**

- Check header format: `Authorization: Bearer <token>`
- Check token belum expired
- Check `JWT_SECRET` di backend sama saat generate token

---

**Version:** DyslexiaLens Backend v1.0.0  
**Last Updated:** May 16, 2026
