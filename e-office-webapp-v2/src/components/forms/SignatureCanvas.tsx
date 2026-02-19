import React, { useRef, useState, useEffect } from 'react';
import { Button, Space } from 'antd';

interface SignatureCanvasProps {
  onChange?: (signature: string) => void;
  value?: string;
  width?: number;
  height?: number;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onChange,
  value,
  width = 500,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);

        // Load existing signature if provided
        if (value) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = value;
        }
      }
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      context.beginPath();
      context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (!context) return;
    setIsDrawing(false);
    context.closePath();
    
    // Convert canvas to base64 and call onChange
    if (canvasRef.current && onChange) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (onChange) {
      onChange('');
    }
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    e.preventDefault();
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      context.beginPath();
      context.moveTo(
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      context.lineTo(
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
      );
      context.stroke();
    }
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          border: '2px solid #d9d9d9',
          borderRadius: '8px',
          padding: '8px',
          backgroundColor: '#fafafa',
          display: 'inline-block',
          width: 'fit-content',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            border: '1px dashed #d9d9d9',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
        />
      </div>
      <Space>
        <Button onClick={clearCanvas} size="small">
          Hapus Tanda Tangan
        </Button>
      </Space>
    </div>
  );
};

export default SignatureCanvas;
