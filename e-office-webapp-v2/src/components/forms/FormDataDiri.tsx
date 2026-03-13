// FILE: src/components/forms/FormDataDiri.tsx

import React, { useState, useEffect } from "react";
import { ProFormInstance } from "@ant-design/pro-components";
import DynamicForm, { FieldConfig } from "./DynamicForm";
import { masterDataService } from "@/services/masterDataService";

// --- TIPE DATA ---
export interface MahasiswaData {
  nama: string;
  role: string;
  nim: string;
  email: string;
  departemen: string;
  prodi: string;
  tempatLahir: string;
  tanggalLahir: string;
  no_hp?: string;
  alamat?: string;
}

// --- PROPS KOMPONEN ---
interface FormDataDiriProps {
  formRef: React.RefObject<ProFormInstance | null>;
  initialValues?: MahasiswaData;
}

// --- KONFIGURASI FIELDS AWAL ---
const initialDataDiriFields: FieldConfig[] = [
  {
    name: "nama",
    label: "Nama Lengkap",
    type: "text",
    required: true,
    placeholder: "Masukkan nama lengkap",
  },
  {
    name: "role",
    label: "Role",
    type: "text",
    required: true,
    placeholder: "Masukkan role",
  },
  {
    name: "nim",
    label: "NIM",
    type: "text",
    required: true,
    placeholder: "Masukkan NIM",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    required: true,
    placeholder: "Masukkan email",
  },
  {
    name: "departemen",
    label: "Departemen",
    type: "select",
    required: true,
    placeholder: "Pilih departemen",
    options: [], // Will be populated dynamically
  },
  {
    name: "prodi",
    label: "Program Studi",
    type: "select",
    required: true,
    placeholder: "Pilih program studi",
    options: [], // Will be populated dynamically
  },
  {
    name: "tempatLahir",
    label: "Tempat Lahir",
    type: "text",
    required: true,
    placeholder: "Masukkan tempat lahir",
  },
  {
    name: "tanggalLahir",
    label: "Tanggal Lahir",
    type: "date",
    format: "DD/MM/YYYY",
    required: true,
    placeholder: "Pilih tanggal lahir",
  },
  {
    name: "no_hp",
    label: "No. HP",
    type: "text",
    required: true,
    placeholder: "Masukkan nomor HP",
  },
  {
    name: "alamat",
    label: "Alamat",
    type: "text",
    required: true,
    placeholder: "Masukkan alamat lengkap",
  },
];

// --- KOMPONEN FORM ---
const FormDataDiri: React.FC<FormDataDiriProps> = ({ formRef, initialValues }) => {
  const [fields, setFields] = useState<FieldConfig[]>(initialDataDiriFields);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [departemenList, prodiList] = await Promise.all([
          masterDataService.getDepartemenList(),
          masterDataService.getProdiList(),
        ]);

        const departemenOptions = departemenList.map(dep => ({
          label: dep.name,
          value: dep.name, // using name as value to match previous behavior 
        }));

        const prodiOptions = prodiList.map(prodi => ({
          label: prodi.name,
          value: prodi.name, // using name as value to match previous behavior
        }));

        setFields(prevFields =>
          prevFields.map(field => {
            if (field.name === "departemen") {
              return { ...field, options: departemenOptions };
            }
            if (field.name === "prodi") {
              return { ...field, options: prodiOptions };
            }
            return field;
          })
        );
      } catch (error) {
        console.error("Failed to fetch options for FormDataDiri", error);
      }
    };

    fetchMasterData();
  }, []);

  return (
    <DynamicForm
      formRef={formRef}
      fields={fields}
      initialValues={initialValues}
    />
  );
};

export default FormDataDiri;
