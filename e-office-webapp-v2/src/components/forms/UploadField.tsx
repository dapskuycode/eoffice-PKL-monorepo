"use client";

import React from "react";
import { Upload, Button, Typography, Modal } from "antd";
import { EyeOutlined, DeleteOutlined, FilePdfOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface FileUpload {
  uid: string;
  name: string;
  size: number;
  type: string;
  originFileObj?: File;
  dataUrl?: string;    // Base64 encoded file atau URL MinIO untuk preview
  filePath?: string;   // URL MinIO presigned untuk file yang sudah di-upload ke DB
  isExisting?: boolean; // True jika file sudah ada di database (tidak perlu re-upload)
}

interface UploadFieldProps {
  field: string;
  label: string;
  required?: boolean;
  exampleImage?: string; // Path to example image in public folder
  file?: FileUpload | null;
  onUpload: (file: File) => boolean;
  onDelete: () => void;
  onPreview: () => void;
}

export const UploadField: React.FC<UploadFieldProps> = ({
  field,
  label,
  required = false,
  exampleImage,
  file = null,
  onUpload,
  onDelete,
  onPreview,
}) => {
  const [showExample, setShowExample] = React.useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14, color: "#262626" }}>
          {label}
          {required && <span style={{ color: "#ff4d4f" }}>*</span>}
        </Text>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Wajib: Unggah menggunakan format: PDF, JPG, PNG; Maks: 5MB/file.
          </Text>
        </div>
        {exampleImage && (
          <a
            href="#"
            style={{ fontSize: 12, color: "#1890ff" }}
            onClick={(e) => {
              e.preventDefault();
              setShowExample(true);
            }}
          >
            Lihat Contoh
          </a>
        )}
      </div>

      {!file ? (
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <Upload
            beforeUpload={(f) => onUpload(f)}
            showUploadList={false}
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <div
              style={{
                border: "2px dashed #d9d9d9",
                borderRadius: 8,
                padding: "20px clamp(16px, 8vw, 25vh)",
                minHeight: "120px",
                width: "100%",
                boxSizing: "border-box",
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
              <FilePdfOutlined style={{ fontSize: 28, color: "#bfbfbf", marginBottom: 4 }} />
              <div>
                <Text style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>
                  Seret & lepas atau{" "}
                  <span style={{ textDecoration: "underline" }}>pilih file</span>
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                untuk diunggah
              </Text>
            </div>
          </Upload>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 16px",
            minHeight: "120px",
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #ffa39e",
            borderRadius: 8,
            backgroundColor: "#fff2f0",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#ffccc7",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FilePdfOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#262626", wordBreak: "break-word" }}>
              {file.name.length > 40
                ? `${file.name.substring(0, 20)}...${file.name.substring(file.name.length - 15)}`
                : file.name
              }
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              {(file.size / 1024).toFixed(0)} KB
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={onPreview}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={onDelete}
            />
          </div>
        </div>
      )}

      <Modal
        title={`Contoh ${label}`}
        open={showExample}
        onCancel={() => setShowExample(false)}
        footer={null}
        width={800}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={exampleImage}
            alt={`Contoh ${label}`}
            style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        </div>
      </Modal>
    </div>
  );
};
