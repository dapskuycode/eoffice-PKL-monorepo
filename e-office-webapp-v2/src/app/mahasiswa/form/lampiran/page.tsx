"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Space,
  Typography,
  Spin,
  App,
  ConfigProvider,
  Modal,
} from "antd";
import idID from "antd/locale/id_ID";
import { FilePdfOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { UploadFile } from 'antd';

import ProgressStepper from '@/components/ProgressStepper';
import { UploadField, type FileUpload } from '@/components/forms/UploadField';
import { mahasiswaService } from '@/services/mahasiswaService';
import { sklService } from '@/services/sklService';
import { uploadService } from '@/services/uploadService';

const { Title, Text } = Typography;

interface LampiranData {
  ktm?: FileUpload;
  beritaAcara?: FileUpload;
  ujianSarjana?: FileUpload;
  pasFoto?: FileUpload;
  transkrip?: FileUpload;
  buktiSubmit?: FileUpload;
  lainnya?: FileUpload;
}

function LampiranContent() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [lampiran, setLampiran] = useState<LampiranData>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileUpload | null>(null);

  const steps = [
    { label: "Info Pengajuan", status: "completed" as const },
    { label: "Detail Pengajuan", status: "completed" as const },
    { label: "Lampiran", status: "active" as const },
    { label: "Review & Ajukan", status: "upcoming" as const },
  ];

  useEffect(() => {
    // Guard: Cek apakah langkah sebelumnya sudah diisi
    const detailData = localStorage.getItem("skl_detail_pengajuan");
    const isEditMode = localStorage.getItem('skl_edit_mode') === 'true';
    if (!detailData && !isEditMode) {
      console.warn('Lampiran page accessed without detail data. Redirecting to dashboard.');
      router.replace('/mahasiswa/dashboard');
      return;
    }

    const saved = localStorage.getItem("skl_lampiran");
    if (saved) {
      setLampiran(JSON.parse(saved));
    }

    const fetchStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftIdFromUrl = urlParams.get('draftId');
      const draftIdFromStorage = localStorage.getItem('skl_draft_id');
      const currentDraftId = draftIdFromUrl || draftIdFromStorage;

      if (currentDraftId) {
        setDraftId(currentDraftId);
        try {
          const detail = await sklService.getPengajuanDetail(currentDraftId);
          if (detail) {
            setDraftStatus(detail.status);
            
            // Load lampiran from database
            if (detail.lampiran && detail.lampiran.length > 0) {
              console.log('Loading lampiran from database:', detail.lampiran);
              const lampiranFromDb: LampiranData = {};
              
              detail.lampiran.forEach((item: any) => {
                const fileUpload: FileUpload = {
                  uid: item.id,
                  name: item.namaFile || item.jenisDokumen,
                  size: 0,
                  type: item.pathFile.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
                  dataUrl: item.pathFile,
                  filePath: item.pathFile,
                  isExisting: true,
                };
                
                // Map jenisDokumen to field name
                switch (item.jenisDokumen) {
                  case 'KTM':
                    lampiranFromDb.ktm = fileUpload;
                    break;
                  case 'BERITA_ACARA_UJIAN':
                    lampiranFromDb.beritaAcara = fileUpload;
                    break;
                  case 'BEBAS_PUSTAKA':
                    lampiranFromDb.ujianSarjana = fileUpload;
                    break;
                  case 'PAS_FOTO':
                    lampiranFromDb.pasFoto = fileUpload;
                    break;
                  case 'TRANSKRIP_NILAI':
                    lampiranFromDb.transkrip = fileUpload;
                    break;
                  case 'BUKTI_SUBMIT':
                    lampiranFromDb.buktiSubmit = fileUpload;
                    break;
                  case 'LAINNYA':
                    lampiranFromDb.lainnya = fileUpload;
                    break;
                }
              });
              
              setLampiran(lampiranFromDb);
              // Save lampiran from database (contains MinIO URLs, not base64)
              try {
                localStorage.setItem('skl_lampiran', JSON.stringify(lampiranFromDb));
              } catch (storageError) {
                console.warn('Failed to save lampiran to localStorage:', storageError);
                // Continue anyway, data is in state
              }
              console.log('Loaded lampiran:', lampiranFromDb);
            }
          }
        } catch (err) {
          console.error('Failed to fetch status in lampiran:', err);
        }
      }
    };
    fetchStatus();
  }, [router]);

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

  const createFileUpload = (file: File): FileUpload => ({
    uid: Date.now().toString(),
    name: file.name,
    size: file.size,
    type: file.type,
    originFileObj: file,
  });

  const handleUpload = (field: keyof LampiranData, file: File) => {
    const isAllowed = allowedTypes.includes(file.type);
    if (!isAllowed) {
      message.error("File harus berupa PDF, JPG, atau PNG");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File harus lebih kecil dari 5MB!");
      return false;
    }

    // Create FileReader to get data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileUpload: FileUpload = {
        uid: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file,
        dataUrl: e.target?.result as string,
      };
      setLampiran(prev => ({ ...prev, [field]: fileUpload }));
      message.success(`${file.name} berhasil ditambahkan`);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleDelete = (field: keyof LampiranData) => {
    setLampiran(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    message.success("File dihapus");
  };

  const handleNext = () => {
    // List of mandatory fields (1-6)
    const mandatoryFields: { key: keyof LampiranData; label: string }[] = [
      { key: 'ktm', label: 'Kartu Tanda Mahasiswa (KTM)' },
      { key: 'beritaAcara', label: 'Scan berita acara kelulusan' },
      { key: 'ujianSarjana', label: 'Scan berita acara ujian sarjana' },
      { key: 'pasFoto', label: 'Pas foto hitam putih/berwarna ukuran 4X6' },
      { key: 'transkrip', label: 'Transkrip akademik terbaik ditandatangani dekan' },
      { key: 'buktiSubmit', label: 'Bukti submit HKI/Nomor Urut' },
    ];

    // Find missing mandatory fields
    const missingFields = mandatoryFields.filter(field => !lampiran[field.key]);

    // Tampilkan modal jika ada lampiran wajib yang belum diisi
    if (missingFields.length > 0) {
      modal.warning({
        title: "Lampiran Wajib Belum Lengkap",
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        content: (
          <>
            <p>Mohon unggah lampiran berikut yang <strong>wajib diisi</strong>:</p>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              {missingFields.map(field => (
                <li key={field.key}><strong>{field.label}</strong></li>
              ))}
            </ul>
          </>
        ),
        okText: "Lengkapi Lampiran",
        centered: true,
      });
      return;
    }

    // Save only metadata to localStorage (without large dataUrl to avoid quota exceeded)
    const lampiranMetadata: Record<string, any> = {};
    Object.entries(lampiran).forEach(([key, file]) => {
      if (file) {
        lampiranMetadata[key] = {
          uid: file.uid,
          name: file.name,
          size: file.size,
          type: file.type,
          // Include dataUrl for smaller files only (< 100KB)
          dataUrl: file.size < 100 * 1024 ? file.dataUrl : undefined,
          hasFile: true
        };
      }
    });

    // Store full lampiran data with dataUrl in sessionStorage (larger limit) or window object
    if (typeof window !== 'undefined') {
      (window as any).__skl_lampiran_full__ = lampiran;
    }

    localStorage.setItem("skl_lampiran", JSON.stringify(lampiranMetadata));
    message.success("Draft tersimpan, melanjutkan...");
    router.push("/mahasiswa/form/review");
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    
    try {
      const profile = await mahasiswaService.getProfile();
      
      if (!profile) {
        message.error("Data profil tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      // Get or create draft ID
      let draftId = localStorage.getItem('skl_draft_id');
      
      if (!draftId) {
        // Create new draft first with data from previous steps
        const dataDiriStr = localStorage.getItem("skl_data_diri");
        const detailStr = localStorage.getItem("skl_detail_pengajuan");
        const dataDiri = dataDiriStr ? JSON.parse(dataDiriStr) : {};
        const detail = detailStr ? JSON.parse(detailStr) : {};

        const newDraft = await sklService.saveDraft({
          mahasiswaId: profile.id,
          namaSementara: dataDiri.nama,
          nimSementara: dataDiri.nim,
          emailSementara: dataDiri.email,
          prodiSementara: dataDiri.prodi,
          departemenSementara: dataDiri.departemen,
          noHpSementara: dataDiri.no_hp,
          alamatSementara: dataDiri.alamat,
          tempatLahirSementara: dataDiri.tempatLahir,
          tanggalLahirSementara: dataDiri.tanggalLahir,
          tglLulus: detail.tanggalLulus,
          ipkTerakhir: detail.ipk ? parseFloat(detail.ipk) : undefined,
          jumlahSks: detail.jumlahSks ? parseInt(detail.jumlahSks) : undefined,
          draftStep: 3,
          createLog: true
        });

        if (!newDraft || !newDraft.id) {
          message.error("Gagal membuat draft baru.");
          setLoading(false);
          return;
        }

        draftId = newDraft.id;
        localStorage.setItem('skl_draft_id', draftId);
        console.log('Created new draft ID:', draftId);
      }

      // Save only metadata to localStorage
      const lampiranMetadata: Record<string, any> = {};
      Object.entries(lampiran).forEach(([key, file]) => {
        if (file) {
          lampiranMetadata[key] = {
            uid: file.uid,
            name: file.name,
            size: file.size,
            type: file.type,
            hasFile: true
          };
        }
      });
      localStorage.setItem("skl_lampiran", JSON.stringify(lampiranMetadata));

      // Map lampiran to upload
      const lampiranMap: { [key: string]: { file: FileUpload | undefined, jenis: string } } = {
        ktm: { file: lampiran.ktm, jenis: 'KTM' },
        transkrip: { file: lampiran.transkrip, jenis: 'TRANSKRIP_NILAI' },
        beritaAcara: { file: lampiran.beritaAcara, jenis: 'BERITA_ACARA_UJIAN' },
        ujianSarjana: { file: lampiran.ujianSarjana, jenis: 'BEBAS_PUSTAKA' },
        pasFoto: { file: lampiran.pasFoto, jenis: 'PAS_FOTO' },
        buktiSubmit: { file: lampiran.buktiSubmit, jenis: 'BUKTI_SUBMIT' },
        lainnya: { file: lampiran.lainnya, jenis: 'LAINNYA' },
      };

      // Check existing lampiran in database to avoid duplicates
      let existingLampiran: any[] = [];
      try {
        const currentDraft = await sklService.getPengajuanDetail(draftId);
        if (currentDraft && currentDraft.lampiran) {
          existingLampiran = currentDraft.lampiran;
          console.log('Existing lampiran in database:', existingLampiran);
        }
      } catch (err) {
        console.warn('Could not fetch existing lampiran:', err);
      }

      // Upload lampiran files to MinIO and save to database
      let uploadedCount = 0;
      let failedCount = 0;
      let skippedCount = 0;

      for (const [key, { file, jenis }] of Object.entries(lampiranMap)) {
        // Skip if file is from existing pengajuan (already in database)
        if (file && (file as any).isExisting) {
          console.log(`Skipping ${key} - file already exists in database`);
          skippedCount++;
          continue;
        }

        // Check if this jenis already exists in database
        const alreadyExists = existingLampiran.some(l => l.jenisDokumen === jenis);
        if (alreadyExists && !file?.originFileObj) {
          console.log(`Skipping ${key} - already in database and no new file`);
          skippedCount++;
          continue;
        }

        if (file && file.originFileObj) {
          try {
            console.log(`Uploading ${jenis} to MinIO for draft...`);
            
            // Delete existing lampiran of this type first to avoid duplicates
            if (alreadyExists) {
              console.log(`Deleting existing ${jenis} before uploading new one`);
              await sklService.deleteLampiranByCategory(draftId, jenis);
            }
            
            // Upload file to MinIO
            const uploadResult = await uploadService.uploadFile(file.originFileObj, 'lampiran');

            if (uploadResult) {
              console.log(`Upload successful for ${jenis}:`, uploadResult);
              
              // Save lampiran reference to database
              await sklService.addLampiran(draftId, {
                jenisDokumen: jenis as any,
                pathFile: uploadResult.url,
              });
              
              console.log(`Saved ${jenis} to database:`, uploadResult.fileName);
              uploadedCount++;
            }
          } catch (err) {
            console.error(`Failed to upload ${jenis}:`, err);
            failedCount++;
            // Don't throw error, continue with other files
          }
        }
      }

      // Get detail data for updating
      const detailStr = localStorage.getItem("skl_detail_pengajuan");
      const detail = detailStr ? JSON.parse(detailStr) : {};

      // Sync draft step to DB
      await sklService.saveDraft({
        id: draftId,
        mahasiswaId: profile.id,
        tglLulus: detail.tanggalLulus,
        ipkTerakhir: detail.ipk ? parseFloat(detail.ipk) : undefined,
        jumlahSks: detail.jumlahSks ? parseInt(detail.jumlahSks) : undefined,
        draftStep: 3,
        createLog: true
      });

      // Store full lampiran data in window object for use in review page
      if (typeof window !== 'undefined') {
        (window as any).__skl_lampiran_full__ = lampiran;
      }

      const totalFiles = Object.values(lampiran).filter(f => !!f).length;
      
      if (uploadedCount > 0) {
        message.success(`Draft berhasil disimpan dengan ${uploadedCount} lampiran baru! (Total: ${totalFiles} lampiran)`);
      } else if (skippedCount > 0 && uploadedCount === 0) {
        message.success(`Draft berhasil disimpan! Semua lampiran sudah tersimpan (${skippedCount} file).`);
      } else if (failedCount > 0) {
        message.warning("Draft disimpan tapi ada lampiran yang gagal diupload.");
      } else {
        message.success("Draft berhasil disimpan!");
      }
      
      // Redirect to riwayat page
      setTimeout(() => {
        router.push('/mahasiswa/riwayat');
      }, 1000);
    } catch (err) {
      console.error('Save draft error:', err);
      message.error("Gagal menyimpan draft.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Spin size="large" description="Memuat Data..." fullscreen />
    );
  }

  return (
    <ConfigProvider locale={idID}>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <div style={{ margin: "0 auto", width: "100%", maxWidth: "1800px", padding: "24px clamp(16px, 4vw, 48px)" }}>
          <div style={{ marginBottom: "32px" }}>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: "#262626" }}>
              Lampiran
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Lampirkan dokumen pendukung yang diperlukan.
            </Text>
          </div>

          <div style={{ marginBottom: "40px", padding: "32px", borderRadius: "8px" }}>
            <ProgressStepper steps={steps} />
          </div>

          <Card
            title="KEPERLUAN"
            variant="borderless"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: "24px"
            }}
          >
            <Text style={{ color: '#ff4d4f', fontSize: '14px', display: 'block', marginBottom: '16px' }}>
              * Lampiran dengan tanda bintang (*) wajib diisi
            </Text>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(12px, 3vw, 24px)" }}>
              <div>
                <UploadField
                  field="ktm"
                  label="1. Kartu Tanda Mahasiswa (KTM)"
                  required={true}
                  exampleImage="/CONTOH_KTM.jpeg"
                  file={lampiran.ktm}
                  onUpload={(f) => handleUpload("ktm", f)}
                  onDelete={() => handleDelete("ktm")}
                  onPreview={() => setPreviewFile(lampiran.ktm || null)}
                />
                <UploadField
                  field="ujianSarjana"
                  label="3. Scan berita acara ujian sarjana"
                  required={true}
                  exampleImage="/CONTOH_BERITA_UJIAN.jpeg"
                  file={lampiran.ujianSarjana}
                  onUpload={(f) => handleUpload("ujianSarjana", f)}
                  onDelete={() => handleDelete("ujianSarjana")}
                  onPreview={() => setPreviewFile(lampiran.ujianSarjana || null)}
                />
                <UploadField
                  field="transkrip"
                  label="5. Transkrip akademik terbaik ditandatangani dekan"
                  required={true}
                  exampleImage="/CONTOH_TRANSKRIP.jpeg"
                  file={lampiran.transkrip}
                  onUpload={(f) => handleUpload("transkrip", f)}
                  onDelete={() => handleDelete("transkrip")}
                  onPreview={() => setPreviewFile(lampiran.transkrip || null)}
                />
                <UploadField
                  field="lainnya"
                  label="7. Lainnya"
                  required={false}
                  file={lampiran.lainnya}
                  onUpload={(f) => handleUpload("lainnya", f)}
                  onDelete={() => handleDelete("lainnya")}
                  onPreview={() => setPreviewFile(lampiran.lainnya || null)}
                />
              </div>
              <div>
                <UploadField
                  field="beritaAcara"
                  label="2. Scan berita acara kelulusan"
                  required={true}
                  exampleImage="/CONTOH_BERITA.jpeg"
                  file={lampiran.beritaAcara}
                  onUpload={(f) => handleUpload("beritaAcara", f)}
                  onDelete={() => handleDelete("beritaAcara")}
                  onPreview={() => setPreviewFile(lampiran.beritaAcara || null)}
                />
                <UploadField
                  field="pasFoto"
                  label="4. Pas foto hitam putih/berwarna ukuran 4X6"
                  required={true}
                  exampleImage="/CONTOH_PASFOTO.jpeg"
                  file={lampiran.pasFoto}
                  onUpload={(f) => handleUpload("pasFoto", f)}
                  onDelete={() => handleDelete("pasFoto")}
                  onPreview={() => setPreviewFile(lampiran.pasFoto || null)}
                />
                <UploadField
                  field="buktiSubmit"
                  label="6. Bukti submit HKI/Nomor Urut"
                  required={true}
                  exampleImage="/CONTOH_HKI.jpeg"
                  file={lampiran.buktiSubmit}
                  onUpload={(f) => handleUpload("buktiSubmit", f)}
                  onDelete={() => handleDelete("buktiSubmit")}
                  onPreview={() => setPreviewFile(lampiran.buktiSubmit || null)}
                />
              </div>
            </div>
          </Card>

          <div style={{ marginTop: "32px", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "clamp(12px, 3vw, 16px)" }}>
            <Button
              size="large"
              style={{ borderRadius: "6px", padding: "0 32px" }}
              onClick={() => router.push('/mahasiswa/form/detail')}
            >
              Kembali
            </Button>
            <Space size="middle">
              {(!draftStatus || draftStatus === 'DRAFT') && (
                <Button
                  size="large"
                  style={{
                    borderRadius: "6px",
                    padding: "0 32px",
                    borderColor: "#1890ff",
                    color: "#1890ff"
                  }}
                  onClick={handleSaveDraft}
                >
                  Simpan Draft
                </Button>
              )}
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: "6px",
                  padding: "0 32px",
                  backgroundColor: "#1890ff"
                }}
                onClick={handleNext}
              >
                Lanjut
              </Button>
            </Space>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          open={!!previewFile}
          title="Preview File"
          footer={null}
          onCancel={() => setPreviewFile(null)}
          width={800}
          centered
        >
          {previewFile && (
            <>
              {/* If it has originFileObj (newly uploaded) */}
              {previewFile.originFileObj ? (
                previewFile.type === "application/pdf" ? (
                  <iframe
                    src={URL.createObjectURL(previewFile.originFileObj)}
                    style={{ width: "100%", height: "70vh", border: "none" }}
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(previewFile.originFileObj)}
                    alt={previewFile.name}
                    style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                  />
                )
              ) :
                /* If it has dataUrl or filePath (loaded from draft / existing) */
                ((previewFile as any).dataUrl || (previewFile as any).filePath) ? (
                  previewFile.type?.includes("pdf") ||
                    (previewFile as any).filePath?.includes(".pdf") ? (
                    <iframe
                      src={(previewFile as any).dataUrl || (previewFile as any).filePath}
                      style={{ width: "100%", height: "70vh", border: "none" }}
                    />
                  ) : (
                    <img
                      src={(previewFile as any).dataUrl || (previewFile as any).filePath}
                      alt={previewFile.name}
                      style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                    />
                  )
                ) : (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <ExclamationCircleOutlined style={{ fontSize: "48px", color: "#faad14", marginBottom: "16px" }} />
                    <Typography.Title level={4}>File tidak dapat dipratinjau</Typography.Title>
                    <Typography.Text type="secondary">
                      File ini diload dari draft sebagian dan data lengkapnya tidak tersedia di memori pratinjau. <br />
                      Silakan unggah ulang jika Anda ingin melihat isinya.
                    </Typography.Text>
                  </div>
                )}
            </>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}

export default function LampiranSKL() {
  return (
    <App>
      <LampiranContent />
    </App>
  );
}
