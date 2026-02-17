'use client';

import { useState } from 'react';
import { Contact, contactsApi } from '@/lib/api/contacts';

interface ManageTagsModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManageTagsModal({ isOpen, contact, onClose, onSuccess }: ManageTagsModalProps) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(contact?.tags || []);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!contact) return;

    try {
      setIsLoading(true);
      setError('');

      await contactsApi.updateTags(contact.id, tags);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tags');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          <p className="text-sm text-gray-600 mt-1">{contact.phone}</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Tag Input */}
          <div>
            <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700">
              Add New Tag
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Enter tag name"
                className="flex-1 appearance-none relative block px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 sm:text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Tags ({tags.length})
            </label>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tags yet</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Tags'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
