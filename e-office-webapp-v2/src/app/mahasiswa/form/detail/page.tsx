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
  Col,
  ConfigProvider,
  Modal,
} from "antd";
import idID from "antd/locale/id_ID";
import {
  ProForm,
  ProFormText,
  ProFormDatePicker,
  ProFormInstance,
} from "@ant-design/pro-components";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import ProgressStepper from '@/components/ProgressStepper';
import { mahasiswaService } from '@/services/mahasiswaService';
import { sklService } from '@/services/sklService';

const { Title, Text } = Typography;

// --- 1. TIPE DATA ---
interface DetailData {
  jenisSurat: string;
  tanggalLulus: string;
  ipk: string;
  jumlahSks: string;
}

// --- 2. KOMPONEN FORM ---
const FormDetailPengajuan: React.FC<{
  formRef: React.RefObject<ProFormInstance | null>;
  initialValues?: DetailData;
}> = ({ formRef, initialValues }) => {
  return (
    <Card
      variant="borderless"
      className="shadow-sm rounded-xl"
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <Title level={5} style={{ marginBottom: 24, color: "#262626" }}>KEPERLUAN</Title>
      <ProForm<DetailData>
        formRef={formRef}
        submitter={false}
        layout="vertical"
        grid={true}
        initialValues={initialValues}
        rowProps={{
          gutter: [48, 16],
        }}
      >
        <Col span={24} md={12}>
          <ProFormText
            name="jenisSurat"
            label="Jenis Surat"
            disabled
            fieldProps={{ variant: "filled", className: "font-semibold text-gray-800" }}
          />
        </Col>
        <Col span={24} md={12}>
          <ProFormDatePicker
            name="tanggalLulus"
            label="Tanggal Lulus"
            placeholder="Pilih tanggal lulus"
            rules={[{ required: true, message: "Wajib diisi" }]}
            fieldProps={{
              format: "DD/MM/YYYY",
              className: "w-full",
              size: "large",
            }}
          />
        </Col>
        <Col span={24} md={12}>
          <ProFormText
            name="ipk"
            label="IPK"
            placeholder="Masukkan IPK (Rentang: 2.00 - 4.00)"
            rules={[
              { required: true, message: "Wajib diisi" },
              {
                pattern: /^(?:[0-3](?:\.\d{1,2})?|4(?:\.0{1,2})?)$/,
                message: "IPK harus dalam format desimal antara 0.00 sampai 4.00",
              },
            ]}
            fieldProps={{ size: "large", style: { backgroundColor: "white", borderColor: "#d9d9d9" } }}
          />
        </Col>
        <Col span={24} md={12}>
          <ProFormText
            name="jumlahSks"
            label="Jumlah SKS"
            placeholder="Masukkan jumlah SKS (contoh: 144)"
            rules={[
              { required: true, message: "Wajib diisi" },
              {
                pattern: /^\d{2,3}$/,
                message: "SKS harus berupa angka (contoh: 144)",
              },
            ]}
            fieldProps={{ size: "large", style: { backgroundColor: "white", borderColor: "#d9d9d9" } }}
          />
        </Col>
      </ProForm>
    </Card>
  );
};

// --- 3. HALAMAN UTAMA ---
function DetailContent() {
  const router = useRouter();
  const formRef = useRef<ProFormInstance>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailData, setDetailData] = useState<DetailData>();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const { message, modal } = App.useApp();

  const steps = [
    { label: "Info Pengajuan", status: "completed" as const },
    { label: "Detail Pengajuan", status: "active" as const },
    { label: "Lampiran", status: "upcoming" as const },
    { label: "Review & Ajukan", status: "upcoming" as const },
  ];

  // --- FETCH DATA & CEK LOCAL STORAGE ---
  useEffect(() => {
    const getDetailData = async () => {
      setLoading(true);
      try {
        // Guard: Cek apakah langkah sebelumnya sudah diisi
        const dataDiri = localStorage.getItem("skl_data_diri");
        const isEditMode = localStorage.getItem('skl_edit_mode') === 'true';
        if (!dataDiri && !isEditMode) {
          console.warn('Detail page accessed without data diri. Redirecting to dashboard.');
          router.replace('/mahasiswa/dashboard');
          return;
        }

        // 1. Ambil Mock Data (Simulasi API)
        const mockData: DetailData = {
          jenisSurat: "Surat Keterangan Lulus",
          tanggalLulus: undefined as any,
          ipk: "",
          jumlahSks: "",
        };

        // 2. Fetch draft info if URL has draftId
        const urlParams = new URLSearchParams(window.location.search);
        const draftIdFromUrl = urlParams.get('draftId');
        const draftIdFromStorage = localStorage.getItem('skl_draft_id');
        const currentDraftId = draftIdFromUrl || draftIdFromStorage;

        if (currentDraftId) {
          try {
            const draft = await sklService.getPengajuanDetail(currentDraftId);
            if (draft) {
              setDraftId(currentDraftId);
              setDraftStatus(draft.status);
            }
          } catch (error) {
            console.error('Error fetching draft in detail page:', error);
          }
        }

        // 3. Cek apakah ada data tersimpan di LocalStorage?
        const savedDataJson = localStorage.getItem("skl_detail_pengajuan");

        if (savedDataJson) {
          try {
            const savedData = JSON.parse(savedDataJson);
            // Gabungkan Mock Data (Readonly) + Saved Data (Inputan User)
            // Filter out empty strings untuk tanggalLulus
            const mergedData = {
              ...mockData,
              ...savedData,
              tanggalLulus: savedData.tanggalLulus || undefined
            };
            setDetailData(mergedData);
          } catch (e) {
            console.error('Error parsing saved detail data:', e);
            setDetailData(mockData);
          }
        } else {
          // Jika tidak ada simpanan, pakai data Mock murni
          setDetailData(mockData);
        }

      } catch (error) {
        message.error("Gagal mengambil data detail.");
      } finally {
        setLoading(false);
      }
    };
    getDetailData();
  }, []);

  // --- HANDLE NEXT (SIMPAN DATA SEBELUM PINDAH) ---
  const handleNext = async () => {
    try {
      // 1. Validasi Form
      const values = await formRef.current?.validateFields();

      if (!values) return;

      // 2. Validasi IPK range 2.00 - 4.00
      const ipkValue = parseFloat(values.ipk);
      const isIpkInvalid = ipkValue < 2.0 || ipkValue > 4.0;

      // 3. Validasi Tanggal Lulus tidak boleh di masa depan
      const tanggalLulus = new Date(values.tanggalLulus);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time untuk perbandingan tanggal saja
      const isTanggalInvalid = tanggalLulus > today;

      // 4. Tentukan pesan error berdasarkan kondisi
      let errorMessage: React.ReactNode = "";
      let errorTitle = "Peringatan";

      if (isIpkInvalid && isTanggalInvalid) {
        errorTitle = "Data Tidak Valid";
        errorMessage = (
          <>
            <p><strong>IPK tidak valid:</strong> IPK harus berada di rentang 2.00 - 4.00. Anda memasukkan: <strong>{values.ipk}</strong></p>
            <p><strong>Tanggal Lulus tidak valid:</strong> Tanggal lulus tidak boleh melebihi tanggal hari ini.</p>
          </>
        );
      } else if (isIpkInvalid) {
        errorTitle = "IPK Tidak Valid";
        errorMessage = `IPK harus berada di rentang 2.00 - 4.00. Anda memasukkan: ${values.ipk}`;
      } else if (isTanggalInvalid) {
        errorTitle = "Tanggal Lulus Tidak Valid";
        errorMessage = "Tanggal lulus tidak boleh melebihi tanggal hari ini. Silakan pilih tanggal yang valid.";
      }

      // 5. Jika ada error, tampilkan modal
      if (errorMessage) {
        modal.warning({
          title: errorTitle,
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
          content: errorMessage,
          okText: "Perbaiki Data",
          centered: true,
        });
        return;
      }

      // 6. Validasi SKS minimum 144
      const sksValue = parseInt(values.jumlahSks);
      if (isNaN(sksValue) || sksValue < 144) {
        modal.warning({
          title: "Jumlah SKS Tidak Mencukupi",
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
          content: (
            <>
              <p>Jumlah SKS minimal untuk pengajuan SKL adalah <strong>144 SKS</strong>.</p>
              <p>SKS yang Anda masukkan: <strong>{values.jumlahSks || 0} SKS</strong></p>
              <p style={{ color: '#8c8c8c', fontSize: 13 }}>
                Pastikan seluruh SKS yang telah ditempuh sudah tercatat sebelum mengajukan SKL.
              </p>
            </>
          ),
          okText: "Perbaiki Data",
          centered: true,
        });
        return;
      }

      // 7. Jika validasi lolos, simpan dan lanjut
      const dataToSave = { ...detailData, ...values };
      localStorage.setItem("skl_detail_pengajuan", JSON.stringify(dataToSave));

      message.success("Draft tersimpan, melanjutkan...");

      // 7. Pindah Halaman
      router.push("/mahasiswa/form/lampiran");

    } catch (error) {
      message.error("Mohon lengkapi data wajib.");
    }
  };

  if (loading) {
    return (
      <Spin size="large" description="Memuat Data..." fullscreen />
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div style={{ margin: "0 auto", width: "100%", maxWidth: "1200px", padding: "24px 48px" }}>

        <div style={{ marginBottom: "32px" }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: "#262626" }}>
            Detail Pengajuan
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Lengkapi detail utama dari surat yang akan diajukan.
          </Text>
        </div>

        <div style={{ marginBottom: "40px", padding: "32px", borderRadius: "8px" }}>
          <ProgressStepper steps={steps} />
        </div>

        <FormDetailPengajuan
          formRef={formRef}
          initialValues={detailData}
        />

        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            size="large"
            style={{ borderRadius: "6px", padding: "0 32px" }}
            onClick={() => router.push('/mahasiswa/form/dataDiri')}
          >
            Kembali
          </Button>

          <Space size={16}>
            {(!draftStatus || draftStatus === 'DRAFT') && (
              <Button
                size="large"
                style={{
                  borderRadius: "6px",
                  color: "#1890ff",
                  borderColor: "#1890ff",
                  fontWeight: 600
                }}
                onClick={async () => {
                  try {
                    const values = formRef.current?.getFieldsValue();
                    const dataToSave = { ...detailData, ...values };
                    localStorage.setItem("skl_detail_pengajuan", JSON.stringify(dataToSave));

                    // Sync ke DB
                    const profile = await mahasiswaService.getProfile();
                    const bid = localStorage.getItem('skl_draft_id');
                    if (profile && bid) {
                      await sklService.saveDraft({
                        id: bid,
                        mahasiswaId: profile.id,
                        tglLulus: values.tanggalLulus,
                        ipkTerakhir: parseFloat(values.ipk),
                        draftStep: 2,
                        createLog: true
                      });
                    }
                    message.success("Draft berhasil disimpan ke server!");
                  } catch (err) {
                    console.error('Save draft error:', err);
                    message.error("Gagal sinkronisasi draft ke server.");
                  }
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
                fontWeight: 600,
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
              }}
              onClick={handleNext}
            >
              Lanjut
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}

export default function DetailPengajuan() {
  return (
    <ConfigProvider locale={idID}>
      <App>
        <DetailContent />
      </App>
    </ConfigProvider>
  );
}
