# 🚀 Langkah-Langkah Setup Database & MinIO

## 📌 Penjelasan Strategi

**TIDAK PERLU** buat database di Docker lagi! Karena Anda sudah punya PostgreSQL di Laragon:

- ✅ **Database PostgreSQL**: Pakai yang di **Laragon** (localhost:5432)
- ✅ **MinIO Storage**: Pakai **Docker** (untuk file upload)

Saya sudah update `docker-compose.dev.yml` untuk **hanya MinIO saja**, PostgreSQL di Docker sudah dihapus.

---

## 🎯 Langkah 1: Setup Database PostgreSQL (di Laragon)

### 1.1 Start Laragon
```
1. Buka Laragon
2. Klik "Start All"
3. Pastikan PostgreSQL running (ikon hijau)
```

### 1.2 Buat Database
```bash
# Buka Menu Laragon > PostgreSQL > psql
# Atau buka Terminal dan jalankan:
psql -U postgres

# Di psql prompt, jalankan:
CREATE DATABASE "persuratanSKL";

# Cek database sudah dibuat
\l

# Keluar dari psql
\q
```

### 1.3 Verifikasi Koneksi
```bash
# Test koneksi dari terminal
psql -U postgres -d persuratanSKL -c "SELECT version();"
```

**✅ Database PostgreSQL siap digunakan!**

---

## 🎯 Langkah 2: Setup MinIO dengan Docker

### 2.1 Jalankan MinIO Container

```bash
# Masuk ke folder project
cd c:\laragon\www\skl\e-office-api-v2

# Jalankan MinIO (PostgreSQL sudah tidak ada di docker-compose)
docker-compose -f docker-compose.dev.yml up -d

# Output yang diharapkan:
# Creating e-office-minio ... done
# Creating e-office-minio-setup ... done
```

### 2.2 Cek Status Container

```bash
# Lihat container yang running
docker ps

# Anda akan lihat:
# - e-office-minio (running)
# - e-office-minio-setup (exited - normal, sudah selesai setup)
```

### 2.3 Akses MinIO Console

Buka browser:
```
http://localhost:9001
```

**Login:**
- Username: `minioadmin`
- Password: `minioadmin`

**✅ Anda akan lihat bucket `e-office-storage` sudah dibuat otomatis!**

---

## 🎯 Langkah 3: Setup Prisma & Migrasi Database

### 3.1 Install Dependencies (jika belum)

```bash
npm install
```

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

Output:
```
✔ Generated Prisma Client to .\src\generated\prisma
```

### 3.3 Buat Migration untuk Schema Baru

```bash
# Buat migration dengan nama init_skl_system
npx prisma migrate dev --name init_skl_system
```

Prisma akan:
1. Membaca `schema.prisma`
2. Membuat file migration di `prisma/migrations/`
3. Menjalankan migration ke database PostgreSQL di Laragon
4. Membuat semua tabel (User, Mahasiswa, Pegawai, PengajuanSkl, dll)

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "persuratanSKL"

Applying migration `20260201_init_skl_system`

✔ Generated Prisma Client
```

### 3.4 Cek Tabel di Database

```bash
# Buka psql
psql -U postgres -d persuratanSKL

# Lihat semua tabel
\dt

# Output akan menampilkan:
# user, mahasiswa, pegawai, role, permission, 
# pengajuan_skl, riwayat_pengajuan_skl, lampiran_skl, dll

# Keluar
\q
```

---

## 🎯 Langkah 4: Seed Database dengan Data Dummy

### 4.1 Jalankan Seed Script

```bash
npx tsx prisma/seed.ts
```

**Expected Output:**
```
🌱 Starting database seed...

🧹 Cleaning up existing data...
✅ Cleanup completed!

👥 Creating Roles...
✅ Roles created!

🏢 Creating Departemen & Program Studi...
✅ Departemen & Program Studi created!

👔 Creating Staff Members...
✅ Staff members created!

🎓 Creating Students...
✅ Students created!

📄 Creating SKL Submissions...

  📋 Case A: Andi - COMPLETED workflow
  ✅ Andi's submission completed
  
  📋 Case B: Budi - SIAP_CETAK (pending UPA)
  ✅ Budi's submission completed
  
  📋 Case C: Citra - REVISI (rejected by Admin Prodi)
  ✅ Citra's submission completed

✅ SKL Submissions created!

============================================================
📊 SEED SUMMARY
============================================================

🏢 MASTER DATA:
  - Departemen: 1 (Departemen Informatika)
  - Program Studi: 1 (S1 Informatika)
  - Roles: 6 (admin_prodi, kaprodi, admin_surat, supervisor, upa, mahasiswa)

👔 STAFF (Pegawai):
  1. Siti Rahma - Admin Prodi
  2. Dr. Budi Santoso, M.Kom - Kaprodi
  3. Dewi Lestari - Admin Surat
  4. Prof. Dr. Ahmad Hidayat - Supervisor
  5. Rina Wijaya, S.S. - UPA

🎓 STUDENTS (Mahasiswa):
  1. Andi Pratama (H071201001)
  2. Budi Setiawan (H071201002)
  3. Citra Ayu Lestari (H071201003)

📄 SKL SUBMISSIONS:
  1. Andi Pratama - Status: COMPLETED
     ✅ Full workflow with numbering from Admin Prodi & UPA
     
  2. Budi Setiawan - Status: SIAP_CETAK
     ⏳ Waiting for UPA to finalize and print
     
  3. Citra Ayu Lestari - Status: REVISI
     ❌ Rejected by Admin Prodi

============================================================
🎉 DATABASE SEED COMPLETED SUCCESSFULLY!
============================================================
```

---

## 🎯 Langkah 5: Verifikasi Semua Berjalan

### 5.1 Verifikasi Database dengan Prisma Studio

```bash
npx prisma studio
```

Browser akan otomatis terbuka di `http://localhost:5555`

**Cek di Prisma Studio:**
- ✅ Tabel `User` ada 8 records (5 staff + 3 mahasiswa)
- ✅ Tabel `Mahasiswa` ada 3 records
- ✅ Tabel `Pegawai` ada 5 records
- ✅ Tabel `PengajuanSkl` ada 3 records
- ✅ Tabel `RiwayatPengajuanSkl` ada history
- ✅ Tabel `LampiranSkl` ada lampiran

### 5.2 Verifikasi MinIO Storage

**Opsi A: Via MinIO Console**
1. Buka http://localhost:9001
2. Login dengan `minioadmin` / `minioadmin`
3. Klik bucket `e-office-storage`
4. Upload test file untuk coba

**Opsi B: Via Terminal**
```bash
# Test upload file dummy
docker exec e-office-minio mc cp /data/test.txt myminio/e-office-storage/test.txt
```

---

## 🎯 Langkah 6: Jalankan Aplikasi

```bash
# Development mode
npm run dev

# Expected output:
# Server running on http://localhost:3079
```

**Test API:**
```bash
# Test endpoint (jika sudah ada)
curl http://localhost:3079/api/health
```

---

## ✅ Checklist Final

Pastikan semua langkah berikut sudah berhasil:

```
☐ 1. PostgreSQL di Laragon running
☐ 2. Database "persuratanSKL" sudah dibuat
☐ 3. MinIO Docker container running
☐ 4. MinIO Console bisa diakses (localhost:9001)
☐ 5. Bucket "e-office-storage" sudah ada
☐ 6. Prisma migration berhasil
☐ 7. Seed data berhasil
☐ 8. Prisma Studio menampilkan data
☐ 9. File .env sudah benar
☐ 10. Aplikasi bisa jalan di localhost:3079
```

---

## 🔧 Troubleshooting

### Problem: Port 5432 sudah digunakan
```bash
# Cek apa yang pakai port 5432
netstat -ano | findstr :5432

# Pastikan hanya Laragon PostgreSQL yang jalan
# Jangan jalankan Docker PostgreSQL lagi
```

### Problem: MinIO tidak bisa start
```bash
# Stop container
docker-compose -f docker-compose.dev.yml down

# Hapus volume jika perlu
docker volume rm e-office-api-v2_minio_data

# Start ulang
docker-compose -f docker-compose.dev.yml up -d
```

### Problem: Prisma migrate gagal
```bash
# Cek koneksi database
npx prisma db pull

# Jika masih error, cek:
# 1. Laragon PostgreSQL running
# 2. Database "persuratanSKL" sudah dibuat
# 3. File .env DATABASE_URL benar
```

### Problem: Seed gagal "Unique constraint failed"
```bash
# Hapus semua data dulu
psql -U postgres -d persuratanSKL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Jalankan migration ulang
npx prisma migrate dev

# Seed ulang
npx tsx prisma/seed.ts
```

---

## 📝 Rangkuman

**Arsitektur Final:**
```
┌─────────────────────────────────────────┐
│  Laragon (Windows)                      │
│  ├─ PostgreSQL (port 5432) ✅          │
│  └─ Database: persuratanSKL             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Docker (Windows)                       │
│  └─ MinIO Container                     │
│     ├─ API: localhost:9000 ✅          │
│     ├─ Console: localhost:9001 ✅      │
│     └─ Bucket: e-office-storage         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Node.js Application                    │
│  └─ API Server (port 3079) ✅          │
└─────────────────────────────────────────┘
```

**Keuntungan Setup Ini:**
- ✅ PostgreSQL native di Laragon (lebih cepat)
- ✅ MinIO isolated di Docker (mudah manage)
- ✅ Tidak ada conflict port
- ✅ Data persistent (PostgreSQL & MinIO)

---

## 🚀 Quick Start (Next Time)

Setelah setup pertama kali, next time cukup:

```bash
# 1. Start Laragon (PostgreSQL otomatis jalan)

# 2. Start MinIO
cd c:\laragon\www\skl\e-office-api-v2
docker-compose -f docker-compose.dev.yml up -d

# 3. Start aplikasi
npm run dev
```

**Selesai! 🎉**
