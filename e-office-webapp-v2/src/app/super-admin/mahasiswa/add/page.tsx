'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddMahasiswaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prodi, setProdi] = useState<any[]>([]);
  const [departemen, setDepartemen] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123', // Default password
    nim: '',
    tahunMasuk: new Date().getFullYear().toString(),
    noHp: '',
    alamat: '',
    tempatLahir: '',
    tanggalLahir: '',
    departemenId: '',
    programStudiId: '',
  });

  useEffect(() => {
    loadDepartemen();
    loadProdi();
  }, []);

  const loadDepartemen = async () => {
    try {
      const response = await fetch('http://localhost:3001/super-admin/departemen?limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDepartemen(data.data || []);
      }
    } catch (error) {
      console.error('Error loading departemen:', error);
    }
  };

  const loadProdi = async () => {
    try {
      const response = await fetch('http://localhost:3001/super-admin/prodi?limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProdi(data.data || []);
      }
    } catch (error) {
      console.error('Error loading prodi:', error);
    }
  };

  const filteredProdi = formData.departemenId
    ? prodi.filter((p) => p.departemenId === formData.departemenId)
    : prodi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create user account
      const userResponse = await fetch('http://localhost:3001/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      let userId = '';
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.user.id;
      } else if (userResponse.status === 400 || userResponse.status === 422) {
        // Probable "User already exists" or validation error
        // On retry, we'll try to find the user if the error looks like a duplicate
        const errorData = await userResponse.json();
        if (errorData.message?.toLowerCase().includes('already exist') || errorData.code === 'USER_ALREADY_EXISTS') {
          // We'll trust the backend consolidated endpoint to find the user by email
          console.log('User already exists, proceeding to create/update profile');
        } else {
          alert(`Gagal membuat user: ${errorData.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      } else {
        alert('Gagal membuat user (Server Error)');
        setLoading(false);
        return;
      }

      // 2. Create mahasiswa record (Backend now handles role assignment too)
      const mahasiswaResponse = await fetch('http://localhost:3001/super-admin/mahasiswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nim: formData.nim,
          tahunMasuk: formData.tahunMasuk,
          noHp: formData.noHp,
          alamat: formData.alamat || null,
          tempatLahir: formData.tempatLahir || null,
          tanggalLahir: formData.tanggalLahir ? new Date(formData.tanggalLahir).toISOString() : null,
          userId: userId || null, // If null, backend will find by email
          email: formData.email, // Provided for backend to find user
          departemenId: formData.departemenId,
          programStudiId: formData.programStudiId,
        }),
      });

      if (!mahasiswaResponse.ok) {
        const errorData = await mahasiswaResponse.json();
        alert(`Gagal membuat data mahasiswa: ${errorData.message || 'Unknown error'}`);
        return;
      }

      alert('Mahasiswa berhasil ditambahkan!');
      router.push('/super-admin/mahasiswa');
    } catch (error) {
      console.error('Error creating mahasiswa:', error);
      alert('Terjadi kesalahan saat menambahkan mahasiswa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Mahasiswa</h1>
            <p className="mt-2 text-gray-600">Isi form untuk menambahkan mahasiswa baru</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: password123"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password default: password123 (mahasiswa bisa ubah nanti)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Akademik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nim">NIM *</Label>
                  <Input
                    id="nim"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="H031201002"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tahunMasuk">Tahun Masuk *</Label>
                  <Input
                    id="tahunMasuk"
                    value={formData.tahunMasuk}
                    onChange={(e) => setFormData({ ...formData, tahunMasuk: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="departemen">Departemen *</Label>
                <select
                  id="departemen"
                  value={formData.departemenId}
                  onChange={(e) =>
                    setFormData({ ...formData, departemenId: e.target.value, programStudiId: '' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Departemen</option>
                  {departemen.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="prodi">Program Studi *</Label>
                <select
                  id="prodi"
                  value={formData.programStudiId}
                  onChange={(e) => setFormData({ ...formData, programStudiId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.departemenId}
                >
                  <option value="">Pilih Program Studi</option>
                  {filteredProdi.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="noHp">No HP *</Label>
                <Input
                  id="noHp"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="08123456789"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                  <Input
                    id="tempatLahir"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
