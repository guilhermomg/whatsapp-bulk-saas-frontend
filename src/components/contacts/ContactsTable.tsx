'use client';

import { Contact } from '@/lib/api/contacts';
import { useState } from 'react';

interface ContactsTableProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onManageTags: (contact: Contact) => void;
  isLoading?: boolean;
}

export function ContactsTable({
  contacts,
  onEdit,
  onDelete,
  onManageTags,
  isLoading,
}: ContactsTableProps) {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const toggleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No contacts found. Create your first contact to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedContacts.size === contacts.length && contacts.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tags</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.id)}
                  onChange={() => toggleSelectContact(contact.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{contact.name || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900 font-mono">{contact.phone}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{contact.email || '-'}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${contact.optedIn
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {contact.optedIn ? 'Opted In' : 'Opted Out'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex flex-wrap gap-1">
                  {contact.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {contact.tags.length > 2 && (
                    <span className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                      +{contact.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(contact)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onManageTags(contact)}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Tags
                  </button>
                  <button
                    onClick={() => onDelete(contact)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
