'use client';

import { useState } from 'react';
import { Template, templatesApi } from '@/lib/api/templates';
import { StatusBadge } from './StatusBadge';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template: Template | null;
}

export function SubmitModal({ isOpen, onClose, onSuccess, template }: SubmitModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    try {
      setLoading(true);
      setError('');

      if (!wabaId.trim()) {
        setError('WhatsApp Business Account ID is required');
        return;
      }

      if (!accessToken.trim()) {
        setError('Access token is required');
        return;
      }

      await templatesApi.submit(template.id, wabaId, accessToken);

      setWabaId('');
      setAccessToken('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-900">{template.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                <StatusBadge status={template.status} />
              </div>
            </div>
          </div>

          {/* WABA ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Business Account ID *
            </label>
            <input
              type="text"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              placeholder="e.g., 1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Find this in your Meta Business Suite
            </p>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token *
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Paste your access token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Generate from WhatsApp Business App → Settings → System Users
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              📌 After submission, WhatsApp will review your template. Approval typically takes 24-48 hours.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit to WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
