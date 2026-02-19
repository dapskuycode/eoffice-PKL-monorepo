/**
 * Halaman Demo untuk Testing Mock Database
 * Akses: /demo/mock-database
 */

'use client';

import { useState } from 'react';
import { db, demoAlurSurat, demoAlurRevisi, demoAlurTolak } from '@/lib/mockDatabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MockDatabaseDemo() {
  const [output, setOutput] = useState<string[]>([]);

  const runDemo = (demoFunction: () => void, demoName: string) => {
    // Capture console.log
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalLog(...args);
    };

    try {
      demoFunction();
      setOutput(logs);
    } finally {
      console.log = originalLog;
    }
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const showAllData = () => {
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalLog(...args);
    };

    console.log('========== DATA MAHASISWA ==========');
    console.log(JSON.stringify(db.mahasiswa, null, 2));
    console.log('\n========== DATA PEGAWAI ==========');
    console.log(JSON.stringify(db.pegawai, null, 2));
    console.log('\n========== DATA SURAT ==========');
    console.log(JSON.stringify(db.surat, null, 2));
    console.log('\n========== DATA SURAT PROSES ==========');
    console.log(JSON.stringify(db.surat_proses, null, 2));
    console.log('\n========== DATA LAMPIRAN ==========');
    console.log(JSON.stringify(db.lampiran, null, 2));
    console.log('\n========== DATA PENOMORAN ==========');
    console.log(JSON.stringify(db.penomoran_surat, null, 2));

    console.log = originalLog;
    setOutput(logs);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mock Database Demo</h1>
          <p className="text-gray-600">
            Testing simulasi alur surat tanpa backend. Semua data disimpan di memory browser.
          </p>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                onClick={() => runDemo(demoAlurSurat, 'Alur Normal')}
                className="bg-green-600 hover:bg-green-700"
              >
                🎯 Demo Alur Normal
              </Button>
              <Button
                onClick={() => runDemo(demoAlurRevisi, 'Alur Revisi')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                🔄 Demo Alur Revisi
              </Button>
              <Button
                onClick={() => runDemo(demoAlurTolak, 'Alur Tolak')}
                className="bg-red-600 hover:bg-red-700"
              >
                ❌ Demo Alur Tolak
              </Button>
              <Button
                onClick={showAllData}
                variant="outline"
              >
                📊 Tampilkan Semua Data
              </Button>
              <Button
                onClick={() => {
                  db.reset();
                  setOutput(['✓ Database berhasil direset']);
                }}
                variant="outline"
              >
                🔄 Reset Database
              </Button>
              <Button
                onClick={clearOutput}
                variant="outline"
              >
                🗑️ Clear Output
              </Button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">ℹ️ Informasi:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Data tersimpan di memory browser (hilang setelah refresh)</li>
                <li>• Klik tombol demo untuk melihat simulasi alur</li>
                <li>• Check console browser untuk log detail</li>
                <li>• Reset database untuk kembali ke state awal</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Output Console */}
        {output.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Output Console</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-[600px] overflow-y-auto">
                {output.join('\n')}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{db.mahasiswa.length}</p>
                <p className="text-sm text-gray-600 mt-1">Mahasiswa</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{db.pegawai.length}</p>
                <p className="text-sm text-gray-600 mt-1">Pegawai</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{db.surat.length}</p>
                <p className="text-sm text-gray-600 mt-1">Surat</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{db.surat_proses.length}</p>
                <p className="text-sm text-gray-600 mt-1">Proses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{db.lampiran.length}</p>
                <p className="text-sm text-gray-600 mt-1">Lampiran</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{db.penomoran_surat.length}</p>
                <p className="text-sm text-gray-600 mt-1">Penomoran</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumentasi Penggunaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Import Mock Database</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { db } from '@/lib/mockDatabase';

// Contoh penggunaan
const mahasiswa = db.getMahasiswaById(1);
const surat = db.ajukanSurat(1, 'Surat Keterangan Lulus');
const lampiran = db.uploadLampiran(surat.id_surat, file);`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Fungsi-fungsi Utama</h3>
              <ul className="space-y-2 text-sm">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">ajukanSurat(idMahasiswa, jenisSurat)</code> - Mahasiswa mengajukan surat</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">uploadLampiran(idSurat, file)</code> - Upload lampiran ke surat</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">prosesSurat(idSurat, idPegawai, aksi, catatan)</code> - Proses surat oleh pegawai</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">beriNomorSurat(idSurat, idPegawai)</code> - Berikan nomor surat</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">getSuratDetail(idSurat)</code> - Get detail lengkap surat dengan relasi</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
