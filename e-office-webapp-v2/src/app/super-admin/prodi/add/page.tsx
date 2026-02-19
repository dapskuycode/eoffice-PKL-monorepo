'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddProdiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departemen, setDepartemen] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    departemenId: '',
  });

  useEffect(() => {
    loadDepartemen();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/super-admin/prodi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          departemenId: formData.departemenId,
        }),
      });

      if (!response.ok) {
        alert('Gagal menambahkan program studi');
        return;
      }

      alert('Program studi berhasil ditambahkan!');
      router.push('/super-admin/prodi');
    } catch (error) {
      console.error('Error creating prodi:', error);
      alert('Terjadi kesalahan saat menambahkan program studi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Program Studi</h1>
            <p className="mt-2 text-gray-600">Isi form untuk menambahkan program studi baru</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Program Studi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Program Studi *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="S1 Informatika"
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">Kode Program Studi *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="IF-S1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="departemen">Departemen *</Label>
                <select
                  id="departemen"
                  value={formData.departemenId}
                  onChange={(e) => setFormData({ ...formData, departemenId: e.target.value })}
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
