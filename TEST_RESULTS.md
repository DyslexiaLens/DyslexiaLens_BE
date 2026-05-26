# Newman Testing Results - DyslexiaLens Backend

**Latest Validation:** ✅ **ALL CONFIGURED TESTS PASSED**

---

## Summary

The Postman collection has been reorganized into folders and validated successfully against the current backend implementation.

### Current Coverage

- System: `GET /api/v1/health`
- Auth: register, login, forgot password, verify OTP, reset password, change password, me, logout
- Profile: get, update, update address
- AI: predict, translate, upload
- History: combined list, detail, delete, detection list, translation list
- Negative tests: login, register, forgot password, reset password, upload, profile, and transport failure cases

### Notes

- Upload tests use the sample file at `postman/sample-image.svg`.
- The collection is structured into folders only; no request sits at the root level.
- Some UI-only result cases remain documented in the collection notes rather than being run as API requests.

---

# Hasil Pengujian Newman - DyslexiaLens Backend

**Tanggal run:** 2026-05-26

## Ringkasan Run (resmi)

- Koleksi: DyslexiaLens Backend
- Environment: DyslexiaLens Local
- Iterasi: 1
- Request dieksekusi: 47 (5 errored / koneksi gagal)
- Test dieksekusi: 47 (0 gagal)
- Assertions: 31 (0 gagal)

## Pengamatan Utama

- Alur API positif (System → Auth → Profile → AI → History) berhasil: endpoint AI (`/analysis/predict`, `/analysis/translate`, `/uploads`) mengembalikan 201 sesuai ekspektasi.
- Kelima request yang errored adalah kegagalan koneksi terhadap `{{bad_base_url}}` (kasus negatif jaringan yang disengaja menggunakan http://localhost:5999). Error: `ECONNREFUSED` — ini perilaku yang diharapkan untuk tes jaringan negatif.
- Tes upload menggunakan berkas sample pada `postman/sample-image.svg` dan berhasil pada alur positif.

## Rekomendasi

- Jika ingin exit code CI nol (semua hijau), hapus atau skip kasus jaringan negatif, atau sediakan mock server untuk `{{bad_base_url}}` sebelum menjalankan Newman.
- Saya dapat commit artefak test atau menjalankan ulang Newman dan melampirkan `test-results.json` lengkap bila diperlukan.

---

Hasil lengkap diekspor oleh Newman; file `test-results.json` tersedia di root workspace.
