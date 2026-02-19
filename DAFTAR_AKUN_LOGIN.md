# 🔐 Daftar Akun Login E-Office

**Password Default untuk Semua Akun:** `password123`

---

## 👨‍💼 Super Admin
- **Email:** `superadmin@system.ac.id`
- **Nama:** Super Administrator
- **Fungsi:** Kelola master data sistem (mahasiswa, pegawai, prodi, surat)

---

## 🎓 Mahasiswa (13 akun)
Contoh akun mahasiswa dari berbagai prodi:

| Email | Nama | NIM | Prodi |
|-------|------|-----|-------|
| `andi.pratama@students.ac.id` | Andi Pratama | 24060123120039 | - |
| `budi.setiawan@students.ac.id` | Budi Setiawan | H071201002 | - |
| `dwi@mat-s1.ac.id` | Dwi Matematika | H011201001 | Matematika S1 |
| `eko@fis-s1.ac.id` | Eko Fisika | H021201001 | Fisika S1 |
| `fajar@bio-s1.ac.id` | Fajar Biologi | H031201001 | Biologi S1 |

**Fungsi:** Mengajukan surat SKL dan melihat riwayat pengajuan

---

## 👥 Admin Prodi (12 akun)
Admin untuk setiap program studi:

| Email | Nama | Prodi |
|-------|------|-------|
| `admin.prodi@informatika.ac.id` | Siti Rahma | S1 Informatika |
| `admin.prodi@mat-s1.ac.id` | Admin Matematika S1 | S1 Matematika |
| `admin.prodi@fis-s1.ac.id` | Admin Fisika S1 | S1 Fisika |
| `admin.prodi@bio-s1.ac.id` | Admin Biologi S1 | S1 Biologi |
| `admin.prodi@kim-s1.ac.id` | Admin Kimia S1 | S1 Kimia |
| `admin.prodi@stat-s1.ac.id` | Admin Statistika | S1 Statistika |

**Fungsi:** Verifikasi surat mahasiswa dan mendaftarkan nomor surat

---

## 🎯 Ketua Prodi (12 akun)
Ketua untuk setiap program studi:

| Email | Nama | Prodi |
|-------|------|-------|
| `kaprodi@informatika.ac.id` | Dr. Budi Santoso, M.Kom | S1 Informatika |
| `kaprodi@mat-s1.ac.id` | Dr. Siti Nurhaliza, M.Si | S1 Matematika |
| `kaprodi@fis-s1.ac.id` | Dr. Budi Fisika, M.Sc | S1 Fisika |
| `kaprodi@bio-s1.ac.id` | Dr. Dewi Biologi, M.Si | S1 Biologi |
| `kaprodi@kim-s1.ac.id` | Dr. Hadi Kimia, M.Si | S1 Kimia |
| `kaprodi@stat-s1.ac.id` | Dr. Joko Statistika, M.Si | S1 Statistika |

**Fungsi:** Menyetujui/menolak surat yang sudah diverifikasi Admin Prodi

---

## 🏢 Admin Fakultas & Admin Surat
- **Email:** `admin.fakultas@fsm.ac.id`
- **Nama:** Drs. Bambang Suryanto, M.Si
- **Role:** Admin Fakultas + Admin Surat (dual role)
- **Fungsi:** Administrasi dan pengelolaan surat di tingkat fakultas

---

## 📝 Staf Fakultas
- **Email:** `staf.fakultas@fsm.ac.id`
- **Nama:** Sri Wahyuni, S.Sos
- **Fungsi:** Penerbitan nomor surat dan administrasi fakultas

---

## 💼 Manajer TU
- **Email:** `manajer.tu@fsm.ac.id`
- **Nama:** Ir. Agus Prasetyo, M.M
- **Fungsi:** Verifikasi final dan koordinasi tata usaha fakultas

---

## 🛡️ Supervisor
- **Email:** `supervisor@akademik.ac.id`
- **Nama:** Prof. Dr. Ahmad Hidayat
- **Fungsi:** Monitor dan supervisi seluruh proses persuratan

---

## 📋 UPA (Unit Pelaksana Administrasi)
- **Email:** `upa@akademik.ac.id`
- **Nama:** Rina Wijaya, S.S.
- **Fungsi:** Finalisasi dan penerbitan nomor SKL resmi

---

## 📝 Catatan Penting
1. **Password:** Semua akun menggunakan password `password123` (development mode)
2. **Auto Login:** Tersedia fitur "Auto Login (Dev Mode)" untuk testing cepat
3. **Multi-Role:** Beberapa user mungkin memiliki lebih dari satu role
4. **Testing:** Gunakan akun mahasiswa untuk test flow pengajuan SKL lengkap

---

## 🔄 Alur Pengajuan SKL
1. **Mahasiswa** → Mengajukan surat SKL
2. **Admin Prodi** → Verifikasi berkas dan generate surat
3. **Ketua Prodi** → Approve/reject surat
4. **Admin Prodi** → Daftarkan nomor surat
5. **Supervisor** → Monitor proses
6. **UPA** → Finalisasi dan penerbitan nomor resmi
