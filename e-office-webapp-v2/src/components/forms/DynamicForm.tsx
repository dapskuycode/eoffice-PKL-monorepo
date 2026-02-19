// FILE: src/components/forms/DynamicForm.tsx

import React from "react";
import { Card, Col, Form } from "antd";
import {
  ProForm,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
  ProFormInstance,
} from "@ant-design/pro-components";
import SignatureCanvas from "./SignatureCanvas";

// --- TIPE FIELD ---
export type FieldType = "text" | "date" | "select" | "textarea" | "custom";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  span?: number; // Default 12 (setengah row)
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  rules?: any[];
  options?: { label: string; value: string | number }[]; // Untuk select
  format?: string; // Untuk date
  rows?: number; // Untuk textarea
  variant?: "outlined" | "filled" | "borderless";
  className?: string;
}

// --- PROPS KOMPONEN ---
interface DynamicFormProps {
  formRef: React.RefObject<ProFormInstance | null>;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  cardStyle?: React.CSSProperties;
  gutter?: [number, number];
}

// --- KOMPONEN DYNAMIC FORM ---
const DynamicForm: React.FC<DynamicFormProps> = ({
  formRef,
  fields,
  initialValues,
  cardStyle,
  gutter = [48, 16],
}) => {
  const renderField = (field: FieldConfig) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      disabled: field.disabled,
      placeholder: field.placeholder,
      rules: [
        ...(field.required ? [{ required: true, message: `${field.label} wajib diisi` }] : []),
        ...(field.rules || []),
      ],
    };

    const fieldStyle = field.disabled
      ? { variant: field.variant || "filled", className: field.className || "font-semibold text-gray-800" }
      : { size: "large" as const, style: { backgroundColor: "white", borderColor: "#d9d9d9" } };

    switch (field.type) {
      case "text":
        return (
          <ProFormText
            {...commonProps}
            fieldProps={fieldStyle}
          />
        );

      case "date":
        return (
          <ProFormDatePicker
            {...commonProps}
            fieldProps={{
              ...fieldStyle,
              format: field.format || "DD/MM/YYYY",
              className: `w-full ${field.className || ""}`,
            }}
          />
        );

      case "select":
        return (
          <ProFormSelect
            {...commonProps}
            options={field.options || []}
            fieldProps={fieldStyle}
          />
        );

      case "textarea":
        return (
          <ProFormTextArea
            {...commonProps}
            fieldProps={{
              ...fieldStyle,
              rows: field.rows || 4,
            }}
          />
        );

      case "custom":
        // For signature canvas
        if (field.name === "signature") {
          return (
            <Form.Item
              name={field.name}
              label={field.label}
              rules={[
                ...(field.required ? [{ required: true, message: `${field.label} wajib diisi` }] : []),
                ...(field.rules || []),
              ]}
            >
              <SignatureCanvas />
            </Form.Item>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <Card
      variant="borderless"
      className="shadow-sm rounded-xl"
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        ...cardStyle,
      }}
    >
      <ProForm
        formRef={formRef}
        submitter={false}
        layout="vertical"
        grid={true}
        initialValues={initialValues}
        rowProps={{
          gutter,
        }}
      >
        {fields.map((field) => (
          <Col key={field.name} span={24} md={field.span || 12}>
            {renderField(field)}
          </Col>
        ))}
      </ProForm>
    </Card>
  );
};

export default DynamicForm;
