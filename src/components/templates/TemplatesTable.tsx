'use client';

import { Template } from '@/lib/api/templates';
import { StatusBadge } from './StatusBadge';

interface TemplatesTableProps {
  templates: Template[];
  loading?: boolean;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onViewDetails?: (template: Template) => void;
}

export function TemplatesTable({
  templates,
  loading = false,
  onEdit,
  onDelete,
  onViewDetails,
}: TemplatesTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-600 mt-2">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600">No templates yet. Create your first template!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {templates.map((template) => (
            <tr key={template.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <button
                  onClick={() => onViewDetails?.(template)}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {template.name}
                </button>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {template.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge
                  status={template.status}
                  rejectionReason={template.rejectionReason}
                />
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(template.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {template.status === 'draft' && (
                  <button
                    onClick={() => onEdit?.(template)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
                {template.status === 'draft' && (
                  <button
                    onClick={() => onDelete?.(template)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
                {template.status === 'approved' && (
                  <span className="text-sm text-gray-600">Ready to use</span>
                )}
                {template.status === 'rejected' && (
                  <span className="text-sm text-gray-600">View details</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
