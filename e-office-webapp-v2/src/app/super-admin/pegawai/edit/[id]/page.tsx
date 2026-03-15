'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { API_URL } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EditPegawaiPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [prodi, setProdi] = useState<any[]>([]);
  const [departemen, setDepartemen] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    nip: '',
    jabatan: '',
    noHp: '',
    departemenId: '',
    programStudiId: '',
    selectedRole: '', // Current role ID
  });

  useEffect(() => {
    loadDepartemen();
    loadProdi();
    loadRoles();
    loadPegawai();
  }, [id]);

  const loadDepartemen = async () => {
    try {
      const response = await fetch(`${API_URL}/super-admin/departemen?limit=100`, {
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
      const response = await fetch(`${API_URL}/super-admin/prodi?limit=100`, {
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
      const response = await fetch(`${API_URL}/master/role?limit=100`, {
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

  const loadPegawai = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`${API_URL}/super-admin/pegawai/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Extract first role ID (single role)
        const currentRoleId = (data.user?.userRole && data.user.userRole.length > 0)
          ? data.user.userRole[0].roleId
          : '';

        setFormData({
          userId: data.userId || '',
          name: data.user?.name || '',
          email: data.user?.email || '',
          nip: data.nip || '',
          jabatan: data.jabatan || '',
          noHp: data.noHp || '',
          departemenId: data.departemenId || '',
          programStudiId: data.programStudiId || '',
          selectedRole: currentRoleId,
        });
      }
    } catch (error) {
      console.error('Error loading pegawai:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredProdi = formData.departemenId
    ? prodi.filter((p) => p.departemenId === formData.departemenId)
    : prodi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update user data
      const userResponse = await fetch(`${API_URL}/master/user/${formData.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (!userResponse.ok) {
        alert('Gagal mengupdate data user');
        return;
      }

      // 2. Update pegawai data
      const pegawaiResponse = await fetch(`${API_URL}/super-admin/pegawai/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nip: formData.nip,
          jabatan: formData.jabatan,
          noHp: formData.noHp,
          departemenId: formData.departemenId || null,
          programStudiId: formData.programStudiId || null,
        }),
      });

      if (!pegawaiResponse.ok) {
        alert('Gagal mengupdate data pegawai');
        return;
      }

      // 3. Get current roles from database
      const currentRolesResponse = await fetch(`${API_URL}/super-admin/user-role/${formData.userId}`, {
        credentials: 'include',
      });

      let currentRoleIds: string[] = [];
      if (currentRolesResponse.ok) {
        const currentRolesData = await currentRolesResponse.json();
        currentRoleIds = (currentRolesData.data || []).map((ur: any) => ur.roleId);
      }

      // 4. Update role: remove all old roles, add new single role
      // Remove all existing roles
      for (const roleId of currentRoleIds) {
        await fetch(`${API_URL}/super-admin/user-role`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: formData.userId,
            roleId,
          }),
        });
      }

      // Add new selected role
      if (formData.selectedRole) {
        await fetch(`${API_URL}/super-admin/user-role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: formData.userId,
            roleId: formData.selectedRole,
          }),
        });
      }

      alert('Data pegawai berhasil diupdate!');
      router.push('/super-admin/pegawai');
    } catch (error) {
      console.error('Error updating pegawai:', error);
      alert('Terjadi kesalahan saat mengupdate pegawai');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <AppHeader greetingOnly={true} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Pegawai</h1>
            <p className="mt-2 text-gray-600">Update data pegawai</p>
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
