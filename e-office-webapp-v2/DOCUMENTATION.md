# E-Office SKL/PKL - Web Application

Aplikasi web untuk manajemen pengajuan Surat Keterangan Lulus (SKL) dan Praktik Kerja Lapangan (PKL) dengan sistem multi-role berbasis Next.js + TypeScript.

## 📋 Daftar Isi

- [Overview](#overview)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Setup & Instalasi](#setup--instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [API Documentation](#api-documentation)
- [Role & Permissions](#role--permissions)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

## 🎯 Overview

Sistem e-office untuk manajemen pengajuan SKL/PKL dengan alur persetujuan multi-level:
- **Mahasiswa** → mengajukan (draft, submit)
- **Admin Prodi** → verifikasi awal
- **Ketua Prodi** → persetujuan
- **Admin Fakultas** → finalisasi
- **Supervisor** → monitoring

## ✨ Fitur Utama

### Mahasiswa
- ✅ Membuat draft pengajuan SKL/PKL
- ✅ Mengisi identitas, detail, lampiran
- ✅ Tanda tangan digital
- ✅ Melihat riwayat pengajuan & status
- ✅ Menerima notifikasi (revisi, approval)

### Admin Prodi
- ✅ Melihat daftar pengajuan dari prodi
- ✅ Verifikasi awal & minta revisi
- ✅ Forward ke Ketua Prodi

### Ketua Prodi
- ✅ Melihat pengajuan untuk persetujuan
- ✅ Approve/reject dengan catatan
- ✅ Forward ke Admin Fakultas

### Admin Fakultas
- ✅ Dashboard pengajuan keseluruhan
- ✅ Finalisasi & generate dokumen
- ✅ Arsip pengajuan

### Supervisor
- ✅ Monitoring pengajuan
- ✅ Komentar & notifikasi

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), React 18+, TypeScript
- **UI Library:** Ant Design (antd)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL / MySQL
- **ORM:** Prisma
- **Authentication:** JWT + Cookies
- **Validation:** Zod
- **File Storage:** Local / S3 / Minio
- **Styling:** Ant Design + CSS Modules

## 📁 Struktur Folder

```
e-office-webapp-v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group: Auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (mahasiswa)/              # Route group: Mahasiswa
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── form/
│   │   │   │   ├── dataDiri/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── detail/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── lampiran/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── review/
│   │   │   │       └── page.tsx
│   │   │   ├── riwayat/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (admin-prodi)/            # Route group: Admin Prodi
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── pengajuan/
│   │   │   │   ├── list/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── laporan/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (ketua-prodi)/            # Route group: Ketua Prodi
│   │   │   ├── dashboard/
│   │   │   ├── persetujuan/
│   │   │   │   ├── list/
│   │   │   │   └── [id]/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (admin-fakultas)/         # Route group: Admin Fakultas
│   │   │   ├── dashboard/
│   │   │   ├── pengajuan/
│   │   │   ├── laporan/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (supervisor)/             # Route group: Supervisor
│   │   │   ├── dashboard/
│   │   │   ├── monitoring/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # Backend API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── refresh/route.ts
│   │   │   ├── users/
│   │   │   │   └── me/route.ts
│   │   │   ├── pengajuan/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── submit/route.ts
│   │   │   │       ├── approve/route.ts
│   │   │   │       └── reject/route.ts
│   │   │   └── lampiran/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── MahasiswaLayout.tsx
│   │   │   ├── AdminProdiLayout.tsx
│   │   │   ├── KetuaProdiLayout.tsx
│   │   │   ├── AdminFakultasLayout.tsx
│   │   │   └── SupervisorLayout.tsx
│   │   ├── forms/
│   │   │   ├── DynamicForm.tsx
│   │   │   ├── FormDataDiri.tsx
│   │   │   └── SignatureCanvas.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── select.tsx
│   │
│   ├── lib/
│   │   ├── api.ts              # Axios instance
│   │   ├── auth.ts             # JWT verify, role guard
│   │   ├── permissions.ts      # Role → permissions
│   │   ├── storage.ts          # File upload handler
│   │   ├── utils.ts
│   │   └── db.ts               # Prisma client
│   │
│   ├── hooks/
│   │   ├── useFormData.ts
│   │   ├── useAuth.ts
│   │   └── usePengajuan.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── pengajuan.ts
│   │   └── lampiran.ts
│   │
│   └── modules/                # (Opsional) Service layer
│       ├── pengajuan/
│       │   ├── service.ts
│       │   ├── repository.ts
│       │   └── dto.ts
│       └── lampiran/
│           ├── service.ts
│           └── dto.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── .env.local                  # Env variables
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🚀 Setup & Instalasi

### Prerequisites
- Node.js 18+ (gunakan nvm/fnm)
- npm/yarn/pnpm
- PostgreSQL 12+ (atau MySQL 8+)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd e-office-webapp-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Setup database (Prisma)**
   ```bash
   # Copy env example
   cp .env.example .env.local
   
   # Edit DATABASE_URL di .env.local dengan koneksi PostgreSQL Anda
   
   # Jalankan migration
   npx prisma migrate dev --name init
   
   # (Opsional) Seed database
   npx prisma db seed
   ```

4. **Setup authentication keys**
   ```bash
   # Generate JWT secret (edit di .env.local)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Akses: [http://localhost:3000](http://localhost:3000)

## 🔐 Konfigurasi Environment

Buat file `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skl_db"

# JWT Secret
JWT_SECRET="your-secret-key-here"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"

# File Storage
STORAGE_TYPE="local"  # atau "s3", "minio"
STORAGE_PATH="./public/uploads"

# (Opsional) S3 Configuration
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_S3_REGION=""

# Email (untuk notifikasi)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

## 📚 API Documentation

### Authentication

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password"
}
```
Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "mahasiswa",
    "nama": "Ahmad Syaifullah"
  }
}
```

**GET** `/api/users/me`
- Requires: JWT token in Authorization header
- Returns: User profile

### Pengajuan

**GET** `/api/pengajuan`
- Query params: `?status=draft&page=1&limit=10`
- Response: List pengajuan (filtered by role)

**POST** `/api/pengajuan`
- Body: Pengajuan data
- Response: Created pengajuan object

**GET** `/api/pengajuan/[id]`
- Response: Detail pengajuan

**PATCH** `/api/pengajuan/[id]`
- Body: Updated fields
- Response: Updated pengajuan

**POST** `/api/pengajuan/[id]/submit`
- Body: `{ "message": "..." }` (opsional)
- Response: Pengajuan with status `submitted`

**POST** `/api/pengajuan/[id]/approve`
- Body: `{ "note": "...", "nextApprover": "ketua_prodi" }`
- Response: Pengajuan dengan status `approved`

**POST** `/api/pengajuan/[id]/reject`
- Body: `{ "reason": "..." }`
- Response: Pengajuan dengan status `rejected`

### Lampiran

**POST** `/api/lampiran`
- Form data: file + pengajuanId
- Response: `{ "id": "uuid", "url": "/uploads/file.pdf" }`

**DELETE** `/api/lampiran/[id]`
- Response: `{ "success": true }`

## 👥 Role & Permissions

| Role | Create | Read | Update | Approve | Download |
|------|--------|------|--------|---------|----------|
| Mahasiswa | Own | Own | Own | ❌ | Own |
| Admin Prodi | ❌ | Prodi | Request Revisi | Forward | Prodi |
| Ketua Prodi | ❌ | Prodi | ❌ | Approve/Reject | Prodi |
| Admin Fakultas | ❌ | All | Finalize | ❌ | All |
| Supervisor | ❌ | All | Comment | ❌ | All |

### Permissions Object
```typescript
const permissions = {
  mahasiswa: ["pengajuan:create", "pengajuan:read:own", "pengajuan:update:own"],
  admin_prodi: ["pengajuan:read:prodi", "pengajuan:verify", "pengajuan:request_revision"],
  ketua_prodi: ["pengajuan:read:prodi", "pengajuan:approve", "pengajuan:reject"],
  admin_fakultas: ["pengajuan:read:all", "pengajuan:finalize"],
  supervisor: ["pengajuan:read:all", "pengajuan:comment"],
};
```

## 🗄️ Database Schema

### Core Tables

**users**
- id (UUID)
- email (unique)
- password (hashed)
- nama
- role (enum: mahasiswa, admin_prodi, ketua_prodi, admin_fakultas, supervisor)
- prodiId (FK → prodi)
- fakultasId (FK → fakultas)
- createdAt, updatedAt

**pengajuan**
- id (UUID)
- mahasiswaId (FK → users)
- tipeAjuan (enum: skl, pkl)
- status (enum: draft, submitted, verifikasi_prodi, persetujuan_ketua, final_fakultas, selesai, rejected, revisi_diminta)
- dataDiri (JSON)
- detailPengajuan (JSON)
- createdAt, updatedAt

**lampiran**
- id (UUID)
- pengajuanId (FK → pengajuan)
- fileName
- fileUrl
- fileType (mime-type)
- fileSize
- createdAt

**approval_log**
- id (UUID)
- pengajuanId (FK → pengajuan)
- approverId (FK → users)
- action (enum: verify, approve, reject, request_revision)
- note
- createdAt

**prodi**
- id (UUID)
- nama (unique)
- fakultasId (FK → fakultas)

**fakultas**
- id (UUID)
- nama (unique)

### Relasi
- User → many Pengajuan
- Pengajuan → many Lampiran
- Pengajuan → many ApprovalLog
- Prodi → Fakultas
- User → Prodi

## 🔄 Workflow Status Pengajuan

```
draft
  ↓
[Mahasiswa submit] → submitted
  ↓
[Admin Prodi verify] → verifikasi_prodi
  ├→ [request_revision] → (kembali ke draft)
  ├→ [forward] → persetujuan_ketua
  │
[Ketua Prodi approve/reject] → persetujuan_ketua
  ├→ [approve] → final_fakultas
  ├→ [reject] → rejected (bisa dibuat ulang)
  │
[Admin Fakultas finalize] → final_fakultas
  ├→ [finalize] → selesai
```

## 📦 Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repo ke Vercel
# Set environment variables di Vercel dashboard
# Auto-deploy on git push
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t skl-app .
docker run -p 3000:3000 --env-file .env.local skl-app
```

### Self-hosted (Linux)
```bash
# Install dependencies
npm install --production

# Build
npm run build

# Start with PM2
pm2 start npm --name "skl-app" -- start
pm2 startup
pm2 save
```

## 📝 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:migrate": "prisma migrate dev",
  "db:seed": "ts-node prisma/seed.ts",
  "db:studio": "prisma studio"
}
```

## 🐛 Troubleshooting

### Error: ENOENT: no such file or directory
```bash
# Solusi: Pastikan folder tersebut ada
mkdir -p prisma
npx prisma generate
```

### Error: DATABASE_URL not found
```bash
# Solusi: Copy .env.example ke .env.local dan set DATABASE_URL
cp .env.example .env.local
```

### Port 3000 sudah digunakan
```bash
# Solusi: Gunakan port lain
npm run dev -- -p 3001
```

## 📖 Dokumentasi Tambahan

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Ant Design](https://ant.design/components/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Contributors

- Ahmad Syaifullah (Development)

---

**Last Updated:** January 19, 2026
