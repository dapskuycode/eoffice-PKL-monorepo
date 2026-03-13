'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Card, Descriptions, Button, Space, Typography,
    Divider, Row, Col, Spin, App, Modal, Image,
    Tag, Timeline, Alert, Badge, Empty
} from 'antd';
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    PrinterOutlined,
    EditOutlined,
    PaperClipOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    ScanOutlined,
    RollbackOutlined
} from '@ant-design/icons';
import { sklService, SklPengajuan } from '@/services/sklService';
import { mahasiswaService } from '@/services/mahasiswaService';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text, Paragraph } = Typography;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:9000/e-office-storage';

export default function DetailPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pengajuanId = searchParams ? searchParams.get('id') : null;
    const { user } = useAuth();
    const { modal, message } = App.useApp();

    const [loading, setLoading] = useState(true);
    const [pengajuan, setPengajuan] = useState<SklPengajuan | null>(null);
    const [riwayat, setRiwayat] = useState<any[]>([]);
    const [pdfPreview, setPdfPreview] = useState<{ visible: boolean; url: string; title: string }>({
        visible: false,
        url: '',
        title: ''
    });

    useEffect(() => {
        if (pengajuanId) {
            loadData();
        } else {
            router.push('/mahasiswa/riwayat');
        }
    }, [pengajuanId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await sklService.getPengajuanDetail(pengajuanId!);
            if (data) {
                setPengajuan(data);
                // Get riwayat if available or already included
                if (data.riwayat) {
                    setRiwayat(data.riwayat.sort((a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ));
                } else {
                    const hist = await sklService.getRiwayat(pengajuanId!);
                    setRiwayat(hist.sort((a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ));
                }
            } else {
                message.error('Data pengajuan tidak ditemukan');
                router.push('/mahasiswa/riwayat');
            }
        } catch (error) {
            console.error('Error loading detail:', error);
            message.error('Gagal memuat detail pengajuan');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'DRAFT': 'default',
            'SUBMITTED': 'blue',
            'VERIFIED_ADMIN': 'cyan',
            'APPROVED_KAPRODI': 'cyan',
            'REGISTERING': 'geekblue',
            'REGISTERED': 'purple',
            'APPROVED_SUPERVISOR': 'purple',
            'SIAP_CETAK': 'magenta',
            'COMPLETED': 'success',
            'REVISI': 'warning',
            'DITOLAK': 'error',
        };
        return colors[status] || 'default';
    };

    const handlesEdit = () => {
        if (!pengajuan) return;

        // Simpan ke localStorage untuk diteruskan ke form pengajuan
        localStorage.setItem('skl_draft_id', pengajuanId!);
        localStorage.setItem('skl_edit_mode', 'true');
        localStorage.setItem('skl_edit_source_id', pengajuanId!);

        // Map existing data to storage keys
        const dataDiriParams = {
            nama: pengajuan.namaSementara || user?.nama,
            nim: pengajuan.nimSementara || pengajuan.mahasiswa?.nim,
            email: pengajuan.emailSementara || user?.email,
            departemen: pengajuan.departemenSementara || pengajuan.mahasiswa?.departemen,
            prodi: pengajuan.prodiSementara || pengajuan.mahasiswa?.programStudi?.name,
            noHp: pengajuan.noHpSementara || pengajuan.mahasiswa?.noHp,
            alamat: pengajuan.alamatSementara || pengajuan.mahasiswa?.alamat,
            tempatLahir: pengajuan.tempatLahirSementara || pengajuan.mahasiswa?.tempatLahir,
            tanggalLahir: pengajuan.tanggalLahirSementara || pengajuan.mahasiswa?.tanggalLahir,
        };
        localStorage.setItem('skl_data_diri', JSON.stringify(dataDiriParams));

        const detailParams = {
            tanggalLulus: pengajuan.tglLulus,
            ipk: pengajuan.ipkTerakhir?.toString(),
            jumlahSks: pengajuan.jumlahSks?.toString(),
        };
        localStorage.setItem('skl_detail_pengajuan', JSON.stringify(detailParams));

        // Map lampiran array to expected object format { ktm: {}, ... }
        const jenisToKeyMap: Record<string, string> = {
            'KTM': 'ktm',
            'TRANSKRIP_NILAI': 'transkrip',
            'BERITA_ACARA_UJIAN': 'beritaAcara',
            'BEBAS_PUSTAKA': 'ujianSarjana',
            'PAS_FOTO': 'pasFoto',
            'BUKTI_SUBMIT': 'buktiSubmit',
            'LAINNYA': 'lainnya'
        };

        const lampiranForEdit: Record<string, any> = {};
        (pengajuan.lampiran || []).forEach(l => {
            const key = jenisToKeyMap[l.jenisDokumen];
            if (key) {
                const isPdf = l.pathFile?.toLowerCase().endsWith('.pdf');
                lampiranForEdit[key] = {
                    uid: l.id || Date.now().toString() + Math.random().toString().substring(2, 6),
                    name: l.jenisDokumen + (isPdf ? '.pdf' : '.jpg'),
                    type: isPdf ? 'application/pdf' : 'image/jpeg',
                    size: 1024, // Dummy size
                    filePath: l.pathFile?.startsWith('http') ? l.pathFile : `${API_URL}/files/${l.pathFile}`,
                    isExisting: true,
                    hasFile: true
                };
            }
        });

        localStorage.setItem('skl_lampiran', JSON.stringify(lampiranForEdit));
        if (pengajuan.tandatangan) localStorage.setItem('skl_signature', pengajuan.tandatangan);

        router.push(`/mahasiswa/form/dataDiri?draftId=${pengajuanId}&edit=true`);
    };

    const handleBatal = () => {
        if (!pengajuan) return;

        modal.confirm({
            title: 'Batalkan Pengajuan',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: (
                <div>
                    <p>Apakah Anda yakin ingin membatalkan pengajuan ini?</p>
                    <p style={{ color: '#ff4d4f' }}>
                        Pengajuan yang dibatalkan tidak dapat diteruskan kembali. Anda harus membuat pengajuan baru.
                    </p>
                </div>
            ),
            okText: 'Ya, Batalkan',
            okType: 'danger',
            cancelText: 'Tidak',
            onOk: async () => {
                setLoading(true);
                try {
                    await sklService.updateStatus(pengajuanId!, {
                        status: 'BATAL',
                        actorId: user?.id || '',
                        catatan: 'Dibatalkan oleh mahasiswa'
                    });

                    message.success('Pengajuan berhasil dibatalkan');
                    await loadData();
                } catch (error) {
                    console.error('Error membatalkan pengajuan:', error);
                    message.error('Gagal membatalkan pengajuan');
                    setLoading(false);
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Memuat detail pengajuan..." />
            </div>
        );
    }

    if (!pengajuan) return null;

    return (
        <div className="pb-10">
            <Space className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/mahasiswa/riwayat')}
                >
                    Kembali ke Riwayat
                </Button>
            </Space>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    {/* Main Info Card */}
                    <Card
                        title={
                            <Space>
                                <FileTextOutlined />
                                <span>Detail Pengajuan SKL</span>
                                <Tag color={getStatusColor(pengajuan.status)} className="ml-2">
                                    {pengajuan.status?.replace(/_/g, ' ')}
                                </Tag>
                            </Space>
                        }
                        extra={
                            <>
                                {pengajuan.status === 'REVISI' && (
                                    <Button type="primary" icon={<EditOutlined />} onClick={handlesEdit}>
                                        Revisi Sekarang
                                    </Button>
                                )}
                                {(pengajuan.status === 'SUBMITTED' || pengajuan.status === 'DRAFT') && (
                                    <Space>
                                        <Button danger icon={<RollbackOutlined />} onClick={handleBatal}>
                                            Batal Pengajuan
                                        </Button>
                                        <Button type="primary" icon={<EditOutlined />} onClick={handlesEdit}>
                                            Edit Pengajuan
                                        </Button>
                                    </Space>
                                )}
                            </>
                        }
                        className="shadow-sm rounded-xl mb-6"
                    >
                        <Alert
                            message={<Text strong>Penting!</Text>}
                            description={
                                pengajuan.status === 'COMPLETED'
                                    ? "Pengajuan Anda telah disetujui dan selesai. Silakan cek menu Riwayat untuk mengunduh surat."
                                    : pengajuan.status === 'REVISI'
                                        ? "Terdapat permintaan revisi. Silakan cek catatan revisi di bagian Riwayat dan perbarui data Anda."
                                        : "Pengajuan Anda sedang diproses oleh tim administrasi. Pantau status berkala di sini."
                            }
                            type={pengajuan.status === 'COMPLETED' ? 'success' : pengajuan.status === 'REVISI' ? 'warning' : 'info'}
                            showIcon
                            className="mb-6"
                        />

                        <Descriptions bordered layout="vertical" column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="ID Pengajuan">{pengajuan.id}</Descriptions.Item>
                            <Descriptions.Item label="Nomor SKL">{pengajuan.nomorSkl || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Tanggal Pengajuan">
                                {new Date(pengajuan.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status Terakhir">
                                <Tag color={getStatusColor(pengajuan.status)}>{pengajuan.status}</Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider className="my-6">Data Kelulusan</Divider>

                        <Descriptions column={1}>
                            <Descriptions.Item label={<Text strong>Tanggal Lulus</Text>}>
                                {new Date(pengajuan.tglLulus).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </Descriptions.Item>
                            <Descriptions.Item label={<Text strong>IPK Terakhir</Text>}>
                                {pengajuan.ipkTerakhir.toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label={<Text strong>Jumlah SKS</Text>}>
                                {pengajuan.jumlahSks || '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider className="my-6">Identitas Pengajuan</Divider>
                        <Text type="secondary" className="block mb-4">Data ini digunakan khusus untuk surat ini (bukan data master mahasiswa).</Text>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Nama">{pengajuan.namaSementara || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Tempat, Tanggal Lahir">
                                {pengajuan.tempatLahirSementara || '-'}, {pengajuan.tanggalLahirSementara ? new Date(pengajuan.tanggalLahirSementara).toLocaleDateString('id-ID') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="No. HP">{pengajuan.noHpSementara || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Alamat">{pengajuan.alamatSementara || '-'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Lampiran Card */}
                    <Card
                        title={<Space><PaperClipOutlined /><span>Lampiran Berkas</span></Space>}
                        className="shadow-sm rounded-xl"
                    >
                        <div className="flex flex-wrap gap-4">
                            {(pengajuan.lampiran || []).length > 0 ? (
                                pengajuan.lampiran!.map((l: any, idx: number) => {
                                    const isAbsoluteUrl = l.pathFile?.startsWith('http');
                                    const fileUrl = isAbsoluteUrl ? l.pathFile : `${API_URL}/files/${l.pathFile}`;
                                    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(l.pathFile);

                                    return (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-center p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all w-32 cursor-pointer group shadow-sm bg-white"
                                            onClick={() => {
                                                if (isImage) {
                                                    // Trigger antd image preview
                                                    const img = document.getElementById(`img-preview-${idx}`);
                                                    if (img) img.click();
                                                } else {
                                                    setPdfPreview({
                                                        visible: true,
                                                        url: fileUrl,
                                                        title: l.jenisDokumen?.replace(/_/g, ' ') || 'Pratinjau PDF'
                                                    });
                                                }
                                            }}
                                        >
                                            <div className="w-16 h-16 mb-2 flex items-center justify-center bg-gray-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <FileTextOutlined style={{ fontSize: 24 }} />
                                            </div>
                                            <Text strong style={{ fontSize: 11, textAlign: 'center', marginBottom: 4 }} className="group-hover:text-blue-600">
                                                {l.jenisDokumen?.replace(/_/g, ' ')}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 9 }}>
                                                Klik untuk Pratinjau
                                            </Text>

                                            {isImage && (
                                                <div style={{ display: 'none' }}>
                                                    <Image
                                                        id={`img-preview-${idx}`}
                                                        src={fileUrl}
                                                        alt={l.jenisDokumen}
                                                        preview={{
                                                            mask: <div className="text-xs">Lihat</div>,
                                                            src: fileUrl,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <Empty description="Tidak ada lampiran" />
                            )}
                        </div>

                        {pengajuan.tandatangan && (
                            <div className="mt-8 border-t pt-6">
                                <Text strong className="block mb-2">Tanda Tangan Mahasiswa:</Text>
                                <div className="p-4 border border-dashed rounded-lg bg-gray-50 inline-block">
                                    <Image src={pengajuan.tandatangan} alt="Tanda Tangan" style={{ maxHeight: 80 }} />
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Timeline Card */}
                    <Card
                        title={<Space><HistoryOutlined /><span>Riwayat Aktivitas</span></Space>}
                        className="shadow-sm rounded-xl mb-6 flex-grow"
                    >
                        {riwayat.length > 0 ? (
                            <Timeline
                                mode="left"
                                items={riwayat.map((item, idx) => ({
                                    color: idx === 0 ? getStatusColor(item.status) : 'gray',
                                    children: (
                                        <div className="pb-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <Text strong style={{ fontSize: 13 }}>{item.status?.replace(/_/g, ' ')}</Text>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {new Date(item.timestamp).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short'
                                                    })}
                                                </Text>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-1">
                                                Oleh: {item.actor?.name || 'Sistem'}
                                            </div>
                                            {item.catatan && (
                                                <div className="bg-gray-50 p-2 rounded text-xs italic border-l-2 border-gray-200 mt-1">
                                                    "{item.catatan}"
                                                </div>
                                            )}
                                        </div>
                                    )
                                }))}
                            />
                        ) : (
                            <Empty description="Belum ada riwayat aktivitas" />
                        )}
                    </Card>

                    {/* Quick Info */}
                    <Card className="bg-blue-50 border-blue-100 rounded-xl">
                        <Space align="start">
                            <InfoCircleOutlined className="text-blue-500 mt-1" />
                            <div>
                                <Text strong className="text-blue-700">Butuh Bantuan?</Text>
                                <Paragraph className="text-xs text-blue-600 mb-0 mt-1">
                                    Jika Anda menemukan ketidaksesuaian data master (Nama/NIM/Prodi), silakan hubungi bagian Akademik Fakultas.
                                </Paragraph>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* PDF Preview Modal */}
            <Modal
                title={pdfPreview.title}
                open={pdfPreview.visible}
                onCancel={() => setPdfPreview({ ...pdfPreview, visible: false })}
                footer={[
                    <Button key="close" onClick={() => setPdfPreview({ ...pdfPreview, visible: false })}>
                        Tutup
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        icon={<ScanOutlined />}
                        onClick={() => window.open(pdfPreview.url, '_blank')}
                    >
                        Buka di Tab Baru / Download
                    </Button>
                ]}
                width={1000}
                centered
                styles={{ body: { padding: 0, height: '75vh' } }}
                destroyOnClose
            >
                <iframe
                    src={pdfPreview.url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Viewer"
                />
            </Modal>
        </div>
    );
}
