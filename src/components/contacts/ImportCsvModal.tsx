'use client';

import { useState, useRef } from 'react';
import { contactsApi } from '@/lib/api/contacts';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportCsvModal({ isOpen, onClose, onSuccess }: ImportCsvModalProps) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError('');
      setSuccess('');
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const result = await contactsApi.importCsv(file);

      setSuccess(`Successfully imported ${result.imported} contact(s).`);
      
      setTimeout(() => {
        onSuccess();
        onClose();
        setFileName('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Import Contacts from CSV</h2>
          <p className="text-sm text-gray-600 mt-1">Upload a CSV file with your contacts</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* File Format Info */}
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>CSV Format:</strong> phone, name, email, tags (comma-separated)
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Example: +1234567890,John Doe,john@example.com,tag1,tag2
            </p>
          </div>

          {/* File Input */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Select CSV File
            </label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {fileName && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <strong>{fileName}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isLoading || !fileName}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
