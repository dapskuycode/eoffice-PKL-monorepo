// FILE: src/components/forms/FormDataDiriWithDropdowns.tsx

import React, { useState, useEffect } from "react";
import { Card, Col } from "antd";
import {
    ProForm,
    ProFormText,
    ProFormDatePicker,
    ProFormSelect,
    ProFormInstance,
} from "@ant-design/pro-components";
import { masterDataService, Departemen, ProgramStudi } from "@/services/masterDataService";
import { MahasiswaData } from "./FormDataDiri";

interface FormDataDiriWithDropdownsProps {
    formRef: React.RefObject<ProFormInstance | null>;
    initialValues?: MahasiswaData;
}

const FormDataDiriWithDropdowns: React.FC<FormDataDiriWithDropdownsProps> = ({
    formRef,
    initialValues,
}) => {
    const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
    const [prodiList, setProdiList] = useState<ProgramStudi[]>([]);
    const [filteredProdiList, setFilteredProdiList] = useState<ProgramStudi[]>([]);
    const [selectedDepartemenId, setSelectedDepartemenId] = useState<string | undefined>();

    // Fetch departemen and prodi data on mount
    useEffect(() => {
        const fetchData = async () => {
            const [departemenData, prodiData] = await Promise.all([
                masterDataService.getDepartemenList(),
                masterDataService.getProdiList(),
            ]);
            setDepartemenList(departemenData);
            setProdiList(prodiData);

            // If initial values has departemen, find its ID and filter prodi
            if (initialValues?.departemen) {
                const dept = departemenData.find(d => d.name === initialValues.departemen);
                if (dept) {
                    setSelectedDepartemenId(dept.id);
                    setFilteredProdiList(prodiData.filter(p => p.departemenId === dept.id));
                }
            }
        };
        fetchData();
    }, [initialValues?.departemen]);

    // Handle departemen change
    const handleDepartemenChange = (value: string) => {
        // value is now departemen NAME, find the departemen to get its ID
        const dept = departemenList.find(d => d.name === value);
        if (dept) {
            setSelectedDepartemenId(dept.id);
            // Filter prodi based on selected departemen ID
            const filtered = prodiList.filter(p => p.departemenId === dept.id);
            setFilteredProdiList(filtered);
        }
        // Reset prodi field when departemen changes
        formRef.current?.setFieldsValue({ prodi: undefined });
    };

    const departemenOptions = departemenList.map(d => ({
        label: d.name,
        value: d.name, // Use name as value, not ID
    }));

    const prodiOptions = filteredProdiList.map(p => ({
        label: p.name,
        value: p.name, // Use name as value, not ID
    }));

    // No need to convert initial values anymore since we're using names
    const convertedInitialValues = React.useMemo(() => {
        return initialValues;
    }, [initialValues]);

    return (
        <Card
            variant="borderless"
            className="shadow-sm rounded-xl"
            style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
        >
            <ProForm
                formRef={formRef}
                submitter={false}
                layout="vertical"
                grid={true}
                initialValues={convertedInitialValues}
                rowProps={{
                    gutter: [48, 16],
                }}
            >
                <Col span={24} md={12}>
                    <ProFormText
                        name="nama"
                        label="Nama Lengkap"
                        placeholder="Masukkan nama lengkap"
                        rules={[{ required: true, message: "Nama Lengkap wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        name="role"
                        label="Role"
                        placeholder="Masukkan role"
                        rules={[{ required: true, message: "Role wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        name="nim"
                        label="NIM"
                        placeholder="Masukkan NIM"
                        rules={[{ required: true, message: "NIM wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        name="email"
                        label="Email"
                        placeholder="Masukkan email"
                        rules={[{ required: true, message: "Email wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormSelect
                        name="departemen"
                        label="Departemen"
                        placeholder="Pilih departemen"
                        options={departemenOptions}
                        rules={[{ required: true, message: "Departemen wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            onChange: handleDepartemenChange,
                            showSearch: true,
                            filterOption: (input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormSelect
                        name="prodi"
                        label="Program Studi"
                        placeholder="Pilih program studi"
                        options={prodiOptions}
                        rules={[{ required: true, message: "Program Studi wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            disabled: !selectedDepartemenId,
                            showSearch: true,
                            filterOption: (input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        name="tempatLahir"
                        label="Tempat Lahir"
                        placeholder="Masukkan tempat lahir"
                        rules={[{ required: true, message: "Tempat Lahir wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormDatePicker
                        name="tanggalLahir"
                        label="Tanggal Lahir"
                        placeholder="Pilih tanggal lahir"
                        rules={[{ required: true, message: "Tanggal Lahir wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            format: "DD/MM/YYYY",
                            className: "w-full",
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        name="no_hp"
                        label="No. HP"
                        placeholder="Masukkan nomor HP"
                        rules={[{ required: true, message: "No. HP wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        name="alamat"
                        label="Alamat"
                        placeholder="Masukkan alamat lengkap"
                        rules={[{ required: true, message: "Alamat wajib diisi" }]}
                        fieldProps={{
                            size: "large",
                            style: { backgroundColor: "white", borderColor: "#d9d9d9" },
                        }}
                    />
                </Col>
            </ProForm>
        </Card>
    );
};

export default FormDataDiriWithDropdowns;
