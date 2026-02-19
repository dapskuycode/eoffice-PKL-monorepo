/**
 * Contoh Komponen React untuk Upload Lampiran
 * Menggunakan Mock Database
 */

'use client';

import React, { useState } from 'react';
import { db, Lampiran } from '@/lib/mockDatabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadLampiranDemo() {
  const [idSurat] = useState(1); // ID surat yang akan diupload lampiran
  const [lampiran, setLampiran] = useState<Lampiran[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<Lampiran | null>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file PDF, JPG, atau PNG yang diizinkan');
      return;
    }

    try {
      // Upload ke mock database
      const newLampiran = db.uploadLampiran(idSurat, file);
      
      // Update state
      setLampiran(prev => [...prev, newLampiran]);
      
      // Reset input
      event.target.value = '';
      
      alert(`File ${file.name} berhasil diupload!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal upload file');
    }
  };

  // Handle preview
  const handlePreview = (lampiran: Lampiran) => {
    setPreviewFile(lampiran);
    setPreviewUrl(lampiran.path_file);
  };

  // Handle delete
  const handleDelete = (idLampiran: number) => {
    if (!confirm('Hapus lampiran ini?')) return;

    // Hapus dari mock database
    const index = db.lampiran.findIndex(l => l.id_lampiran === idLampiran);
    if (index !== -1) {
      // Revoke object URL untuk cleanup
      URL.revokeObjectURL(db.lampiran[index].path_file);
      db.lampiran.splice(index, 1);
    }

    // Update state
    setLampiran(prev => prev.filter(l => l.id_lampiran !== idLampiran));
    
    // Close preview if deleted file is being previewed
    if (previewFile?.id_lampiran === idLampiran) {
      setPreviewFile(null);
      setPreviewUrl(null);
    }
  };

  // Close preview
  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Demo Upload Lampiran</h1>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Dokumen Lampiran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Klik untuk upload</span>
                    <p className="mt-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG hingga 5MB
                  </p>
                </div>
              </label>
            </div>

            <p className="text-xs text-gray-500">
              * File akan disimpan di memory browser dan hilang setelah refresh
            </p>
          </div>
        </CardContent>
      </Card>

      {/* List Lampiran */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lampiran ({lampiran.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {lampiran.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada lampiran</p>
          ) : (
            <div className="space-y-3">
              {lampiran.map((item) => (
                <div
                  key={item.id_lampiran}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.tipe_file.includes('pdf') ? (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.nama_file}</p>
                      <p className="text-xs text-gray-500">
                        {item.file_object ? formatFileSize(item.file_object.size) : 'Unknown size'} • {new Date(item.uploaded_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(item)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(item.id_lampiran)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewUrl && previewFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{previewFile.nama_file}</h3>
                <p className="text-xs text-gray-500">{previewFile.tipe_file}</p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {previewFile.tipe_file.includes('pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px] border-0"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={previewFile.nama_file}
                  className="max-w-full h-auto mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
