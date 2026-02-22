"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Space,
  Typography,
  Spin,
  App,
  ConfigProvider,
  Descriptions,
  Row,
  Col,
  Modal,
  Upload,
  Empty,
  Tabs,
} from "antd";
import idID from "antd/locale/id_ID";
import { EyeOutlined, FilePdfOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import ProgressStepper from '@/components/ProgressStepper';
import { UploadField } from '@/components/forms/UploadField';
import { pengajuanService } from '@/services/pengajuanService';
import { mahasiswaService, MahasiswaProfile } from '@/services/mahasiswaService';
import { sklService, CreateSklPengajuanData } from '@/services/sklService';
import { uploadService } from '@/services/uploadService';

const { Title, Text } = Typography;

interface MahasiswaData {
  nama: string;
  nim: string;
  email: string;
  departemen: string;
  prodi: string;
  tempatLahir: string;
  tanggalLahir: string;
  no_hp?: string;
  alamat?: string;
}

interface FileUpload {
  uid: string;
  name: string;
  size: number;
  type: string;
  originFileObj?: File;
  dataUrl?: string; // URL untuk preview (base64 atau MinIO URL)
  filePath?: string; // Path file di MinIO
  isExisting?: boolean; // Flag untuk file yang sudah ada (edit mode)
}

interface LampiranData {
  ktm?: FileUpload;
  beritaAcara?: FileUpload;
  ujianSarjana?: FileUpload;
  pasFoto?: FileUpload;
  transkrip?: FileUpload;
  buktiSubmit?: FileUpload;
  lainnya?: FileUpload;
}

interface DetailPengajuan {
  jenisSurat: string;
  tanggalLulus: string;
  ipk: string;
}

// Assuming DetailPengajuanData is the same as DetailPengajuan for now,
// or it's defined elsewhere. If not, this might cause a type error.
type DetailPengajuanData = DetailPengajuan;

function ReviewSuratContent() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [dataMahasiswa, setDataMahasiswa] = useState<MahasiswaData>();
  const [detailPengajuan, setDetailPengajuan] = useState<DetailPengajuanData>();
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [lampiran, setLampiran] = useState<LampiranData>({});
  const [previewFile, setPreviewFile] = useState<FileUpload | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureType, setSignatureType] = useState<'handwriting' | 'upload' | null>(null);
  const [signatureFile, setSignatureFile] = useState<FileUpload | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null); // Preview in modal only
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const steps = [
    { label: "Info Pengajuan", status: "completed" as const },
    { label: "Detail Pengajuan", status: "completed" as const },
    { label: "Lampiran", status: "completed" as const },
    { label: "Review & Ajukan", status: "active" as const },
  ];

  useEffect(() => {
    const getDataMahasiswa = async () => {
      try {
        // Fetch data dari API
        const profile = await mahasiswaService.getProfile();

        let baseData: MahasiswaData;
        if (profile) {
          baseData = {
            nama: profile.nama,
            nim: profile.nim,
            email: profile.email,
            departemen: profile.departemen,
            prodi: profile.programStudi,
            tempatLahir: profile.tempatLahir || "",
            tanggalLahir: profile.tanggalLahir
              ? new Date(profile.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : "",
            no_hp: profile.noHp || "",
            alamat: profile.alamat || "",
          };
        } else {
          // Fallback jika API gagal
          baseData = {
            nama: "",
            nim: "",
            email: "",
            departemen: "",
            prodi: "",
            tempatLahir: "",
            tanggalLahir: "",
            no_hp: "",
            alamat: "",
          };
        }

        // Merge dengan data draft dari localStorage
        const savedDataJson = localStorage.getItem("skl_data_diri");
        const savedDetailJson = localStorage.getItem("skl_detail_pengajuan");
        const isEditModeLocal = localStorage.getItem('skl_edit_mode') === 'true';

        // GUARD: Jika tidak ada data di localStorage DAN bukan mode edit dari URL, redirect ke dashboard
        // Ini mencegah user masuk ke halaman review tanpa mengisi langkah sebelumnya, 
        // atau kembali ke form setelah sukses submit (karena localStorage sudah dihapus)
        const urlParams = new URLSearchParams(window.location.search);
        const draftIdFromUrl = urlParams.get('draftId');

        if (!savedDataJson && !savedDetailJson && !draftIdFromUrl && !isEditModeLocal) {
          console.warn('Review page accessed without form data or edit mode. Redirecting to dashboard.');
          router.replace('/mahasiswa/dashboard');
          return;
        }

        // Initialize merged data with base profile data
        let mergedData: MahasiswaData = { ...baseData };

        // 1. If there's a draft ID (from URL or storage), load latest from DB
        const currentDraftId = draftIdFromUrl || localStorage.getItem('skl_draft_id');
        if (currentDraftId) {
          try {
            const draft = await sklService.getPengajuanDetail(currentDraftId);
            if (draft) {
              setDraftStatus(draft.status);
              mergedData = {
                ...mergedData,
                nama: draft.namaSementara || mergedData.nama,
                nim: draft.nimSementara || mergedData.nim,
                email: draft.emailSementara || mergedData.email,
                prodi: draft.prodiSementara || mergedData.prodi,
                departemen: draft.departemenSementara || mergedData.departemen,
                tempatLahir: draft.tempatLahirSementara || mergedData.tempatLahir,
                no_hp: draft.noHpSementara || mergedData.no_hp,
                alamat: draft.alamatSementara || mergedData.alamat,
              }
            }
          } catch (err) {
            console.error('Error loading draft for review:', err);
          }
        }

        // 2. Overwrite with localStorage edits (user's latest changes not yet in DB or just made)
        if (savedDataJson) {
          const savedData = JSON.parse(savedDataJson);
          mergedData = { ...mergedData, ...savedData };
        }

        setDataMahasiswa(mergedData);

        // Load detail pengajuan dari localStorage
        if (savedDetailJson) {
          try {
            const detailData = JSON.parse(savedDetailJson);
            setDetailPengajuan(detailData);
          } catch (e) {
            console.error("Failed to parse detail pengajuan:", e);
          }
        }

        // Load lampiran - first try window object (full data), fallback to localStorage (metadata)
        const savedLampiran = localStorage.getItem("skl_lampiran");
        if (typeof window !== 'undefined' && (window as any).__skl_lampiran_full__) {
          setLampiran((window as any).__skl_lampiran_full__);
        } else if (savedLampiran) {
          setLampiran(JSON.parse(savedLampiran));
        }

        // Load signature - priority: database > localStorage
        const isEditMode = localStorage.getItem('skl_edit_mode') === 'true';
        const editSourceId = localStorage.getItem('skl_edit_source_id');

        let signatureLoaded = false;

        if (isEditMode && editSourceId) {
          // If in edit mode, try to load signature from database first
          try {
            const pengajuanDetail = await sklService.getPengajuanDetail(editSourceId);
            if (pengajuanDetail?.tandatangan) {
              console.log('Loading signature from database:', pengajuanDetail.tandatangan);
              setSignature(pengajuanDetail.tandatangan);
              // Determine type from the signature format
              if (pengajuanDetail.tandatangan.startsWith('data:image')) {
                setSignatureType('handwriting');
              } else {
                setSignatureType('upload');
              }
              signatureLoaded = true;
            }
          } catch (err) {
            console.error('Failed to load signature from database:', err);
          }
        }

        // Fallback to localStorage if no signature from database
        if (!signatureLoaded) {
          const savedSignature = localStorage.getItem("skl_signature");
          if (savedSignature) {
            // Check if it's already a base64 string or JSON object
            try {
              const sigData = JSON.parse(savedSignature);
              setSignature(sigData.data || sigData);
              setSignatureType(sigData.type || 'upload');
            } catch {
              // If not JSON, it's a direct base64/URL string
              setSignature(savedSignature);
              setSignatureType('upload');
            }
          }
        }
      } catch (error) {
        message.error("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    getDataMahasiswa();
  }, [message]);

  const handleSubmit = async () => {
    if (!signature) {
      message.error("Mohon upload tanda tangan terlebih dahulu!");
      return;
    }

    // Show confirmation modal before submitting
    modal.confirm({
      title: 'Konfirmasi Pengajuan',
      icon: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />,
      content: (
        <div>
          <p>Pastikan semua informasi dan lampiran yang Anda unggah sudah <strong>benar dan valid</strong>.</p>
          <p>Setelah diajukan, data akan diproses oleh admin prodi.</p>
          <p style={{ marginTop: 12, color: '#ff4d4f' }}>
            <strong>Apakah Anda yakin ingin mengajukan surat ini?</strong>
          </p>
        </div>
      ),
      okText: 'Ya, Ajukan',
      cancelText: 'Periksa Kembali',
      centered: true,
      onOk: async () => {
        await processSubmit();
      },
    });
  };

  const processSubmit = async () => {
    try {
      setLoading(true);

      // Check if in edit mode - menggunakan draftId sebagai sumber kebenaran
      const draftId = localStorage.getItem('skl_draft_id');
      const isEditMode = !!draftId; // Jika ada draftId, berarti edit mode

      console.log('Submit mode:', isEditMode ? 'EDIT/UPDATE' : 'CREATE');
      console.log('Draft ID:', draftId);

      // Get mahasiswa profile from API
      const profile = await mahasiswaService.getProfile();

      if (!profile) {
        message.error("Sesi login tidak ditemukan. Silakan login kembali.");
        router.push('/auth/login');
        return;
      }

      // Get all form data from localStorage
      const dataDiriStr = localStorage.getItem("skl_data_diri");
      const dataDiri = dataDiriStr ? JSON.parse(dataDiriStr) : {};

      const detailPengajuan = localStorage.getItem("skl_detail_pengajuan");
      const detail = detailPengajuan ? JSON.parse(detailPengajuan) : {};

      // TIDAK update profile mahasiswa - data disimpan di field *Sementara di pengajuan
      // Field sementara akan digunakan untuk tampilan di surat tanpa mengubah database pusat

      console.log('Creating pengajuan with profile:', profile);
      console.log('Detail pengajuan:', detail);

      // Formatter untuk mendapatkan YYYY-MM-DD lokal
      const toLocalISO = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      // Prepare temporary identity data from form (data yang sudah diisi mahasiswa)
      // Selalu kirim data dari form, karena ini yang akan tampil di surat
      const namaSementara = dataDiri.nama || profile.nama;
      const nimSementara = dataDiri.nim || profile.nim;
      const emailSementara = dataDiri.email || profile.email;
      const prodiSementara = dataDiri.prodi || profile.programStudi || '';
      const departemenSementara = dataDiri.departemen || profile.departemen || '';
      const noHpSementara = dataDiri.no_hp || profile.noHp;
      const alamatSementara = dataDiri.alamat || profile.alamat || undefined;
      const tempatLahirSementara = dataDiri.tempatLahir || profile.tempatLahir || undefined;

      // Convert tanggalLahir secara aman ke YYYY-MM-DD lokal
      let tanggalLahirSementara: string | undefined = undefined;
      if (dataDiri.tanggalLahir) {
        try {
          const rawDate = dataDiri.tanggalLahir;

          // Case 1: DD/MM/YYYY (dari DatePicker AntD)
          if (typeof rawDate === 'string' && rawDate.includes('/')) {
            const parts = rawDate.split('/');
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2];
              tanggalLahirSementara = `${year}-${month}-${day}`;
            }
          }
          // Case 2: ISO String (dari stringify dayjs) atau format Date
          else {
            const dateObj = new Date(rawDate);
            if (!isNaN(dateObj.getTime())) {
              tanggalLahirSementara = toLocalISO(dateObj);
            }
          }

          // Case 3: Fallback human readable (jika masih gagal)
          if (!tanggalLahirSementara && typeof rawDate === 'string' && rawDate.includes(' ')) {
            const parts = rawDate.split(' ');
            if (parts.length === 3) {
              const months: { [key: string]: string } = {
                'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
                'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
                'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
              };
              const day = parts[0].padStart(2, '0');
              const month = months[parts[1]];
              const year = parts[2];
              if (month) {
                tanggalLahirSementara = `${year}-${month}-${day}`;
              }
            }
          }

          console.log('Parsed tanggalLahirSementara:', tanggalLahirSementara);
        } catch (e) {
          console.warn('Failed to parse tanggalLahir:', e);
        }
      }

      if (!tanggalLahirSementara && profile.tanggalLahir) {
        tanggalLahirSementara = toLocalISO(new Date(profile.tanggalLahir));
      }

      // Safe date formatting for graduation date
      const safeTglLulus = detail.tanggalLulus
        ? toLocalISO(new Date(detail.tanggalLulus))
        : toLocalISO(new Date());

      // Upload signature to MinIO if available and it's a new signature (base64)
      let signatureUrl: string | undefined = signature || undefined;
      if (signature && signature.startsWith('data:image')) {
        try {
          // Convert base64 to blob
          const base64Response = await fetch(signature);
          const blob = await base64Response.blob();
          const signatureFile = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });

          // Upload to MinIO
          const uploadResult = await uploadService.uploadFile(signatureFile, 'signature');
          if (uploadResult) {
            signatureUrl = uploadResult.url;
            console.log('Signature uploaded to MinIO:', uploadResult.url);

            // Save uploaded URL to localStorage for persistence
            localStorage.setItem(
              "skl_signature",
              JSON.stringify({
                data: uploadResult.url,
                type: signatureType,
              })
            );
          }
        } catch (err) {
          console.error('Failed to upload signature:', err);
          message.warning('Gagal mengupload tandatangan, tetapi pengajuan akan tetap diproses');
        }
      } else if (signature && !signature.startsWith('data:image')) {
        // If signature is already a URL (from previous upload), use it directly
        signatureUrl = signature;
      }

      let pengajuanResult: any;

      if (isEditMode && draftId) {
        // UPDATE existing pengajuan - surat yang sama, tidak membuat baru
        console.log('Edit mode: Updating existing pengajuan', draftId);

        // Update data pengajuan dengan data terbaru dari form
        const updateData: any = {
          tglLulus: safeTglLulus,
          ipkTerakhir: parseFloat(detail.ipk) || 0,
          jumlahSks: parseInt(detail.jumlahSks) || 0,
          namaSementara,
          nimSementara,
          emailSementara,
          prodiSementara,
          departemenSementara,
          noHpSementara,
          alamatSementara,
          tempatLahirSementara,
          tanggalLahirSementara,
          tandatangan: signatureUrl,
        };

        pengajuanResult = await sklService.updatePengajuan(draftId, updateData);

        if (!pengajuanResult) {
          throw new Error('Gagal memperbarui pengajuan');
        }

        console.log('Pengajuan updated:', pengajuanResult);

        // Reset status to SUBMITTED for re-verification after revision
        await sklService.submitPengajuan(draftId, profile.userId);
        console.log('Status reset to SUBMITTED for re-verification');
      } else {
        // CREATE new pengajuan
        console.log('Create mode: Creating new pengajuan');

        const pengajuanData: CreateSklPengajuanData = {
          mahasiswaId: profile.id,
          tglLulus: safeTglLulus,
          ipkTerakhir: parseFloat(detail.ipk) || 0,
          jumlahSks: parseInt(detail.jumlahSks) || 0,
          namaSementara,
          nimSementara,
          emailSementara,
          prodiSementara,
          departemenSementara,
          noHpSementara,
          alamatSementara,
          tempatLahirSementara,
          tanggalLahirSementara,
          tandatangan: signatureUrl,
        };

        pengajuanResult = await sklService.createPengajuan(pengajuanData);

        if (!pengajuanResult) {
          throw new Error('Gagal membuat pengajuan');
        }

        console.log('New pengajuan created:', pengajuanResult);

        // Submit pengajuan (change status to SUBMITTED)
        await sklService.submitPengajuan(pengajuanResult.id, profile.userId);
      }

      // Upload lampiran files to MinIO and save to database
      const lampiranToSave = typeof window !== 'undefined' && (window as any).__skl_lampiran_full__
        ? (window as any).__skl_lampiran_full__
        : lampiran;

      console.log('Lampiran data to upload:', lampiranToSave);
      console.log('Window lampiran full:', (window as any).__skl_lampiran_full__);
      console.log('LocalStorage lampiran:', lampiran);

      // Map lampiran to upload
      const lampiranMap: { [key: string]: { file: FileUpload, jenis: string } } = {
        ktm: { file: lampiranToSave.ktm, jenis: 'KTM' },
        transkrip: { file: lampiranToSave.transkrip, jenis: 'TRANSKRIP_NILAI' },
        beritaAcara: { file: lampiranToSave.beritaAcara, jenis: 'BERITA_ACARA_UJIAN' },
        ujianSarjana: { file: lampiranToSave.ujianSarjana, jenis: 'BEBAS_PUSTAKA' },
        pasFoto: { file: lampiranToSave.pasFoto, jenis: 'PAS_FOTO' },
        buktiSubmit: { file: lampiranToSave.buktiSubmit, jenis: 'BUKTI_SUBMIT' },
        lainnya: { file: lampiranToSave.lainnya, jenis: 'LAINNYA' },
      };

      // 1. Sync deletions if in edit mode
      if (isEditMode && draftId) {
        try {
          console.log('Syncing deleted lampiran...');
          const currentPengajuan = await sklService.getPengajuanDetail(draftId);
          if (currentPengajuan && currentPengajuan.lampiran) {
            const currentJenisList = currentPengajuan.lampiran.map(l => l.jenisDokumen);

            // Get list of jenis currently in the state
            const targetJenisList = Object.values(lampiranMap)
              .filter(item => !!item.file)
              .map(item => item.jenis);

            // Find kinds that exist on server but NOT in state
            const deletedKinds = currentJenisList.filter(kind => !targetJenisList.includes(kind));

            for (const kindToDel of deletedKinds) {
              console.log(`Deleting removed lampiran from server: ${kindToDel}`);
              await sklService.deleteLampiranByCategory(draftId, kindToDel);
            }
          }
        } catch (err) {
          console.error('Failed to sync deleted lampiran:', err);
        }
      }

      // 2. Upload each lampiran file and save to database
      let uploadedCount = 0;
      let failedCount = 0;
      let skippedCount = 0;

      for (const [key, { file, jenis }] of Object.entries(lampiranMap)) {
        console.log(`Processing ${key} (${jenis}):`, file);

        // Skip if file is from existing pengajuan (edit mode)
        // File yang sudah ada tidak perlu di-upload ulang
        if (file && (file as any).isExisting) {
          console.log(`Skipping ${key} - existing file from previous submission`);
          skippedCount++;
          continue;
        }

        if (file && file.originFileObj) {
          try {
            console.log(`Uploading ${jenis} to MinIO...`);
            // Upload file to MinIO
            const uploadResult = await uploadService.uploadFile(file.originFileObj, 'lampiran');

            if (uploadResult) {
              console.log(`Upload successful for ${jenis}:`, uploadResult);
              // Save lampiran reference to database
              await sklService.addLampiran(pengajuanResult.id, {
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
        } else {
          console.log(`Skipping ${key} - no file attached`);
        }
      }

      console.log(`Upload summary: ${uploadedCount} successful, ${failedCount} failed, ${skippedCount || 0} skipped (existing)`);

      // Clear localStorage and window data after successful submission
      localStorage.removeItem("skl_data_diri");
      localStorage.removeItem("skl_detail_pengajuan");
      localStorage.removeItem("skl_lampiran");
      localStorage.removeItem("skl_signature");
      localStorage.removeItem("skl_draft_id");
      // Clear edit mode flags (jika ada)
      localStorage.removeItem("skl_edit_mode");
      localStorage.removeItem("skl_edit_source_id");
      if (typeof window !== 'undefined') {
        delete (window as any).__skl_lampiran_full__;
      }

      if (isEditMode && draftId) {
        if (uploadedCount > 0) {
          message.success(`Surat berhasil diperbarui (ID: ${draftId.substring(0, 8)}...) dengan ${uploadedCount} lampiran baru! Status kembali ke 'Menunggu Verifikasi'.`);
        } else {
          message.success(`Surat berhasil diperbarui (ID tetap sama: ${draftId.substring(0, 8)}...)! Status kembali ke 'Menunggu Verifikasi'.`);
        }
      } else {
        if (uploadedCount > 0) {
          message.success(`Surat berhasil diajukan dengan ${uploadedCount} lampiran!`);
        } else {
          message.warning("Surat berhasil diajukan tapi tidak ada lampiran yang terupload. Pastikan file sudah dipilih.");
        }
      }

      // Redirect to detail tracking page using replace to prevent back-button re-entry
      router.replace(`/mahasiswa/detail?id=${pengajuanResult.id}`);
    } catch (error) {
      console.error('Submit error:', error);
      message.error("Gagal mengajukan surat.");
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isEmpty = !canvas
      .getContext("2d")
      ?.getImageData(0, 0, canvas.width, canvas.height)
      .data.some((byte) => byte !== 0);

    if (isEmpty) {
      message.error("Mohon berikan tanda tangan terlebih dahulu.");
      return;
    }

    setSignature(canvas.toDataURL("image/png"));
    setSignatureType("handwriting");
  };

  const allFiles = [
    { name: "1. Kartu Tanda Mahasiswa (KTM)", file: lampiran.ktm },
    { name: "2. Scan berita acara kelulusan", file: lampiran.beritaAcara },
    { name: "3. Scan berita acara ujian sarjana", file: lampiran.ujianSarjana },
    { name: "4. Pas foto hitam putih/berwarna ukuran 4X6", file: lampiran.pasFoto },
    { name: "5. Transkrip akademik terbaik ditandatangani dekan", file: lampiran.transkrip },
    { name: "6. Bukti submit HKI/Nomor Urut", file: lampiran.buktiSubmit },
    { name: "7. Lainnya", file: lampiran.lainnya },
  ];

  if (loading) {
    return (
      <Spin size="large" tip="Memuat Data..." fullscreen />
    );
  }

  return (
    <ConfigProvider locale={idID}>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <div style={{ margin: "0 auto", width: "100%", maxWidth: "1200px", padding: "24px 48px" }}>
          <div style={{ marginBottom: "32px" }}>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: "#262626" }}>
              Review Surat
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Mohon periksa kembali seluruh data yang telah Anda masukkan sebelum mengajukan surat.
            </Text>
          </div>

          <div style={{ marginBottom: "40px", padding: "32px", borderRadius: "8px" }}>
            <ProgressStepper steps={steps} />
          </div>

          {/* 3 Column Layout */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            {/* Left Column - Identitas */}
            <Col xs={24} md={8}>
              <Card
                title="Identitas Pengaju"
                variant="borderless"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  height: "600px",
                }}
                styles={{
                  body: {
                    overflow: "auto",
                    maxHeight: "540px",
                  }
                }}
              >
                <Descriptions
                  column={1}
                  size="small"
                  colon={false}
                  styles={{
                    label: { width: 140, color: "#666", fontWeight: 500, fontSize: 14 },
                    content: { fontSize: 14, color: "#262626", paddingBottom: 20 }
                  }}
                >
                  <Descriptions.Item label="Nama Lengkap">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.nama}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="NIM/NIP">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.nim}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.email}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Departemen">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.departemen}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Program Studi">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.prodi}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tempat Lahir">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.tempatLahir}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tanggal Lahir">
                    <span style={{ color: "#262626" }}>
                      {dataMahasiswa?.tanggalLahir
                        ? (new Date(dataMahasiswa.tanggalLahir).toString() !== 'Invalid Date'
                          ? new Date(dataMahasiswa.tanggalLahir).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                          : dataMahasiswa.tanggalLahir)
                        : '-'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="No HP">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.no_hp}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Alamat">
                    <span style={{ color: "#262626" }}>{dataMahasiswa?.alamat}</span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Middle Column - Detail Pengajuan */}
            <Col xs={24} md={8}>
              <Card
                title="Detail Pengajuan"
                variant="borderless"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  height: "600px",
                }}
                styles={{
                  body: {
                    overflow: "auto",
                    maxHeight: "540px",
                  }
                }}
              >
                {detailPengajuan ? (
                  <Descriptions
                    column={1}
                    size="small"
                    colon={false}
                    styles={{
                      label: { width: 140, color: "#666", fontWeight: 500, fontSize: 14 },
                      content: { fontSize: 14, color: "#262626", paddingBottom: 20 }
                    }}
                  >
                    <Descriptions.Item label="Jenis Surat">
                      <span style={{ color: "#262626" }}>{detailPengajuan.jenisSurat || '-'}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tanggal Lulus">
                      <span style={{ color: "#262626" }}>
                        {detailPengajuan.tanggalLulus
                          ? new Date(detailPengajuan.tanggalLulus).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                          : '-'
                        }
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="IPK">
                      <span style={{ color: "#262626" }}>{detailPengajuan.ipk || '-'}</span>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty
                    description="Belum ada detail pengajuan"
                    style={{ marginTop: 20 }}
                  />
                )}
              </Card>
            </Col>

            {/* Right Column - Lampiran */}
            <Col xs={24} md={8}>
              <Card
                title="Lampiran"
                variant="borderless"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  height: "600px",
                }}
                styles={{
                  body: {
                    overflow: "auto",
                    maxHeight: "540px",
                  }
                }}
              >
                {allFiles.length === 0 ? (
                  <Empty description="Tidak ada lampiran" style={{ marginTop: 20 }} />
                ) : (
                  <div>
                    {allFiles.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        {item.file ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 12px",
                              border: "1px solid #f0f0f0",
                              borderRadius: 6,
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <FilePdfOutlined style={{ fontSize: 16, color: "#ff4d4f" }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: "#262626" }}>
                                {item.name}
                              </div>
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => item.file && setPreviewFile(item.file)}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px 12px",
                              border: "1px dashed #d9d9d9",
                              borderRadius: 6,
                              backgroundColor: "#fafafa",
                              color: "#8c8c8c",
                              fontSize: 12,
                            }}
                          >
                            {item.name} - Belum diupload
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Tanda Tangan Section */}
          <Card
            title="Tanda Tangan"
            variant="borderless"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: 24,
            }}
          >
            {!signature ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Button
                  size="large"
                  style={{
                    borderRadius: 6,
                    height: 48,
                    backgroundColor: "#1890ff",
                    color: "white",
                  }}
                  onClick={() => {
                    setSignatureType("handwriting");
                    setSignatureModalOpen(true);
                  }}
                >
                  Handwriting
                </Button>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    borderRadius: 6,
                    height: 48,
                    backgroundColor: "#1890ff",
                  }}
                  onClick={() => {
                    setSignatureType("upload");
                    setSignatureModalOpen(true);
                  }}
                >
                  Upload Tandatangan
                </Button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={signature}
                    alt="signature"
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                </div>
                <Button
                  danger
                  onClick={() => {
                    setSignature(null);
                    setSignatureType(null);
                  }}
                >
                  Hapus Tanda Tangan
                </Button>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              size="large"
              style={{ borderRadius: "6px", padding: "0 32px" }}
              onClick={() => router.push('/mahasiswa/form/lampiran')}
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
                    color: "#1890ff",
                  }}
                  onClick={() => {
                    localStorage.setItem("skl_lampiran", JSON.stringify(lampiran));
                    message.success("Draft berhasil disimpan!");
                  }}
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
                  backgroundColor: "#1890ff",
                }}
                onClick={handleSubmit}
              >
                {(!draftStatus || draftStatus === 'DRAFT') ? 'Ajukan Surat' : 'Simpan Perubahan'}
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
            previewFile.dataUrl ? (
              previewFile.type === "application/pdf" ? (
                <iframe
                  src={previewFile.dataUrl}
                  style={{ width: "100%", height: "70vh", border: "none" }}
                />
              ) : (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
              )
            ) : previewFile.originFileObj ? (
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
            ) : (
              <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                File tidak dapat ditampilkan
              </div>
            )
          )}
        </Modal>

        {/* Signature Modal */}
        <Modal
          open={signatureModalOpen}
          title={signatureType === "handwriting" ? "Buat Tanda Tangan" : "Upload Tanda Tangan"}
          okText="Simpan"
          cancelText="Batal"
          onOk={() => {
            if (signatureType === "handwriting") {
              saveHandwriting();
            }
            // For upload type, use uploadPreview if available
            const finalSignature = signatureType === "upload" && uploadPreview ? uploadPreview : signature;

            if (finalSignature) {
              setSignature(finalSignature); // Save to main signature state
              localStorage.setItem(
                "skl_signature",
                JSON.stringify({
                  data: finalSignature,
                  type: signatureType,
                })
              );
              message.success("Tanda tangan berhasil disimpan!");
            }
            // Tutup modal setelah simpan
            setSignatureModalOpen(false);
            setSignatureType(null);
            setUploadPreview(null); // Clear preview
          }}
          onCancel={() => {
            setSignatureModalOpen(false);
            setSignatureType(null);
            setUploadPreview(null); // Clear preview
            clearCanvas();
          }}
          width={signatureType === "handwriting" ? 700 : 600}
          centered
        >
          {signatureType === "handwriting" ? (
            <div>
              <div style={{ marginBottom: 16, textAlign: "center", color: "#666" }}>
                Silakan menandatangani di area bawah ini
              </div>
              <canvas
                ref={canvasRef}
                width={600}
                height={250}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  border: "2px solid #d9d9d9",
                  borderRadius: 6,
                  cursor: "crosshair",
                  display: "block",
                  margin: "0 auto",
                  backgroundColor: "#fafafa",
                }}
              />
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Button onClick={clearCanvas} style={{ marginRight: 8 }}>
                  Bersihkan
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div style={{ marginBottom: 16 }}>
                <Upload
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setSignatureFile({
                        uid: Date.now().toString(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        originFileObj: file,
                      });
                      setUploadPreview(e.target?.result as string); // Set preview only, not main signature
                    };
                    reader.readAsDataURL(file);
                    return false;
                  }}
                  showUploadList={false}
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                >
                  {!uploadPreview ? (
                    <div
                      style={{
                        border: "2px dashed #d9d9d9",
                        borderRadius: 8,
                        padding: "20px",
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#fafafa",
                        transition: "all 0.3s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#1890ff";
                        e.currentTarget.style.backgroundColor = "#f0f5ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.backgroundColor = "#fafafa";
                      }}
                    >
                      <FilePdfOutlined style={{ fontSize: 28, color: "#bfbfbf", marginBottom: 8 }} />
                      <div style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>
                        Seret & lepas atau <span style={{ textDecoration: "underline" }}>pilih file</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
                        untuk diunggah
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: 8, marginBottom: 16 }}
                      />
                      <div style={{ color: "#52c41a", marginBottom: 8, fontSize: 14 }}>
                        ✓ File berhasil dipilih
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); setUploadPreview(null); }} size="small">
                        Ganti File
                      </Button>
                    </div>
                  )}
                </Upload>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}

export default function ReviewSurat() {
  return (
    <App>
      <ReviewSuratContent />
    </App>
  );
}
