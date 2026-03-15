# Template Pengujian — E-Office SKL
## Tim PKL (Surat Keterangan Lulus)

---

## 1. Mahasiswa

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Mahasiswa | | "Form Login: - Login menggunakan Email dan Password. - Terdapat ikon mata untuk melihat/sembunyikan password. - Tombol Login memiliki animasi loading saat proses. - Jika gagal: muncul pesan error 'Email atau password salah' di atas form dalam kotak merah. - Terdapat opsi 'Login with UNDIP SSO' sebagai alternatif. - Setelah berhasil, redirect otomatis ke halaman Portal Persuratan (/mahasiswa)." | |
| 2 | Mengakses Portal Persuratan | Mahasiswa | | "Portal Persuratan: - Judul halaman 'Portal Layanan Akademik' dengan subjudul Fakultas Sains dan Matematika - Universitas Diponegoro. - Terdapat tombol 'Cek Riwayat Saya' di pojok kanan atas. - Kartu info berisi Pusat Bantuan dan statistik ringkas (Surat Diproses, Surat Selesai) secara real-time. - Layanan Persuratan dalam bentuk grid 3 kolom: 1) Surat Keterangan Lulus (SKL) — aktif, tombol 'Ajukan Sekarang'; 2) Surat Keterangan Aktif — Coming Soon, tombol disabled; 3) Transkrip Nilai Sementara — Coming Soon, tombol disabled. - Saat klik 'Ajukan Sekarang', draft lama di-reset (localStorage dikosongkan) lalu redirect ke form Data Diri." | |
| 3 | Mengisi Form Pengajuan SKL — Step 1: Data Diri | Mahasiswa | | "Form Data Diri: - Kolom: Nama, NIM, Email, Departemen, Program Studi, Tempat Lahir, Tanggal Lahir, No HP, Alamat. - Beberapa kolom terisi otomatis dari data akun. - Sidebar disembunyikan pada halaman form. - Terdapat navigasi step wizard (Data Diri → Detail → Lampiran → Review)." | |
| 4 | Mengisi Form Pengajuan SKL — Step 2: Detail Pengajuan | Mahasiswa | | "Detail Pengajuan: - Kolom: Jenis Surat (default: Surat Keterangan Lulus), Tanggal Lulus (date picker), IPK Terakhir, Jumlah SKS. - Validasi bahwa semua kolom wajib terisi sebelum lanjut ke step berikutnya." | |
| 5 | Mengisi Form Pengajuan SKL — Step 3: Lampiran | Mahasiswa | | "Upload Lampiran: - Kategori lampiran: KTM, Berita Acara Kelulusan, Scan Berita Acara Ujian Sarjana, Bukti Submit HKI, Pas Foto Hitam Putih/Berwarna 4x6, Transkrip Akademik. - Format yang diterima: PDF dan Gambar (JPG/PNG). - Setelah file dipilih, nama file muncul di form. - Preview file tersedia sebelum submit." | |
| 6 | Mengisi Form Pengajuan SKL — Step 4: Review & Kirim | Mahasiswa | | "Review & Kirim: - Seluruh data yang telah diisi ditampilkan dalam format ringkasan (Data Diri, Detail Pengajuan, Lampiran). - Terdapat area tanda tangan digital (canvas untuk tulisan tangan). - Tombol 'Kirim Pengajuan' untuk submit final. - Setelah submit, status pengajuan menjadi 'SUBMITTED' dan redirect ke Dashboard atau Riwayat." | |
| 7 | Mengakses Dashboard | Mahasiswa | | "Dashboard: - Header sapaan 'Halo, [Nama]! 👋' dengan tombol Logout. - Notifikasi perhatian muncul jika ada pengajuan berstatus REVISI atau DITOLAK (banner kuning/merah dengan tombol 'Lihat Detail'). - 5 kartu statistik berwarna: Total Pengajuan (biru), Sedang Proses (kuning), Selesai (hijau), Perlu Revisi (kuning), Ditolak (merah). - Setiap kartu bisa diklik dan langsung membuka halaman Riwayat dengan filter sesuai. - Kartu memiliki efek hover (naik dan bayangan). - Bagian 'Pengajuan Terakhir' menampilkan status saat ini + tag berwarna, tanggal pengajuan, nomor surat (jika ada), tombol 'Lihat Detail & Tracking'. - Aktivitas Terakhir ditampilkan sebagai timeline (nama actor, role, waktu, catatan). - Pie chart Statistik Pengajuan (donut chart) dengan distribusi Menunggu/Selesai/Revisi/Ditolak. - Jika belum ada pengajuan aktif, tampil ilustrasi 'Belum ada pengajuan aktif' dengan tombol 'Buat Pengajuan Sekarang'." | |
| 8 | Melihat Riwayat Pengajuan | Mahasiswa | | "Riwayat Pengajuan: - 5 kartu statistik interaktif di atas: Total Pengajuan, Sedang Diproses, Selesai/Diterima, Perlu Revisi, Ditolak. Kartu yang diklik menjadi aktif (border berwarna + indikator titik). - Tab 'Riwayat Pengajuan' dan 'Draf Tersimpan' dengan badge jumlah. - Tabel Riwayat Pengajuan: kolom ID Surat, Perihal, Waktu Pengiriman, Tanggal Diterima, Status Surat (tag berwarna dengan ikon), Preview Surat (tombol 'Lihat Surat' — aktif hanya jika status COMPLETED), Aksi (tombol mata untuk detail). - Filter Layanan (dropdown: Semua Layanan / Surat Ket. Lulus). - Pagination: pageSize 5. - Tab Draf Tersimpan: kolom ID Surat, Perihal, Last Edit, Aksi (Edit + Hapus). Hapus draft memunculkan konfirmasi popup. - Kosong: ilustrasi 'Belum ada riwayat pengajuan' atau 'Tidak ada draf tersimpan'." | |
| 9 | Melihat Detail Pengajuan | Mahasiswa | | "Detail Pengajuan: - Header: tombol kembali, judul 'Detail Pengajuan SKL', ID Pengajuan, badge status. - Alert kontekstual: Kuning jika REVISI (dengan tombol 'Perbaiki Sekarang'), Merah jika DITOLAK, Hijau jika COMPLETED. - Kartu 'Informasi Mahasiswa': Nama, NIM, Prodi, Email, Tempat Lahir, Tgl Lahir, No HP, Alamat dalam tabel Descriptions. - Data Akademik: Jenis Surat, Tanggal Lulus, IPK (tag biru), Jumlah SKS (tag hijau). - Kartu Dokumen Lampiran: grid kartu per lampiran (ikon PDF merah / gambar biru), klik untuk preview dalam modal. - Tanda tangan digital ditampilkan jika ada. - Panel kanan: 'Riwayat Proses' (timeline), 'Aksi Pengajuan' (tombol Edit + Batalkan — hanya muncul jika status REVISI atau SUBMITTED)." | |
| 10 | Preview & Cetak Surat | Mahasiswa | | "Preview Surat (hanya status COMPLETED): - Modal preview dengan kontrol zoom (+/−/persentase). - Format surat AK.008: header, nomor surat, perihal, isi surat lengkap dengan data mahasiswa, tanda tangan Kaprodi & Pemohon. - Tombol 'Cetak / Print' membuka jendela print baru dengan format A4. - Banner hijau: '✓ Surat sudah difinalisasi oleh UPA' dengan nomor SKL." | |
| 11 | Mengedit Profil | Mahasiswa | | "Edit Profil: - Diakses melalui menu sidebar 'Profile'. - Informasi profil ditampilkan. - Perubahan data dapat dilakukan sesuai kolom yang tersedia." | |

---

## 2. Admin Prodi

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Admin Prodi | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Admin Prodi (/admin-prodi/dashboard)." | |
| 2 | Mengakses Dashboard | Admin Prodi | | "Dashboard Persuratan: - Judul 'Dashboard Persuratan' dengan deskripsi 'Pusat kendali untuk mengelola semua surat Fakultas Sains dan Matematika'. - 3 kartu statistik: 'Perlu Tindakan' (biru, surat belum diproses), 'Selesai Bulan Ini' (hijau, surat diselesaikan), 'Total Surat Bulan Ini' (ungu, total volume). - Tabel 'Surat Perlu Tindakan': kolom ID/Agenda, Sumber, Pengusul/Pemohon (Nama + NIM), Perihal, Tanggal Diterima, Program Studi, Tujuan Saat Ini, Status (badge berwarna), Aksi. - Hanya menampilkan surat berstatus SUBMITTED dan APPROVED_KAPRODI. - Tombol Refresh dan kolom pencarian (cari berdasarkan nama, NIM, ID surat). - Pagination: menampilkan 'Showing X-Y of Z'. - Klik ikon mata di kolom Aksi: jika status SUBMITTED redirect ke halaman detail, jika status APPROVED_KAPRODI redirect ke halaman generate nomor surat." | |
| 3 | Melihat Detail Surat Masuk | Admin Prodi | | "Detail Surat: - Breadcrumb: Surat Masuk / Penerima / Identitas Pemohon. - Kiri: Kartu 'Identitas Pengaju' (Nama Lengkap, Role, NIM, Program Studi, Email, No HP), Kartu 'Detail Surat' (Jenis & Kategori, Tujuan, No Surat, Perihal, Tanggal Lulus, IPK), Kartu 'Lampiran' (daftar file dengan ikon dan tombol preview). - Kanan (jika status SUBMITTED): Panel Aksi dengan 3 tombol: 'Setujui dan Generate Surat' (hijau), 'Revisi' (oranye), 'Tolak' (merah). - Kanan (jika status lain): Panel 'Status Pengajuan' dengan banner kontekstual (hijau/kuning/merah) sesuai status. - Riwayat Surat: timeline riwayat proses lengkap." | |
| 4 | Menyetujui Pengajuan | Admin Prodi | | "Aksi Setujui: - Klik 'Setujui dan Generate Surat' → redirect ke halaman generate nomor surat (/admin-prodi/surat/[id]/generate). - Di halaman generate: Admin Prodi mengisi nomor surat pengantar. - Setelah generate berhasil, status berubah menjadi VERIFIED_ADMIN, surat diteruskan ke Ketua Prodi." | |
| 5 | Meminta Revisi | Admin Prodi | | "Aksi Revisi: - Klik 'Revisi' → muncul Modal 'Kirim Permintaan Revisi'. - Info box oranye: 'Mahasiswa akan menerima notifikasi dan dapat melakukan pengeditan kembali'. - Textarea untuk menulis detail revisi. - Tombol 'Kirim Revisi' (disabled jika textarea kosong). - Setelah submit: status berubah menjadi REVISI, redirect ke Dashboard." | |
| 6 | Menolak Pengajuan | Admin Prodi | | "Aksi Tolak: - Klik 'Tolak' → muncul Modal 'Konfirmasi Penolakan'. - Info box merah: 'Tindakan ini bersifat final. Dokumen yang ditolak tidak dapat diedit kembali'. - Textarea wajib diisi alasan penolakan. - Tombol 'Konfirmasi Tolak' (disabled jika textarea kosong). - Setelah submit: status berubah menjadi DITOLAK, redirect ke Dashboard." | |
| 7 | Melihat Semua Surat | Admin Prodi | | "Semua Surat: - Diakses dari sidebar menu 'Semua Surat'. - Menampilkan seluruh surat yang pernah masuk ke Admin Prodi beserta statusnya." | |

---

## 3. Ketua Prodi

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Ketua Prodi | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Ketua Prodi (/ketua-prodi/dashboard)." | |
| 2 | Mengakses Dashboard | Ketua Prodi | | "Dashboard: - Menampilkan daftar surat yang memerlukan persetujuan Ketua Prodi (status VERIFIED_ADMIN). - Kartu statistik dan tabel surat perlu tindakan. - Klik ikon aksi untuk membuka halaman detail surat." | |
| 3 | Me-review Detail Surat | Ketua Prodi | | "Detail Surat: - Menampilkan identitas pengaju (Nama, NIM, Prodi, Email, No HP). - Detail surat: Jenis Surat, Status, Tanggal Pengajuan, Nomor Surat Pengantar (dari Admin Prodi). - Pratinjau surat format AK.008 dengan kontrol zoom (+/−). - Melihat lampiran (klik untuk preview dalam modal). - Riwayat proses surat (timeline)." | |
| 4 | Menandatangani Surat | Ketua Prodi | | "Tanda Tangan Ketua Prodi: - Dua opsi: a) Tulis Tangan — canvas untuk menggambar tanda tangan dengan mouse, tombol 'Hapus' untuk reset canvas, tombol 'Simpan' untuk menyimpan; b) Upload File — upload gambar tanda tangan (PNG/JPG). - Preview tanda tangan ditampilkan setelah tersimpan. - Tombol 'Hapus Tanda Tangan' untuk menghapus tanda tangan yang sudah disimpan." | |
| 5 | Menyetujui Pengajuan | Ketua Prodi | | "Aksi Setujui: - Tombol 'Setujui Dokumen' (aktif hanya jika tanda tangan sudah tersimpan). - Setelah klik: tanda tangan di-convert ke base64, dikirim bersama approval. - Status berubah menjadi APPROVED_KAPRODI. - Surat diteruskan ke Admin Fakultas. - Redirect ke Dashboard setelah berhasil." | |
| 6 | Melihat Semua Surat | Ketua Prodi | | "Semua Surat: - Diakses dari sidebar menu 'Semua Surat'. - Menampilkan seluruh surat yang pernah diproses oleh Ketua Prodi beserta statusnya." | |

---

## 4. Admin Fakultas

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Admin Fakultas | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Admin Fakultas (/admin-fakultas/dashboard)." | |
| 2 | Mengakses Dashboard | Admin Fakultas | | "Dashboard: - Menampilkan daftar surat yang sudah disetujui Ketua Prodi (status APPROVED_KAPRODI) dan memerlukan registrasi nomor SKL. - Kartu statistik dan tabel surat perlu tindakan. - Klik ikon aksi untuk membuka halaman detail surat." | |
| 3 | Me-review Detail Surat | Admin Fakultas | | "Detail Surat: - Breadcrumb: Surat Masuk / Penerima / Identitas Pemohon. - Kiri: Kartu Identitas Pengaju (Nama, Role, NIM, Prodi, Email, No HP), Kartu Detail Surat (Jenis Surat, Status, Tanggal Pengajuan, Update Terakhir), Kartu Lampiran. - Pratinjau surat AK.008 lengkap dengan tanda tangan Ketua Prodi dan Pemohon, kontrol zoom (+/−). - Panel Aksi: 'Setujui Surat' (hijau) dan 'Lihat Draft Surat' (outline). - Riwayat Surat: timeline proses." | |
| 4 | Meregistrasi Surat | Admin Fakultas | | "Aksi Registrasi: - Klik 'Setujui Surat' → meregistrasi pengajuan dengan pesan 'Surat telah diregistrasi oleh Admin Fakultas'. - Atau redirect ke halaman generate (/admin-fakultas/surat/[id]/generate) untuk mengisi nomor SKL. - Setelah berhasil: status berubah menjadi REGISTERED (atau REGISTERING). - Surat diteruskan ke Supervisor Akademik. - Alert: 'Surat berhasil diregistrasi!' lalu redirect ke Dashboard." | |
| 5 | Melihat Semua Surat | Admin Fakultas | | "Semua Surat: - Diakses dari sidebar menu 'Semua Surat'. - Menampilkan seluruh surat yang pernah diproses oleh Admin Fakultas beserta statusnya." | |

---

## 5. Supervisor Akademik

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Supervisor Akademik | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Supervisor (/supervisor/dashboard)." | |
| 2 | Mengakses Dashboard | Supervisor Akademik | | "Dashboard: - Menampilkan daftar surat yang sudah terdaftar (status REGISTERED) dan memerlukan review Supervisor. - Kartu statistik dan tabel surat perlu tindakan. - Klik ikon aksi untuk membuka halaman review surat." | |
| 3 | Me-review Surat | Supervisor Akademik | | "Review Surat: - Layout 3 kolom: Kiri (1 kolom): Detail Permohonan (Pengaju, NIM, Prodi, Perihal, Tgl Masuk, Status, Nomor Surat Pengantar, Nomor SKL), Kartu Tanda Tangan Ketua Prodi (preview TTD + teks '✓ Sudah ditandatangani Kaprodi'), Kartu Lampiran (daftar file + preview), Riwayat Surat (timeline). - Kanan (2 kolom): Pratinjau Surat format A4 lengkap (AK.008 header, Nomor Surat, Nomor SKL, data mahasiswa, tanda tangan Kaprodi + Mahasiswa), kontrol zoom (+/−). - Action Bar di bawah preview." | |
| 4 | Menyetujui Dokumen | Supervisor Akademik | | "Aksi Setujui (hanya jika status REGISTERED): - Klik 'Setujui Dokumen' (tombol biru). - Status berubah menjadi APPROVED_SUPERVISOR. - Catatan: 'Disetujui oleh Supervisor, diteruskan ke Staf Fakultas untuk pencetakan'. - Redirect ke Dashboard." | |
| 5 | Meminta Revisi | Supervisor Akademik | | "Aksi Revisi (hanya jika status REGISTERED): - Klik tombol 'Revisi' (oranye) → muncul Modal 'Kirim Permintaan Revisi'. - Info box oranye: 'Mahasiswa akan menerima notifikasi dan dapat melakukan pengeditan kembali'. - Textarea untuk menulis detail revisi. - Tombol 'Kirim Revisi' (disabled jika kosong). - Setelah submit: status berubah menjadi REVISI, redirect ke Dashboard." | |
| 6 | Menolak Dokumen | Supervisor Akademik | | "Aksi Tolak (hanya jika status REGISTERED): - Klik tombol 'Tolak' (merah) → muncul Modal 'Konfirmasi Penolakan'. - Info box merah: 'Tindakan ini bersifat final. Dokumen yang ditolak tidak dapat diedit kembali'. - Textarea wajib diisi alasan penolakan. - Tombol 'Konfirmasi Tolak' (disabled jika kosong). - Setelah submit: status berubah menjadi DITOLAK, redirect ke Dashboard." | |
| 7 | Melihat Semua Surat | Supervisor Akademik | | "Semua Surat: - Diakses dari sidebar menu 'Semua Surat'. - Menampilkan seluruh surat yang pernah diproses oleh Supervisor." | |

---

## 6. Staf Fakultas

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Staf Fakultas | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Staf Fakultas (/staff-fakultas/dashboard)." | |
| 2 | Mengakses Dashboard | Staf Fakultas | | "Dashboard: - Menampilkan daftar surat yang sudah disetujui Supervisor (status APPROVED_SUPERVISOR) dan memerlukan proses pencetakan. - Kartu statistik dan tabel surat perlu tindakan. - Klik ikon aksi untuk membuka halaman detail surat." | |
| 3 | Me-review Detail Surat | Staf Fakultas | | "Detail Surat: - Identitas Pengaju (Nama, NIM, Prodi, Email, No HP). - Detail Surat (Jenis Surat, Status, Tanggal Pengajuan, Nomor Surat Pengantar, Nomor SKL). - Pratinjau surat format AK.008 lengkap dengan kontrol zoom (+/−). - Tanda tangan Ketua Prodi dan Mahasiswa sudah tampil di pratinjau. - Lampiran: daftar file dengan tombol preview. - Riwayat Surat: timeline." | |
| 4 | Mengirim Surat ke Proses Cetak | Staf Fakultas | | "Aksi Kerjakan: - Tombol 'Kerjakan' / 'Proses Surat' untuk meneruskan surat ke tahap pencetakan. - Setelah berhasil: status berubah menjadi SIAP_CETAK (atau STEP_KONVENSIONAL). - Surat diteruskan ke UPA untuk finalisasi. - Redirect ke Dashboard." | |
| 5 | Melihat Semua Surat | Staf Fakultas | | "Semua Surat: - Diakses dari sidebar menu 'Semua Surat'. - Menampilkan seluruh surat yang pernah diproses oleh Staf Fakultas." | |

---

## 7. Manajer TU

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Manajer TU | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Manajer TU (/manajer-tu/dashboard)." | |
| 2 | Mengakses Dashboard | Manajer TU | | "Dashboard: - Menampilkan daftar surat yang memerlukan disposisi Manajer TU. - Kartu statistik. - Tabel surat perlu tindakan. - Klik ikon aksi untuk membuka halaman review detail surat." | |
| 3 | Me-review Detail Surat | Manajer TU | | "Detail Surat: - Identitas Pengaju (Nama, NIM, Prodi, Email, No HP). - Detail Surat (Jenis Surat, Status, Tanggal Pengajuan, Nomor Surat Pengantar, Nomor SKL). - Pratinjau surat format AK.008 dengan kontrol zoom (+/−). - Tanda tangan Ketua Prodi dan Mahasiswa. - Lampiran: daftar file dengan tombol preview. - Riwayat Surat: timeline." | |
| 4 | Mendisposisi ke Staf Fakultas | Manajer TU | | "Aksi Kirim ke Staf: - Tombol 'Kirim ke Staf Fakultas' untuk meneruskan surat ke Staf Fakultas. - Setelah berhasil: surat muncul di Dashboard Staf Fakultas untuk diproses. - Redirect ke Dashboard Manajer TU." | |

---

## 8. UPA (Unit Pengelola Akademik)

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | UPA | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard UPA (/upa/dashboard)." | |
| 2 | Mengakses Dashboard | UPA | | "Dashboard: - Menampilkan daftar surat yang siap difinalisasi (status STEP_KONVENSIONAL / SIAP_CETAK). - Kartu statistik dan tabel surat perlu tindakan. - Klik ikon aksi untuk membuka halaman review surat." | |
| 3 | Me-review Detail Surat | UPA | | "Review Surat: - Breadcrumb: Surat Masuk / Review Surat. - Kiri: Detail Permohonan (Pengaju, NIM, Prodi, Perihal, Tgl Masuk, Status, Nomor Surat Pengantar, Nomor SKL). - Kartu Tanda Tangan Mahasiswa (preview tanda tangan + nama + NIM). - Kartu Tanda Tangan Ketua Prodi (preview TTD + '✓ Sudah ditandatangani Kaprodi'). - Lampiran: daftar file dengan tombol preview. - Riwayat Surat: timeline. - Kartu Nomor Surat Pratinjau (nomor dari Admin Prodi — banner biru jika tersedia, kuning jika belum). - Kanan: Pratinjau Surat format AK.008 lengkap dengan kontrol zoom (+/−)." | |
| 4 | Mengisi Nomor SKL Resmi | UPA | | "Form Nomor SKL Resmi: - Kartu 'Nomor SKL Resmi' dengan keterangan 'Nomor SKL final yang diberitahukan ke mahasiswa'. - Input field dengan placeholder 'Contoh: SKL/2026/001'. - Keterangan: 'Nomor SKL resmi yang akan diberitahukan ke mahasiswa'." | |
| 5 | Memfinalisasi Surat | UPA | | "Aksi Finalisasi: - Tombol 'Finalisasi & Selesaikan' (hijau) — disabled jika nomor surat pratinjau belum ada atau nomor SKL Resmi belum diisi. - Setelah klik: status berubah menjadi COMPLETED. - Catatan dikirim ke mahasiswa: 'Surat SKL dengan nomor [nomor] telah selesai. Silakan mengambil Surat Keterangan Lulus di Akademik dengan membawa pas foto dan meminta cap basah'. - Alert: 'Surat berhasil difinalisasi dengan nomor SKL: [nomor]'. - Redirect ke Dashboard UPA." | |
| 6 | Melihat Semua Surat | UPA | | "Semua Surat: - Diakses dari sidebar menu 'Semua Surat'. - Menampilkan seluruh surat yang pernah diproses oleh UPA." | |

---

## 9. Super Admin

| No | State | Aktor | Penguji | Deskripsi | Screenshot |
|----|-------|-------|---------|-----------|------------|
| 1 | Melakukan Login | Super Admin | | "Form Login: - Login menggunakan Email dan Password. - Ikon mata untuk lihat/sembunyikan password. - Tombol Login dengan loading saat proses. - Jika gagal: pesan error muncul. - Setelah berhasil, redirect ke Dashboard Super Admin (/super-admin/dashboard)." | |
| 2 | Mengakses Dashboard | Super Admin | | "Dashboard Super Admin: - Judul 'Dashboard Super Admin' dengan deskripsi 'Kelola master data sistem e-Office'. - 4 kartu statistik + navigasi: 'Data Mahasiswa' (biru, ikon topi toga, total mahasiswa, klik → /super-admin/mahasiswa), 'Data Pegawai' (hijau, ikon users, total pegawai, klik → /super-admin/pegawai), 'Data Program Studi' (ungu, ikon briefcase, total prodi, klik → /super-admin/prodi), 'Data Surat' (kuning, ikon file, total surat, klik → /super-admin/surat). - Setiap kartu memiliki tombol 'Kelola Data →'. - Quick Actions: 4 tombol 'Tambah Mahasiswa', 'Tambah Pegawai', 'Tambah Prodi', 'Lihat Semua Surat'." | |
| 3 | Mengelola Data Mahasiswa | Super Admin | | "Data Mahasiswa: - Halaman daftar mahasiswa (/super-admin/mahasiswa). - Tabel: Nama, NIM, Email, Program Studi, Status. - Fitur cari dan filter. - Tombol 'Tambah Mahasiswa' → redirect ke form tambah (/super-admin/mahasiswa/add). - Form Tambah Mahasiswa: kolom Nama, NIM, Email, Password, Program Studi (dropdown), dll. - Validasi dari input wajib diisi." | |
| 4 | Mengelola Data Pegawai | Super Admin | | "Data Pegawai: - Halaman daftar pegawai (/super-admin/pegawai). - Tabel: Nama, NIP, Email, Role, Status. - Fitur cari dan filter. - Tombol 'Tambah Pegawai' → redirect ke form tambah (/super-admin/pegawai/add). - Form Tambah Pegawai: kolom Nama, NIP, Email, Password, Role (dropdown: admin_prodi, ketua_prodi, admin_fakultas, supervisor, staf_fakultas, manajer_tu, upa), dll." | |
| 5 | Mengelola Data Program Studi | Super Admin | | "Data Program Studi: - Halaman daftar prodi (/super-admin/prodi). - Tabel: Nama Prodi, Kode, Fakultas, Ketua Prodi, Status. - Tombol 'Tambah Prodi' → redirect ke form tambah (/super-admin/prodi/add). - Form Tambah Prodi: kolom Nama Program Studi, Kode, Fakultas, Ketua Prodi (pilih dari pegawai), dll." | |
| 6 | Melihat Data Surat | Super Admin | | "Data Surat: - Halaman daftar seluruh surat di sistem (/super-admin/surat). - Tabel: ID Surat, Pengaju, Perihal, Status, Tanggal. - Fitur cari dan filter. - Menampilkan semua surat dari semua mahasiswa dan semua status." | |

---

## Alur Status Pengajuan SKL (Referensi)

```
DRAFT → SUBMITTED → VERIFIED_ADMIN → APPROVED_KAPRODI → REGISTERING → REGISTERED → APPROVED_SUPERVISOR → SIAP_CETAK / STEP_KONVENSIONAL → COMPLETED
                 ↘ REVISI (kembali ke Mahasiswa untuk edit)
                 ↘ DITOLAK (final, tidak bisa diedit)
                 ↘ BATAL (dibatalkan oleh Mahasiswa)
```

| Status | Label | Warna | Aktor yang Mengubah |
|--------|-------|-------|---------------------|
| DRAFT | Draft | Abu-abu | Mahasiswa (otomatis saat mengisi form) |
| SUBMITTED | Diajukan | Biru | Mahasiswa (klik Kirim) |
| VERIFIED_ADMIN | Verifikasi Admin | Cyan | Admin Prodi (Setujui) |
| APPROVED_KAPRODI | Disetujui Kaprodi | Cyan | Ketua Prodi (Setujui + TTD) |
| REGISTERING | Registrasi | Geekblue | Admin Fakultas (Registrasi) |
| REGISTERED | Terdaftar | Ungu | Admin Fakultas (Nomor SKL) |
| APPROVED_SUPERVISOR | Acc Supervisor | Ungu | Supervisor (Setujui) |
| SIAP_CETAK | Siap Cetak | Magenta | Staf Fakultas (Proses) |
| STEP_KONVENSIONAL | Step Konvensional | Magenta | Manajer TU (Disposisi) |
| COMPLETED | Selesai | Hijau | UPA (Finalisasi + Nomor SKL Resmi) |
| REVISI | Perlu Revisi | Kuning/Warning | Admin Prodi / Supervisor (Minta Revisi) |
| DITOLAK | Ditolak | Merah | Admin Prodi / Supervisor (Tolak) |
| BATAL | Dibatalkan | Abu-abu | Mahasiswa (Batalkan) |
