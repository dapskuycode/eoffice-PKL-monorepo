"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Space,
  Typography,
  Spin,
  ConfigProvider,
  App,
} from "antd";
import idID from "antd/locale/id_ID";
import { ProFormInstance } from "@ant-design/pro-components";
import { mahasiswaService } from '@/services/mahasiswaService';
import { sklService } from '@/services/sklService';

import ProgressStepper from '@/components/ProgressStepper';
import FormDataDiri, { MahasiswaData } from '@/components/forms/FormDataDiri';

const { Title, Text } = Typography;

// --- HALAMAN UTAMA ---
function DataDiriSKLContent() {
  const router = useRouter();
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataMahasiswa, setDataMahasiswa] = useState<MahasiswaData>();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editSourceId, setEditSourceId] = useState<string | null>(null);

  const steps = [
    { label: "Info Pengajuan", status: "active" as const },
    { label: "Detail Pengajuan", status: "upcoming" as const },
    { label: "Lampiran", status: "upcoming" as const },
    { label: "Review & Ajukan", status: "upcoming" as const },
  ];

  // --- FETCH DATA & CEK LOCAL STORAGE ---
  useEffect(() => {
    const getDataMahasiswa = async () => {
      setLoading(true);
      try {
        // Check if in edit mode
        const editMode = localStorage.getItem('skl_edit_mode') === 'true';
        const sourceId = localStorage.getItem('skl_edit_source_id');
        setIsEditMode(editMode);
        setEditSourceId(sourceId);

        if (editMode && sourceId) {
          message.info(`Mode Edit: Anda sedang mengedit surat (ID: ${sourceId}). Setelah submit akan membuat pengajuan baru.`, 5);
        }

        // Check if editing existing draft from URL
        const urlParams = new URLSearchParams(window.location.search);
        const draftIdFromUrl = urlParams.get('draftId');
        const draftIdFromStorage = localStorage.getItem('skl_draft_id');
        const currentDraftId = draftIdFromUrl || draftIdFromStorage;

        // Fetch data mahasiswa dari API
        const profile = await mahasiswaService.getProfile();

        if (!profile) {
          message.error("Gagal mengambil data mahasiswa. Silakan login kembali.");
          router.push('/auth/login?returnUrl=/mahasiswa/form/dataDiri');
          return;
        }

        // Data dari database
        const userData: MahasiswaData = {
          nama: profile.nama,
          role: "Mahasiswa",
          nim: profile.nim,
          email: profile.email,
          departemen: profile.departemen,
          prodi: profile.programStudi,
          tempatLahir: profile.tempatLahir || "",
          tanggalLahir: profile.tanggalLahir
            ? new Date(profile.tanggalLahir).toISOString().split('T')[0]
            : "",
          no_hp: profile.noHp || "",
          alamat: profile.alamat || "",
        };

        // If there's a draft ID, load draft from database
        if (currentDraftId) {
          try {
            const draft = await sklService.getPengajuanDetail(currentDraftId);
            // Load data untuk DRAFT atau REVISI
            if (draft && (draft.status === 'DRAFT' || draft.status === 'REVISI')) {
              setDraftId(currentDraftId);
              let draftDataMerged = {
                ...userData,
                nama: draft.namaSementara || userData.nama,
                email: draft.emailSementara || userData.email,
                nim: draft.nimSementara || userData.nim,
                prodi: draft.prodiSementara || userData.prodi,
                departemen: draft.departemenSementara || userData.departemen,
                tempatLahir: draft.tempatLahirSementara || userData.tempatLahir,
                tanggalLahir: draft.tanggalLahirSementara
                  ? new Date(draft.tanggalLahirSementara).toISOString().split('T')[0]
                  : userData.tanggalLahir,
                no_hp: draft.noHpSementara || userData.no_hp,
                alamat: draft.alamatSementara || userData.alamat,
              };

              // Merge dengan localStorage agar perubahan pada NIM dan field lain yang tidak tersimpan di backend tetap dipertahankan
              const savedDraftStr = localStorage.getItem("skl_data_diri");
              if (savedDraftStr) {
                try {
                  const localDraft = JSON.parse(savedDraftStr) as MahasiswaData;
                  draftDataMerged = {
                    ...draftDataMerged,
                    nama: localDraft.nama || draftDataMerged.nama,
                    email: localDraft.email || draftDataMerged.email,
                    nim: localDraft.nim || draftDataMerged.nim,
                    role: localDraft.role || draftDataMerged.role,
                    departemen: localDraft.departemen || draftDataMerged.departemen,
                    prodi: localDraft.prodi || draftDataMerged.prodi,
                    tempatLahir: localDraft.tempatLahir || draftDataMerged.tempatLahir,
                    tanggalLahir: localDraft.tanggalLahir || draftDataMerged.tanggalLahir,
                    no_hp: localDraft.no_hp || draftDataMerged.no_hp,
                    alamat: localDraft.alamat || draftDataMerged.alamat,
                  };
                } catch (e) {
                  // ignore
                }
              }

              setDataMahasiswa(draftDataMerged);
              return;
            }
          } catch (error) {
            console.error('Error loading draft:', error);
          }
        }

        // Cek localStorage untuk draft atau edit mode
        const savedDraft = localStorage.getItem("skl_data_diri");
        if (savedDraft) {
          try {
            const draftData = JSON.parse(savedDraft) as MahasiswaData;
            console.log('Loading saved draft from localStorage:', draftData);
            // Merge: semua field dari draft (termasuk nama dan email untuk edit mode)
            setDataMahasiswa({
              ...userData,
              nama: draftData.nama || userData.nama,
              email: draftData.email || userData.email,
              nim: draftData.nim || userData.nim,
              role: draftData.role || userData.role,
              departemen: draftData.departemen || userData.departemen,
              prodi: draftData.prodi || userData.prodi,
              tempatLahir: draftData.tempatLahir || userData.tempatLahir,
              tanggalLahir: draftData.tanggalLahir || userData.tanggalLahir,
              no_hp: draftData.no_hp || userData.no_hp,
              alamat: draftData.alamat || userData.alamat,
            });
          } catch (e) {
            console.error('Error parsing saved draft:', e);
            setDataMahasiswa(userData);
          }
        } else {
          setDataMahasiswa(userData);
        }

      } catch (error) {
        message.error("Gagal mengambil data mahasiswa.");
      } finally {
        setLoading(false);
      }
    };
    getDataMahasiswa();
  }, [message, router]);

  // --- HANDLE SIMPAN DRAFT ---
  const handleSaveDraft = async () => {
    try {
      console.log('Starting save draft...');
      // Validasi form
      await formRef.current?.validateFields();
      const values = formRef.current?.getFieldsValue() as MahasiswaData;

      console.log('Form values:', values);

      // Simpan ke localStorage
      localStorage.setItem("skl_data_diri", JSON.stringify(values));

      // Simpan ke database sebagai draft
      const profile = await mahasiswaService.getProfile();
      if (!profile) {
        message.error("Gagal mengambil data mahasiswa");
        return;
      }

      console.log('Profile loaded:', profile);

      const draftData = {
        id: draftId || undefined,
        mahasiswaId: profile.id,
        namaSementara: values.nama,
        nimSementara: values.nim,
        emailSementara: values.email,
        prodiSementara: values.prodi,
        departemenSementara: values.departemen,
        noHpSementara: values.no_hp,
        alamatSementara: values.alamat,
        tempatLahirSementara: values.tempatLahir,
        tanggalLahirSementara: values.tanggalLahir,
        draftStep: 1,
      };

      console.log('Saving draft with data:', draftData);
      const savedDraft = await sklService.saveDraft(draftData);
      console.log('Draft saved result:', savedDraft);

      if (savedDraft) {
        setDraftId(savedDraft.id);
        localStorage.setItem("skl_draft_id", savedDraft.id);
        message.success("Draft berhasil disimpan!");
        console.log('Draft ID saved:', savedDraft.id);
      }

      setDataMahasiswa(values);
    } catch (error) {
      console.error('Error saving draft:', error);
      message.error("Gagal menyimpan draft. Silakan coba lagi.");
    }
  };

  // --- HANDLE NEXT (VALIDASI & SIMPAN DATA SEBELUM PINDAH) ---
  const handleNext = async () => {
    try {
      // Validasi form
      await formRef.current?.validateFields();
      const values = formRef.current?.getFieldsValue() as MahasiswaData;

      if (!values) {
        message.error("Data mahasiswa tidak tersedia.");
        return;
      }

      // Simpan data ke LocalStorage
      localStorage.setItem("skl_data_diri", JSON.stringify(values));

      // Pindah ke halaman berikutnya
      router.push("/mahasiswa/form/detail");
    } catch (error) {
      message.error("Mohon lengkapi semua field yang wajib diisi.");
    }
  };

  if (loading) {
    return (
      <Spin size="large" description="Memuat Data..." fullscreen />
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>

      <div style={{ backgroundColor: "#fff", padding: "12px 48px", fontSize: "14px", color: "#666" }}>
        <span>Form Pengajuan Surat</span> / <span>PKL</span> / <span style={{ color: "#000" }}>Identitas Pemohon</span>
      </div>

      <div style={{ margin: "0 auto", width: "100%", maxWidth: "1200px", padding: "24px 48px" }}>

        {/* Edit Mode Badge */}
        {isEditMode && editSourceId && (
          <div style={{
            marginBottom: "24px",
            padding: "12px 24px",
            backgroundColor: "#fff7e6",
            border: "1px solid #ffd666",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "20px" }}>✏️</span>
            <div>
              <Text strong style={{ color: "#d46b08", fontSize: "16px" }}>Mode Edit</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Anda sedang mengedit surat (ID: {editSourceId}). Setelah submit, data akan diperbarui dan status kembali ke 'Menunggu Verifikasi'.
              </Text>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "32px" }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: "#262626" }}>
            Identitas Pemohon
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Data berikut diambil dari profil Anda. Silakan lengkapi atau perbarui data yang diperlukan sebelum melanjutkan.
          </Text>
        </div>

        <div style={{ marginBottom: "40px", padding: "32px", borderRadius: "8px" }}>
          <ProgressStepper steps={steps} />
        </div>

        <FormDataDiri
          formRef={formRef}
          initialValues={dataMahasiswa}
        />

        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            size="large"
            style={{ borderRadius: "6px", padding: "0 32px" }}
            onClick={() => router.push('/mahasiswa/dashboard')}
          >
            Kembali ke Dashboard
          </Button>

          <Space size={16}>
            <Button
              size="large"
              style={{
                borderRadius: "6px",
                fontWeight: 600
              }}
              onClick={handleSaveDraft}
            >
              Simpan Draft
            </Button>
            <Button
              type="primary"
              size="large"
              style={{
                borderRadius: "6px",
                padding: "0 32px",
                fontWeight: 600,
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
              }}
              onClick={handleNext}
            >
              Lanjut ke Detail Pengajuan
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}

export default function DataDiriSKL() {
  return (
    <ConfigProvider locale={idID}>
      <App>
        <DataDiriSKLContent />
      </App>
    </ConfigProvider>
  );
}