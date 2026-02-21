'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddPegawaiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prodi, setProdi] = useState<any[]>([]);
  const [departemen, setDepartemen] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123', // Default password
    nip: '',
    jabatan: '',
    noHp: '',
    departemenId: '',
    programStudiId: '',
    selectedRole: '', // Single role ID
  });

  useEffect(() => {
    loadDepartemen();
    loadProdi();
    loadRoles();
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

  const loadRoles = async () => {
    try {
      const response = await fetch('http://localhost:3001/master/role?limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filter only staff roles (exclude mahasiswa, super_admin)
        const staffRoles = (data.data || []).filter((r: any) =>
          ['admin_prodi', 'kaprodi', 'admin_surat', 'supervisor', 'upa'].includes(r.name)
        );
        setRoles(staffRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
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
      // NOTE: Do NOT use credentials:'include' here — it would override the super_admin's session cookie
      const userResponse = await fetch('http://localhost:3001/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const errorData = await userResponse.json();
        if (errorData.message?.toLowerCase().includes('already exist') || errorData.code === 'USER_ALREADY_EXISTS') {
          console.log('User already exists, proceeding to create profile');
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

      // 2. Create pegawai record (Backend now handles role assignment)
      const pegawaiResponse = await fetch('http://localhost:3001/super-admin/pegawai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nip: formData.nip,
          jabatan: formData.jabatan,
          noHp: formData.noHp,
          userId: userId || null,
          email: formData.email,
          departemenId: formData.departemenId || null,
          programStudiId: formData.programStudiId || null,
          roleId: formData.selectedRole,
        }),
      });

      if (!pegawaiResponse.ok) {
        const errorData = await pegawaiResponse.json();
        alert(`Gagal membuat data pegawai: ${errorData.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      alert('Pegawai berhasil ditambahkan!');
      router.push('/super-admin/pegawai');
    } catch (error) {
      console.error('Error creating pegawai:', error);
      alert('Terjadi kesalahan saat menambahkan pegawai');
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
            <h1 className="text-3xl font-bold text-gray-900">Tambah Pegawai</h1>
            <p className="mt-2 text-gray-600">Isi form untuk menambahkan pegawai baru</p>
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
                  Password default: password123 (pegawai bisa ubah nanti)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Kepegawaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nip">NIP *</Label>
                  <Input
                    id="nip"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="198012312010121001"
                    required
                  />
                </div>
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
              </div>

              <div>
                <Label htmlFor="jabatan">Jabatan *</Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Dosen / Staf TU / dll"
                  required
                />
              </div>

              <div>
                <Label htmlFor="departemen">Departemen</Label>
                <select
                  id="departemen"
                  value={formData.departemenId}
                  onChange={(e) =>
                    setFormData({ ...formData, departemenId: e.target.value, programStudiId: '' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Departemen (Opsional)</option>
                  {departemen.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="prodi">Program Studi</Label>
                <select
                  id="prodi"
                  value={formData.programStudiId}
                  onChange={(e) => setFormData({ ...formData, programStudiId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.departemenId}
                >
                  <option value="">Pilih Program Studi (Opsional)</option>
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
              <CardTitle>Role Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="role">Pilih Role *</Label>
                <select
                  id="role"
                  value={formData.selectedRole}
                  onChange={(e) => setFormData({ ...formData, selectedRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.replace(/_/g, ' ').toUpperCase()} {role.description ? `- ${role.description}` : ''}
                    </option>
                  ))}
                </select>
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
