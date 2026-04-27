'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Campaign, campaignsApi } from '@/lib/api/campaigns';
import { Template, templatesApi } from '@/lib/api/templates';
import { Contact, contactsApi } from '@/lib/api/contacts';
import { DashboardNav } from '@/components/DashboardNav';

const STATUS_COLORS: Record<Campaign['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-purple-100 text-purple-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  paused: 'bg-yellow-100 text-yellow-700',
};

function StatusBadge({ status }: { status: Campaign['status'] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

const ITEMS_PER_PAGE = 20;

export default function CampaignsPage() {
  const { user, isInitialized } = useRequireAuth();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formName, setFormName] = useState('');
  const [formTemplateId, setFormTemplateId] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  const fetchCampaigns = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await campaignsApi.list({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });
      setCampaigns(res.data);
      setTotal(res.pagination.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, user]);

  const openCreateModal = async () => {
    setFormName('');
    setFormTemplateId('');
    setFormScheduledAt('');
    setFormError('');
    setSelectedContactIds([]);
    setContactSearch('');
    setShowCreateModal(true);
    try {
      const [tmplRes, contactRes] = await Promise.all([
        templatesApi.list({ limit: 100 }),
        contactsApi.list({ limit: 200 }),
      ]);
      setTemplates(tmplRes.data.filter(t => t.status === 'draft' || t.status === 'approved'));
      setContacts(contactRes.data);
    } catch {
      setTemplates([]);
      setContacts([]);
    }
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!formTemplateId) {
      setFormError('Template is required');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await campaignsApi.create({
        name: formName.trim(),
        templateId: formTemplateId,
        contactIds: selectedContactIds.length > 0 ? selectedContactIds : undefined,
        scheduledAt: formScheduledAt || undefined,
      });
      setShowCreateModal(false);
      await fetchCampaigns();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (
    id: string,
    action: 'start' | 'pause' | 'cancel' | 'delete',
  ) => {
    try {
      setError('');
      if (action === 'delete') {
        await campaignsApi.delete(id);
      } else {
        await campaignsApi[action](id);
      }
      await fetchCampaigns();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || `Failed to ${action} campaign`);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const counts = {
    total,
    active: campaigns.filter(c => c.status === 'processing').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage and monitor your WhatsApp bulk campaigns
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: counts.total, color: 'text-gray-900' },
            { label: 'Active', value: counts.active, color: 'text-blue-600' },
            { label: 'Completed', value: counts.completed, color: 'text-green-600' },
            { label: 'Draft', value: counts.draft, color: 'text-gray-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">{label}</div>
              <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Campaign
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No campaigns yet. Click &quot;New Campaign&quot; to get started.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Status', 'Progress', 'Created', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {c.totalRecipients > 0
                        ? `${c.sentCount} / ${c.totalRecipients}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/dashboard/campaigns/${c.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                      {c.status === 'draft' && (
                        <button
                          onClick={() => handleAction(c.id, 'start')}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Start
                        </button>
                      )}
                      {c.status === 'processing' && (
                        <button
                          onClick={() => handleAction(c.id, 'pause')}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          Pause
                        </button>
                      )}
                      {(c.status === 'draft' || c.status === 'processing' || c.status === 'paused') && (
                        <button
                          onClick={() => handleAction(c.id, 'cancel')}
                          className="text-orange-600 hover:text-orange-800 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                      {c.status === 'draft' && (
                        <button
                          onClick={() => handleAction(c.id, 'delete')}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isLoading && campaigns.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, total)} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} campaigns
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Campaign</h3>

            {formError && (
              <div className="mb-4 rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Campaign name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Template <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTemplateId}
                  onChange={e => setFormTemplateId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Recipients{' '}
                    <span className="text-gray-400 font-normal">
                      ({selectedContactIds.length === 0
                        ? 'all contacts'
                        : `${selectedContactIds.length} selected`})
                    </span>
                  </label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedContactIds(contacts.map(c => c.id))}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Select all
                    </button>
                    {selectedContactIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedContactIds([])}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="mb-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div className="border border-gray-200 rounded-md overflow-y-auto max-h-44">
                  {contacts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No contacts found</p>
                  ) : (
                    contacts
                      .filter(c => {
                        const q = contactSearch.toLowerCase();
                        return !q || c.phone.includes(q) || (c.name ?? '').toLowerCase().includes(q);
                      })
                      .map(c => (
                        <label
                          key={c.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedContactIds.includes(c.id)}
                            onChange={e => {
                              setSelectedContactIds(prev =>
                                e.target.checked
                                  ? [...prev, c.id]
                                  : prev.filter(id => id !== c.id),
                              );
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900 truncate">
                            {c.name ? `${c.name} ` : ''}<span className="text-gray-500">{c.phone}</span>
                          </span>
                        </label>
                      ))
                  )}
                </div>
                {selectedContactIds.length === 0 && contacts.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No contacts selected — campaign will send to all contacts.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scheduled At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={e => setFormScheduledAt(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
