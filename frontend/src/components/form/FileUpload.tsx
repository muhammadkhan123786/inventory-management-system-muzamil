// src/components/form/FileUpload.tsx
'use client';

import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  onFilesChange: (files: File[]) => void;
  helperText?: string;
  error?: string;
}

export function FileUpload({
  label,
  accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  maxSize = 5,
  onFilesChange,
  helperText,
  error,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        invalidFiles.push(`${file.name} (exceeds ${maxSize}MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Some files were skipped:\n${invalidFiles.join('\n')}`);
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-fg">
        {label}
      </label>

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          ${dragOver ? 'border-primary bg-primary/5' : 'border-input'}
          ${error ? 'border-destructive' : ''}
          transition-colors cursor-pointer
        `}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-secondary">
            <Upload className="w-6 h-6 text-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted mt-1">
              {helperText || `Supported formats: PDF, DOC, PNG, JPG (max ${maxSize}MB)`}
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-fg">
            Uploaded Files ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
}