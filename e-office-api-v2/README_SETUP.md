# 🚀 Setup Development Environment (Docker-Based)

## 📋 Prerequisites

- ✅ Docker Desktop installed dan running
- ✅ Node.js v18+ installed
- ✅ Git (untuk clone project)

---

## 🎯 Langkah 1: Clone & Install Dependencies

```bash
# Clone project (jika belum)
git clone <repository-url>
cd e-office-api-v2

# Install dependencies
npm install
```

---

## 🎯 Langkah 2: Setup Environment Variables

File `.env` sudah dikonfigurasi dengan default values. **Tidak perlu diubah** kecuali ada kebutuhan khusus.

```bash
# Cek file .env sudah ada
cat .env
```

**Konfigurasi Default:**
- Database: PostgreSQL di Docker (port 5432)
- MinIO: Di Docker (port 9000 & 9001)
- Credentials: Sudah di-set otomatis

---

## 🎯 Langkah 3: Start Docker Services

### 3.1 Start PostgreSQL & MinIO

```bash
# Start semua services (PostgreSQL + MinIO)
docker-compose -f docker-compose.dev.yml up -d

# Output yang diharapkan:
# Creating e-office-postgres ... done
# Creating e-office-minio ... done
# Creating e-office-minio-setup ... done
```

### 3.2 Verifikasi Container Running

```bash
# Cek status containers
docker-compose -f docker-compose.dev.yml ps

# Atau
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE                    STATUS         PORTS
xxxxx          postgres:15-alpine       Up (healthy)   5432->5432
xxxxx          minio/minio:latest       Up (healthy)   9000->9000, 9001->9001
```

### 3.3 Tunggu Database Ready

```bash
# Tunggu sampai PostgreSQL healthy (sekitar 10-15 detik)
docker-compose -f docker-compose.dev.yml logs -f postgres

# Kalau sudah muncul:
# "database system is ready to accept connections" -> CTRL+C
```

---

## 🎯 Langkah 4: Setup Database Schema

### 4.1 Generate Prisma Client

```bash
npx prisma generate
```

**Output:**
```
✔ Generated Prisma Client to .\src\generated\prisma
```

### 4.2 Run Database Migration

```bash
# Buat dan jalankan migration
npx prisma migrate dev --name init_skl_system
```

**Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "persuratanSKL"

Applying migration `20260201_init_skl_system`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260201_init_skl_system/
    └─ migration.sql

✔ Generated Prisma Client
```

### 4.3 Seed Database dengan Data Dummy

```bash
# Jalankan seed script
npx tsx prisma/seed.ts
```

**Output:**
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

============================================================
🎉 DATABASE SEED COMPLETED SUCCESSFULLY!
============================================================
```

---

## 🎯 Langkah 5: Verifikasi Setup

### 5.1 Akses Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Browser akan terbuka di: `http://localhost:5555`

**Verifikasi data:**
- ✅ User: 8 records (5 staff + 3 mahasiswa)
- ✅ Mahasiswa: 3 records
- ✅ Pegawai: 5 records
- ✅ PengajuanSkl: 3 records
- ✅ RiwayatPengajuanSkl: Multiple history records
- ✅ LampiranSkl: Multiple attachments

### 5.2 Akses MinIO Console (File Storage)

Buka browser: `http://localhost:9001`

**Login:**
- Username: `minioadmin`
- Password: `minioadmin`

**Verifikasi:**
- ✅ Bucket `e-office-storage` sudah ada
- ✅ Bisa upload test file

### 5.3 Test Database Connection (Manual)

```bash
# Connect ke PostgreSQL
docker exec -it e-office-postgres psql -U postgres -d persuratanSKL

# Di psql prompt:
\dt               -- Lihat semua tabel
SELECT COUNT(*) FROM "user";        -- Should return 8
SELECT COUNT(*) FROM "mahasiswa";   -- Should return 3
SELECT COUNT(*) FROM "pegawai";     -- Should return 5
\q                -- Keluar
```

---

## 🎯 Langkah 6: Run Application

```bash
# Development mode
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:3079
✅ Database connected
✅ MinIO connected
```

**Test API (jika sudah ada endpoint):**
```bash
curl http://localhost:3079/api/health
```

---

## 🔄 Daily Development Workflow

### Start Services (Setiap Hari)

```bash
# 1. Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# 2. Start aplikasi
npm run dev
```

### Stop Services (Selesai Kerja)

```bash
# Stop aplikasi: CTRL+C

# Stop Docker services (data tetap tersimpan)
docker-compose -f docker-compose.dev.yml down

# Atau stop tanpa hapus container (lebih cepat next start)
docker-compose -f docker-compose.dev.yml stop
```

### Restart Fresh (Reset Semua Data)

```bash
# Stop dan hapus container + volumes
docker-compose -f docker-compose.dev.yml down -v

# Start ulang
docker-compose -f docker-compose.dev.yml up -d

# Re-run migration dan seed
npx prisma migrate dev
npx tsx prisma/seed.ts
```

---

## 👥 Setup untuk Tim (Developer Lain)

### Developer Baru Join Project

```bash
# 1. Clone project
git clone <repository-url>
cd e-office-api-v2

# 2. Install dependencies
npm install

# 3. Copy .env (sudah ada di repo)
# File .env sudah dikonfigurasi, tidak perlu diubah

# 4. Start Docker
docker-compose -f docker-compose.dev.yml up -d

# 5. Setup database
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts

# 6. Run app
npm run dev
```

**Semua developer akan menggunakan:**
- ✅ Database yang sama (struktur & credentials)
- ✅ MinIO dengan konfigurasi yang sama
- ✅ Data dummy yang sama (dari seed)

---

## 📦 Data Persistence & Sharing

### Lokasi Data Docker Volumes

```bash
# Lihat volumes
docker volume ls

# Output:
# e-office-api-v2_postgres_data    <- Database PostgreSQL
# e-office-api-v2_minio_data       <- File storage MinIO
```

### Backup Database

```bash
# Backup database ke file SQL
docker exec e-office-postgres pg_dump -U postgres persuratanSKL > backup_$(date +%Y%m%d).sql

# Restore dari backup
docker exec -i e-office-postgres psql -U postgres persuratanSKL < backup_20260201.sql
```

### Backup MinIO Files

```bash
# Backup MinIO data
docker run --rm -v e-office-api-v2_minio_data:/data -v ${PWD}:/backup alpine tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz -C /data .

# Restore MinIO data
docker run --rm -v e-office-api-v2_minio_data:/data -v ${PWD}:/backup alpine tar xzf /backup/minio_backup_20260201.tar.gz -C /data
```

### Share Database State dengan Tim

```bash
# Developer A: Export database
docker exec e-office-postgres pg_dump -U postgres persuratanSKL > team_database.sql

# Commit ke Git (optional, untuk development data)
git add team_database.sql
git commit -m "Update team database snapshot"
git push

# Developer B: Import database
git pull
docker exec -i e-office-postgres psql -U postgres persuratanSKL < team_database.sql
```

---

## 🔧 Troubleshooting

### Problem: Port 5432 atau 9000 sudah digunakan

```bash
# Cek port yang digunakan
netstat -ano | findstr :5432
netstat -ano | findstr :9000

# Solusi: Ubah port di docker-compose.dev.yml
# PostgreSQL: "5433:5432" instead of "5432:5432"
# MinIO API: "9002:9000" instead of "9000:9000"

# Jangan lupa update .env juga!
# DATABASE_URL="postgresql://postgres:senku@localhost:5433/..."
# MINIO_PORT=9002
```

### Problem: Container tidak bisa start

```bash
# Cek logs
docker-compose -f docker-compose.dev.yml logs

# Restart dari awal
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Problem: Database connection refused

```bash
# Tunggu PostgreSQL fully ready
docker-compose -f docker-compose.dev.yml logs postgres

# Kalau sudah "ready to accept connections", coba lagi
npx prisma migrate dev
```

### Problem: MinIO bucket tidak dibuat

```bash
# Cek logs createbuckets container
docker logs e-office-minio-setup

# Buat manual jika perlu
docker exec e-office-minio mc alias set myminio http://localhost:9000 minioadmin minioadmin
docker exec e-office-minio mc mb myminio/e-office-storage
```

### Problem: Prisma migrate gagal "relation already exists"

```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Tunggu 15 detik, lalu migrate ulang
npx prisma migrate dev
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Docker Compose (docker-compose.dev.yml)        │
│                                                  │
│  ┌────────────────────┐  ┌───────────────────┐ │
│  │  PostgreSQL        │  │  MinIO            │ │
│  │  Port: 5432        │  │  API: 9000        │ │
│  │  User: postgres    │  │  Console: 9001    │ │
│  │  Pass: senku       │  │  User: minioadmin │ │
│  │  DB: persuratanSKL │  │  Bucket: e-office │ │
│  └────────────────────┘  └───────────────────┘ │
│           ↑                      ↑              │
└───────────┼──────────────────────┼──────────────┘
            │                      │
            └──────────┬───────────┘
                       │
            ┌──────────▼──────────┐
            │  Node.js App        │
            │  Port: 3079         │
            │  - Prisma ORM       │
            │  - MinIO Client     │
            │  - Elysia Server    │
            └─────────────────────┘
```

---

## ✅ Checklist Setup Completion

```
☐ 1. Docker Desktop running
☐ 2. npm install completed
☐ 3. .env file exists
☐ 4. docker-compose up -d berhasil
☐ 5. Container postgres & minio running (healthy)
☐ 6. npx prisma generate berhasil
☐ 7. npx prisma migrate dev berhasil
☐ 8. npx tsx prisma/seed.ts berhasil
☐ 9. Prisma Studio menampilkan data (localhost:5555)
☐ 10. MinIO Console bisa diakses (localhost:9001)
☐ 11. npm run dev berhasil
```

---

## 🎉 Selesai!

Setup development environment sudah lengkap. Semua developer di tim akan menggunakan:

- ✅ **Database yang sama**: PostgreSQL di Docker (persuratanSKL)
- ✅ **Storage yang sama**: MinIO di Docker (e-office-storage)
- ✅ **Data dummy yang sama**: Dari seed script
- ✅ **Environment yang konsisten**: Semua dikonfigurasi via Docker

**Next Steps:**
1. Mulai development fitur SKL
2. Buat API endpoints
3. Implement business logic
4. Testing dengan data dummy

**Happy Coding! 🚀**
