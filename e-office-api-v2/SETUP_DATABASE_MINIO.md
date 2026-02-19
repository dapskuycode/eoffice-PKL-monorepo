# 🚀 Setup Database PostgreSQL & MinIO dengan Docker

## 📋 Prerequisites
- Docker Desktop sudah terinstall dan running
- PostgreSQL tools (opsional, untuk akses manual)
- Node.js & npm sudah terinstall

---

## 1️⃣ Setup PostgreSQL Database

### Opsi A: Menggunakan PostgreSQL di Laragon (Recommended untuk Windows)

Jika Anda sudah menggunakan Laragon, PostgreSQL sudah tersedia:

```bash
# 1. Pastikan Laragon sudah running
# 2. Buka pgAdmin atau terminal PostgreSQL

# 3. Buat database baru
psql -U postgres
```

Di PostgreSQL prompt:
```sql
CREATE DATABASE "persuratanSKL";
\q
```

### Opsi B: Menggunakan Docker PostgreSQL

Jika ingin pakai Docker untuk PostgreSQL:

```bash
# Jalankan PostgreSQL container
docker run -d \
  --name postgres-skl \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=senku \
  -e POSTGRES_DB=persuratanSKL \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Cek status container
docker ps | grep postgres-skl
```

---

## 2️⃣ Setup MinIO dengan Docker

### Step 1: Jalankan MinIO Container

```bash
# Masuk ke folder project
cd c:\laragon\www\skl\e-office-api-v2

# Jalankan MinIO dengan docker-compose
docker-compose -f docker-compose.minio.yml up -d

# Cek status container
docker ps
```

Anda akan melihat 2 container:
- `e-office-minio` (MinIO server)
- `e-office-minio-setup` (setup bucket, akan stop setelah selesai)

### Step 2: Akses MinIO Console

Buka browser dan akses:
```
http://localhost:9001
```

**Login Credentials:**
- Username: `minioadmin`
- Password: `minioadmin`

### Step 3: Verifikasi Bucket

Di MinIO Console, Anda akan melihat bucket `e-office-storage` sudah dibuat otomatis.

---

## 3️⃣ Migrasi Database Prisma

### Step 1: Generate Prisma Client

```bash
# Generate Prisma Client berdasarkan schema
npx prisma generate
```

### Step 2: Jalankan Migrasi

```bash
# Buat migrasi baru (jika belum ada)
npx prisma migrate dev --name init_skl_system

# Atau jalankan migrasi yang sudah ada
npx prisma migrate deploy
```

### Step 3: Seed Database dengan Data Dummy

```bash
# Jalankan seed file
npx tsx prisma/seed.ts

# Atau jika sudah ada script di package.json
npm run seed
```

---

## 4️⃣ Verifikasi Koneksi

### Verifikasi PostgreSQL

```bash
# Cek koneksi database
npx prisma studio
```

Akses Prisma Studio di: `http://localhost:5555`

### Verifikasi MinIO

```bash
# Test upload file (contoh sederhana)
# Bisa gunakan MinIO Console atau code
```

Di MinIO Console:
1. Klik bucket `e-office-storage`
2. Upload test file
3. Verifikasi file muncul di folder

---

## 5️⃣ Environment Variables Checklist

Pastikan file `.env` sudah berisi:

✅ **Database:**
```
DATABASE_URL="postgresql://postgres:senku@localhost:5432/persuratanSKL?schema=public"
```

✅ **MinIO:**
```
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="e-office-storage"
MINIO_USE_SSL="false"
```

---

## 6️⃣ Jalankan Aplikasi

```bash
# Install dependencies (jika belum)
npm install

# Jalankan aplikasi development
npm run dev
```

---

## 🔧 Troubleshooting

### Problem: Port 5432 sudah digunakan

**Solusi:**
```bash
# Cek process yang menggunakan port 5432
netstat -ano | findstr :5432

# Stop Laragon PostgreSQL atau ubah port di .env
DATABASE_URL="postgresql://postgres:senku@localhost:5433/persuratanSKL?schema=public"
```

### Problem: MinIO container tidak bisa start

**Solusi:**
```bash
# Stop dan remove container
docker-compose -f docker-compose.minio.yml down

# Remove volume jika perlu
docker volume rm e-office-api-v2_minio_data

# Jalankan ulang
docker-compose -f docker-compose.minio.yml up -d
```

### Problem: Prisma tidak bisa connect ke database

**Solusi:**
```bash
# Test koneksi
npx prisma db pull

# Jika error, cek:
# 1. PostgreSQL service running
# 2. DATABASE_URL di .env benar
# 3. Database "persuratanSKL" sudah dibuat
```

### Problem: MinIO bucket tidak dibuat otomatis

**Solusi:**
```bash
# Buat bucket manual via MinIO Console atau mc client
docker exec -it e-office-minio mc mb myminio/e-office-storage
docker exec -it e-office-minio mc anonymous set download myminio/e-office-storage
```

---

## 📊 Quick Commands Reference

```bash
# Database Commands
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev          # Buat & jalankan migrasi
npx prisma migrate deploy       # Deploy migrasi (production)
npx prisma studio               # Buka Prisma Studio
npx tsx prisma/seed.ts          # Seed data dummy

# Docker Commands
docker-compose -f docker-compose.minio.yml up -d     # Start MinIO
docker-compose -f docker-compose.minio.yml down      # Stop MinIO
docker-compose -f docker-compose.minio.yml logs -f   # Lihat logs
docker ps                                             # Lihat container running
docker logs e-office-minio                           # Lihat MinIO logs

# PostgreSQL Commands (jika pakai Docker)
docker exec -it postgres-skl psql -U postgres -d persuratanSKL
```

---

## 🎉 Selesai!

Sekarang Anda sudah bisa:
- ✅ Terkoneksi ke PostgreSQL database
- ✅ Upload file ke MinIO storage
- ✅ Menggunakan data dummy untuk testing
- ✅ Menjalankan aplikasi dengan lengkap

**Next Steps:**
1. Implementasi service layer untuk SKL
2. Buat API endpoints untuk CRUD SKL
3. Implementasi upload lampiran ke MinIO
4. Testing workflow lengkap

---

📝 **Catatan:**
- Untuk production, ganti semua password dan secret keys
- Setup backup database secara berkala
- Monitor storage MinIO untuk mencegah disk penuh
