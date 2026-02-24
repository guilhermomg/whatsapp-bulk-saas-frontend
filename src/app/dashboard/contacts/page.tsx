'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Contact, contactsApi } from '@/lib/api/contacts';
import { AddContactModal } from '@/components/contacts/AddContactModal';
import { EditContactModal } from '@/components/contacts/EditContactModal';
import { ManageTagsModal } from '@/components/contacts/ManageTagsModal';
import { DeleteContactModal } from '@/components/contacts/DeleteContactModal';
import { ImportCsvModal } from '@/components/contacts/ImportCsvModal';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { DashboardNav } from '@/components/DashboardNav';

export default function ContactsPage() {
  const { user, isInitialized } = useRequireAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageTagsModal, setShowManageTagsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptedIn, setFilterOptedIn] = useState<'all' | 'opted-in' | 'opted-out'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  const ITEMS_PER_PAGE = 25;

  // Fetch contacts
  const fetchContacts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await contactsApi.list({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        optedIn: filterOptedIn === 'all' ? undefined : filterOptedIn === 'opted-in',
      });

      setContacts(response.data);
      setTotalContacts(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts when page, search, or filter changes
  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchQuery, filterOptedIn]);

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const handleManageTags = (contact: Contact) => {
    setSelectedContact(contact);
    setShowManageTagsModal(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDeleteModal(true);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await contactsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export contacts');
    }
  };

  const totalPages = Math.ceil(totalContacts / ITEMS_PER_PAGE);

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage your WhatsApp contacts and opt-in lists
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Add Contact
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            📤 Import CSV
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Contacts
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Opt-in Status
            </label>
            <select
              id="filter"
              value={filterOptedIn}
              onChange={(e) => {
                setFilterOptedIn(e.target.value as 'all' | 'opted-in' | 'opted-out');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Contacts</option>
              <option value="opted-in">Opted In</option>
              <option value="opted-out">Opted Out</option>
            </select>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ContactsTable
            contacts={contacts}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onManageTags={handleManageTags}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {!isLoading && contacts.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalContacts)} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalContacts)} of {totalContacts} contacts
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Statistics */}
        {!isLoading && contacts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Contacts</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{totalContacts}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Opted In</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {contacts.filter(c => c.optedIn).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Opted Out</div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {contacts.filter(c => !c.optedIn).length}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchContacts}
      />

      <EditContactModal
        isOpen={showEditModal}
        contact={selectedContact}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContact(null);
        }}
        onSuccess={fetchContacts}
      />

      <ManageTagsModal
        isOpen={showManageTagsModal}
        contact={selectedContact}
        onClose={() => {
          setShowManageTagsModal(false);
          setSelectedContact(null);
        }}
        onSuccess={fetchContacts}
      />

      <DeleteContactModal
        isOpen={showDeleteModal}
        contact={selectedContact}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedContact(null);
        }}
        onSuccess={fetchContacts}
      />

      <ImportCsvModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchContacts}
      />
    </div>
  );
}
