# API Contract - DyslexiaLens Backend

Dokumen ini mendokumentasikan spesifikasi antarmuka pemrograman aplikasi (API Contract) secara lengkap untuk **DyslexiaLens Backend**. API ini dibangun menggunakan Express.js, PostgreSQL, JWT Authentication, dan terintegrasi secara langsung dengan model AI deteksi serta translasi disleksia.

## Ringkasan Konfigurasi & Standar

- **Base URL Pengembangan Lokal:** `http://localhost:5000/api/v1`
- **Format Content-Type Default:** `application/json` (Kecuali untuk unggah gambar menggunakan `multipart/form-data`)
- **Skema Autentikasi:** JWT Bearer Token disertakan dalam header request:
  ```
  Authorization: Bearer <accessToken>
  ```

---

## Format Respons Standar

Untuk memastikan konsistensi dalam integrasi frontend, semua respons API mematuhi standar JSON berikut:

### 1. Respons Sukses (Status Code 2xx)

```json
{
  "success": true,
  "message": "Pesan deskriptif keberhasilan operasi",
  "data": {
    /* payload data */
  }
}
```

### 2. Respons Gagal (Status Code 4xx / 5xx)

```json
{
  "success": false,
  "message": "Pesan deskriptif kesalahan",
  "errors": null
}
```

### 3. Respons Validasi Input Gagal (Status Code 400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "type": "field",
      "value": "nilai_input",
      "msg": "Pesan deskripsi kesalahan validasi",
      "path": "nama_field",
      "location": "body"
    }
  ]
}
```

---

## Daftar Endpoint Lengkap

### 1. Endpoint Sistem

#### GET `/health`
Mengecek status kesehatan dan operasional server API. Tidak memerlukan autentikasi.

- **Headers:** Tidak ada
- **Respons Sukses (200 OK):**
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

### 2. Endpoint Autentikasi (Auth)

#### POST `/auth/register`
Mendaftarkan akun pengguna baru.

- **Request Body (JSON):**
  - `fullName` (string, required, non-empty)
  - `email` (string, required, valid email format)
  - `password` (string, required, min 8 characters)
- **Respons Sukses (201 Created):**
  ```json
  {
    "success": true,
    "message": "Register success",
    "data": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@mail.com",
      "createdAt": "2026-05-31T21:47:34.000Z"
    }
  }
  ```
- **Respons Gagal (409 Conflict - Email Terdaftar):**
  ```json
  {
    "success": false,
    "message": "Email already registered",
    "errors": null
  }
  ```

#### POST `/auth/login`
Melakukan autentikasi pengguna dan menghasilkan Access Token JWT.

- **Request Body (JSON):**
  - `email` (string, required, valid email format)
  - `password` (string, required, non-empty)
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "fullName": "John Doe",
        "email": "john@mail.com",
        "createdAt": "2026-05-31T21:47:34.000Z"
      }
    }
  }
  ```
- **Respons Gagal (401 Unauthorized - Kredensial Salah):**
  ```json
  {
    "success": false,
    "message": "Invalid email or password",
    "errors": null
  }
  ```

#### POST `/auth/forgot-password`
Meminta pengiriman kode OTP reset password ke email yang terdaftar.

- **Request Body (JSON):**
  - `email` (string, required, valid email format)
- **Respons Sukses (200 OK):**
  > [!NOTE]
  > Field `otpCode` hanya akan dikembalikan pada respons jika server berjalan dalam lingkungan pengembangan (`NODE_ENV=development`). Di lingkungan production, kode OTP hanya dikirim via email.
  ```json
  {
    "success": true,
    "message": "If email is registered, OTP has been sent",
    "data": {
      "message": "If email is registered, OTP has been sent",
      "otpCode": "123456"
    }
  }
  ```

#### POST `/auth/verify-otp`
Memverifikasi validitas kode OTP yang telah dikirim ke email pengguna.

- **Request Body (JSON):**
  - `email` (string, required, valid email format)
  - `otpCode` (string, required, tepat 6 digit)
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP verified",
    "data": {
      "verified": true
    }
  }
  ```
- **Respons Gagal (400 Bad Request - OTP Kadaluarsa/Salah):**
  ```json
  {
    "success": false,
    "message": "OTP invalid or already used",
    "errors": null
  }
  ```

#### POST `/auth/reset-password`
Melakukan reset password lama ke password baru menggunakan kode OTP yang valid.

- **Request Body (JSON):**
  - `email` (string, required, valid email format)
  - `otpCode` (string, required, tepat 6 digit)
  - `newPassword` (string, required, min 8 characters)
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password reset success",
    "data": {
      "reset": true
    }
  }
  ```

#### POST `/auth/change-password/otp`
Meminta pengiriman OTP ke email pengguna aktif untuk alur perubahan password secara aman (membutuhkan autentikasi JWT).

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "data": {
      "message": "OTP has been sent to your email",
      "otpCode": "654321"
    }
  }
  ```

#### PATCH `/auth/change-password`
Mengubah password pengguna aktif (membutuhkan autentikasi JWT). Endpoint ini mendukung mekanisme perubahan **dua langkah** (dengan atau tanpa OTP langsung).

- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body (JSON):**
  - `currentPassword` (string, required)
  - `newPassword` (string, required, min 8 characters)
  - `otpCode` (string, optional, 6 digit)
- **Respons Sukses Langkah 1 - Pengiriman OTP (Jika `otpCode` tidak diisi):**
  ```json
  {
    "success": true,
    "message": "OTP has been sent to your email",
    "data": {
      "requiresOtp": true,
      "message": "OTP has been sent to your email",
      "otpCode": "654321"
    }
  }
  ```
- **Respons Sukses Langkah 2 - Update Password (Jika `otpCode` diisi & valid):**
  ```json
  {
    "success": true,
    "message": "Password changed",
    "data": {
      "changed": true
    }
  }
  ```

#### GET `/auth/me`
Mengambil detail profil pengguna aktif saat ini.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  > [!TIP]
  > Format data profil sama persis dengan endpoint `/profile`.
  ```json
  {
    "success": true,
    "message": "Get profile success",
    "data": {
      "id": 1,
      "fullName": "John Doe",
      "name": "John Doe",
      "email": "john@mail.com",
      "phone": "",
      "birthDate": null,
      "avatarUrl": null,
      "createdAt": "2026-05-31T21:47:34.000Z",
      "personalInfo": {
        "fullName": "John Doe",
        "email": "john@mail.com",
        "phone": "",
        "birthDate": null,
        "avatarUrl": null,
        "joinedAt": "2026-05-31T21:47:34.000Z"
      },
      "address": {
        "city": "",
        "postalCode": "",
        "country": ""
      }
    }
  }
  ```

#### POST `/auth/logout`
Melakukan logout pengguna. Endpoint ini stateless, sehingga client cukup menghapus token JWT dari penyimpanan lokalnya setelah mendapat respons.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logout success",
    "data": {
      "loggedOut": true
    }
  }
  ```

---

### 3. Endpoint Profil & Alamat

#### GET `/profile`
Mendapatkan informasi profil lengkap beserta detail alamat dari pengguna yang terautentikasi.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Get profile success",
    "data": {
      "id": 1,
      "fullName": "John Doe",
      "name": "John Doe",
      "email": "john@mail.com",
      "phone": "+628123456789",
      "birthDate": "2000-01-01",
      "avatarUrl": "uploads/avatar.jpg",
      "createdAt": "2026-05-31T21:47:34.000Z",
      "created_at": "2026-05-31T21:47:34.000Z",
      "personalInfo": {
        "fullName": "John Doe",
        "email": "john@mail.com",
        "phone": "+628123456789",
        "birthDate": "2000-01-01",
        "avatarUrl": "uploads/avatar.jpg",
        "joinedAt": "2026-05-31T21:47:34.000Z"
      },
      "address": {
        "city": "Jakarta",
        "postalCode": "12345",
        "country": "Indonesia"
      }
    }
  }
  ```

#### PATCH `/profile`
Memperbarui informasi profil pribadi secara parsial.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body (JSON - semua opsional):**
  - `fullName` (string, minimal 1 karakter jika diisi)
  - `phone` (string)
  - `birthDate` (string, format tanggal ISO8601 seperti `YYYY-MM-DD`)
  - `avatarUrl` (string)
- **Respons Sukses (200 OK):**
  Mengembalikan objek profil terperbarui dengan struktur yang sama seperti `GET /profile`.

#### PATCH `/profile/address`
Memperbarui atau menyisipkan alamat tinggal baru milik pengguna (Upsert).

- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body (JSON):**
  - `country` (string, required)
  - `city` (string, required)
  - `postalCode` (string, required)
- **Respons Sukses (200 OK):**
  Mengembalikan objek profil lengkap dengan alamat terintegrasi yang telah terupdate.
  > [!NOTE]
  > Pada database PostgreSQL, kolom `street` dan `province` dalam tabel `user_addresses` akan otomatis diisi dengan string kosong `""` demi menjaga kompatibilitas struktur migrasi awal.

---

### 4. Endpoint Integrasi AI & Unggah

#### POST `/uploads`
Mengunggah berkas gambar secara langsung ke penyimpanan lokal server tanpa memicu pemrosesan AI.

- **Headers:**
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `image` (File Biner Gambar, max 5MB, format diperbolehkan: `jpeg`, `jpg`, `png`, `gif`, `svg`)
- **Respons Sukses (210 Created):**
  ```json
  {
    "success": true,
    "message": "Upload success",
    "data": {
      "imagePath": "uploads/20260531-17181920-sample.png",
      "fileName": "20260531-17181920-sample.png"
    }
  }
  ```

#### POST `/ai/detections` (Alias: `/analysis/predict`)
Mengunggah berkas gambar dokumen lembar tulisan tangan untuk dianalisis pola disleksianya oleh model AI.

- **Headers:**
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `image` (File Biner Gambar, max 5MB)
- **Respons Sukses (201 Created):**
  ```json
  {
    "success": true,
    "message": "Detection success",
    "data": {
      "result": {
        "imagePath": "uploads/20260531-17181920-sample.png",
        "predictedText": "LIKELY_DYSLEXIA_PATTERN",
        "confidence": 0.89,
        "resultLabel": "LIKELY_DYSLEXIA_PATTERN",
        "severityScore": 0.85,
        "severityLevel": "MODERATE",
        "rawModelResponse": {
          "label": "LIKELY_DYSLEXIA_PATTERN",
          "dyslexia_probability": 0.89,
          "severity_score": 0.85,
          "severity_level": "MODERATE",
          "result_text": "LIKELY_DYSLEXIA_PATTERN"
        }
      },
      "history": {
        "id": 8,
        "user_id": 1,
        "image_url": "uploads/20260531-17181920-sample.png",
        "predicted_text": "LIKELY_DYSLEXIA_PATTERN",
        "confidence": 0.89,
        "result_label": "LIKELY_DYSLEXIA_PATTERN",
        "raw_response": "{\"label\":\"LIKELY_DYSLEXIA_PATTERN\",\"dyslexia_probability\":0.89,...}",
        "created_at": "2026-05-31T21:47:34.000Z"
      }
    }
  }
  ```

#### POST `/ai/translations` (Alias: `/analysis/translate`)
Mengunggah berkas gambar dokumen tulisan tangan disleksia untuk ditranslasikan/dikoreksi menjadi teks normal yang terbaca.

- **Headers:**
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: multipart/form-data`
- **Request Body (Multipart):**
  - `image` (File Biner Gambar, max 5MB)
- **Respons Sukses (201 Created):**
  ```json
  {
    "success": true,
    "message": "Translation success",
    "data": {
      "result": {
        "imagePath": "uploads/20260531-17181921-sample.png",
        "sourceText": "Ths is hndwrttn text wth errors",
        "translatedText": "Ths is hndwrttn text wth errors",
        "sourceLanguage": "handwriting",
        "targetLanguage": "text",
        "rawModelResponse": {
          "result_text": "Ths is hndwrttn text wth errors"
        }
      },
      "history": {
        "id": 9,
        "user_id": 1,
        "image_url": "uploads/20260531-17181921-sample.png",
        "source_text": "Ths is hndwrttn text wth errors",
        "translated_text": "Ths is hndwrttn text wth errors",
        "source_language": "handwriting",
        "target_language": "text",
        "raw_response": "{\"result_text\":\"Ths is hndwrttn text wth errors\"}",
        "created_at": "2026-05-31T21:47:34.000Z"
      }
    }
  }
  ```

---

### 5. Endpoint Riwayat (History)

#### GET `/history` (Alias: `/histories`)
Mengambil seluruh riwayat gabungan (baik deteksi disleksia maupun translasi teks) milik pengguna aktif saat ini.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Get history success",
    "data": {
      "histories": [
        {
          "id": 8,
          "user_id": 1,
          "image_url": "uploads/20260531-17181920-sample.png",
          "predicted_text": "LIKELY_DYSLEXIA_PATTERN",
          "confidence": 0.89,
          "result_label": "LIKELY_DYSLEXIA_PATTERN",
          "source_text": null,
          "translated_text": null,
          "source_language": null,
          "target_language": null,
          "raw_response": "{\"label\":\"LIKELY_DYSLEXIA_PATTERN\",...}",
          "created_at": "2026-05-31T21:47:34.000Z",
          "type": "detection"
        },
        {
          "id": 9,
          "user_id": 1,
          "image_url": "uploads/20260531-17181921-sample.png",
          "predicted_text": null,
          "confidence": null,
          "result_label": null,
          "source_text": "Ths is hndwrttn text wth errors",
          "translated_text": "Ths is hndwrttn text wth errors",
          "source_language": "handwriting",
          "target_language": "text",
          "raw_response": "{\"result_text\":\"Ths is hndwrttn...\"}",
          "created_at": "2026-05-31T21:47:35.000Z",
          "type": "translation"
        }
      ]
    }
  }
  ```

#### GET `/history/:id` (Alias: `/histories/:id`)
Mengambil satu detail riwayat berdasarkan ID universal, secara otomatis mendeteksi apakah riwayat tersebut bertipe `detection` atau `translation`.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Get history detail success",
    "data": {
      "history": {
        "id": 8,
        "user_id": 1,
        "image_url": "uploads/20260531-17181920-sample.png",
        "predicted_text": "LIKELY_DYSLEXIA_PATTERN",
        "confidence": 0.89,
        "result_label": "LIKELY_DYSLEXIA_PATTERN",
        "source_text": null,
        "translated_text": null,
        "source_language": null,
        "target_language": null,
        "raw_response": "{\"label\":\"LIKELY_DYSLEXIA_PATTERN\",...}",
        "created_at": "2026-05-31T21:47:34.000Z",
        "type": "detection"
      }
    }
  }
  ```

#### DELETE `/history/:id` (Alias: `/histories/:id`)
Menghapus satu rekaman riwayat berdasarkan ID universal milik pengguna aktif saat ini.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Delete history success",
    "data": {
      "deleted": true
    }
  }
  ```

#### GET `/histories/detections`
Mengambil semua daftar riwayat analisis deteksi disleksia saja.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Get detection histories success",
    "data": [
      {
        "id": 8,
        "user_id": 1,
        "image_url": "uploads/20260531-17181920-sample.png",
        "predicted_text": "LIKELY_DYSLEXIA_PATTERN",
        "confidence": 0.89,
        "result_label": "LIKELY_DYSLEXIA_PATTERN",
        "raw_response": "...",
        "created_at": "2026-05-31T21:47:34.000Z"
      }
    ]
  }
  ```

#### GET `/histories/translations`
Mengambil semua daftar riwayat analisis translasi teks tulisan tangan saja.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Get translation histories success",
    "data": [
      {
        "id": 9,
        "user_id": 1,
        "image_url": "uploads/20260531-17181921-sample.png",
        "source_text": "Ths is hndwrttn text wth errors",
        "translated_text": "Ths is hndwrttn text wth errors",
        "source_language": "handwriting",
        "target_language": "text",
        "raw_response": "...",
        "created_at": "2026-05-31T21:47:35.000Z"
      }
    ]
  }
  ```

#### GET `/histories/:type/:id`
Mengambil satu detail riwayat dari tabel tertentu berdasarkan jenis rutenya (`type`: `detection` atau `translation`) dan ID riwayat.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Path Parameters:**
  - `type` (string, must be `detection` or `translation`)
  - `id` (integer, ID rekaman riwayat)
- **Respons Sukses (200 OK):**
  Mengembalikan objek mentah rekaman riwayat langsung dari tabel terkait.

#### DELETE `/histories/:type/:id`
Menghapus satu rekaman riwayat dari tabel tertentu berdasarkan jenis rute (`type`) dan ID riwayat.

- **Headers:** `Authorization: Bearer <accessToken>`
- **Respons Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Delete history success",
    "data": {
      "deleted": true
    }
  }
  ```

---

## Pedoman Praktik Terbaik Pengembangan Backend

### 1. Pola Layanan (Service Layer Pattern)
Seluruh logika bisnis harus didelegasikan pada folder `src/services/`. Controller hanya bertugas menangani pembacaan parameter request HTTP dan pengembalian respons JSON terformat demi menjaga struktur kode agar modular serta mudah diuji (unit testing).

### 2. Penanganan Error Terpusat (Centralized Error Handling)
Gunakan objek `HttpError` untuk memicu penghentian alur kerja secara elegan saat terjadi kesalahan bisnis/akses. Middleware `errorHandler.js` akan menangkap error tersebut dan merumuskannya menjadi respons JSON standar, mencegah aplikasi crash karena unhandled rejection.
```javascript
if (!user) {
  throw new HttpError(404, "User not found");
}
```

### 3. Validasi Input yang Ketat
Setiap input di route wajib dideklarasikan validasinya menggunakan validator dari folder `src/validators/` berbasis `express-validator` untuk memfilter data kotor/bahaya sebelum menyentuh service bisnis atau query database.

### 4. Optimalisasi Database
- Gunakan query berparameter (parameterized queries) untuk menghindari ancaman serangan SQL Injection.
- Selalu pastikan index yang tepat dipasang pada kolom pencarian aktif seperti `user_id` di tabel history demi kecepatan retrieval data berskala besar.
- Batasi hasil query daftar di masa mendatang dengan paginasi (`LIMIT` dan `OFFSET`).

### 5. Keamanan Upload Gambar
- Validasi ketat tipe MIME berkas gambar di server.
- Terapkan limitasi ukuran unggah berkas (`MAX_FILE_SIZE_MB`).
- Ganti nama berkas yang disimpan menggunakan nama acak atau timestamp unik untuk mencegah tabrakan nama aset dan ancaman directory traversal.

---

**Last Updated:** June 1, 2026
