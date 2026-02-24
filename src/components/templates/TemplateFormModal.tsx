'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTemplateSchema, CreateTemplateInput } from '@/lib/validations/template';
import { templatesApi, Template } from '@/lib/api/templates';
import { TemplatePreview } from './TemplatePreview';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: Template;
}

export function TemplateFormModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: TemplateFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonCount, setButtonCount] = useState(template?.components.buttons?.length || 0);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: template?.name || '',
      category: template?.category || 'marketing',
      language: template?.language || 'en_US',
      components: template?.components || {
        body: { text: '' },
      },
    },
  });

  const components = watch('components');

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateTemplateInput) => {
    try {
      setLoading(true);
      setError('');

      if (template) {
        await templatesApi.update(template.id, data);
      } else {
        await templatesApi.create(data);
      }

      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 grid grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g., order_confirmation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={loading || !!template}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="utility">Utility</option>
                  <option value="authentication">Authentication</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  {...register('components.body')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en_US">English (US)</option>
                  <option value="es_ES">Spanish</option>
                  <option value="pt_BR">Portuguese (Brazil)</option>
                  <option value="fr_FR">French</option>
                </select>
              </div>

              {/* Header */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Header (Optional)</h3>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Text</label>
                  <input
                    {...register('components.header.text')}
                    placeholder="e.g., Order Status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Body */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Body *</h3>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Text (use double curly braces for variables: {'[[1]]'} where 1 is the variable number)
                  </label>
                  <textarea
                    {...register('components.body.text')}
                    placeholder="e.g., Order {{1}} confirmed&#10;Total: {{2}}"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  {errors.components?.body?.text && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.components.body.text.message}
                    </p>
                  )}
                </div>
                {components.body?.text && (
                  <div className="mt-2 text-xs text-gray-600">
                    Character count: {components.body.text.length}/1024
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Footer (Optional)</h3>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Text</label>
                  <input
                    {...register('components.footer.text')}
                    placeholder="e.g., Thank you!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Buttons (Optional)</h3>
                  <span className="text-xs text-gray-600">{buttonCount}/3</span>
                </div>
                {buttonCount < 3 && (
                  <button
                    type="button"
                    onClick={() => setButtonCount(buttonCount + 1)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Button
                  </button>
                )}
                {buttonCount > 0 && (
                  <p className="text-xs text-gray-600 mt-2">Note: Button configuration UI can be extended here</p>
                )}
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <TemplatePreview template={template || ({} as any)} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
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
              {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
