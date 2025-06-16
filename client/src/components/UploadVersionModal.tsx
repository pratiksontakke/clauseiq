import { useState, useRef } from 'react';
import Button from './ui/Button';
import { useQueryClient } from '@tanstack/react-query';

interface UploadVersionModalProps {
  contractId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadVersionModal({ contractId, onClose, onSuccess }: UploadVersionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://127.0.0.1:8000/contracts/${contractId}/versions`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      // Clear chat history from localStorage
      localStorage.removeItem(`chat_history_${contractId}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      
      // Close modal and notify success immediately
      onSuccess();
      onClose();

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-xl z-50 animate-slide-in-left">
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upload New Version</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div
          className={`flex-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-6 ${
            isDragging ? 'border-coral-primary bg-coral-primary/5' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileSelect}
          />
          
          {file ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ {file.name}</p>
              <p className="text-sm text-gray-500">Click or drag another file to replace</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg">Drop your PDF here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
              <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {isUploading && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm">
            Uploading document...
          </div>
        )}

        <div className="flex justify-end gap-3 mt-auto">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isUploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
} 