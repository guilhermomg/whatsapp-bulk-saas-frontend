'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { DashboardNav } from '@/components/DashboardNav';
import { whatsappApi } from '@/lib/api/whatsapp';

export default function DashboardPage() {
  const { user, isLoading, isInitialized } = useRequireAuth();
  const [whatsappConnected, setWhatsappConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    whatsappApi.getStatus()
      .then((res) => setWhatsappConnected(res.data.connected))
      .catch(() => setWhatsappConnected(false));
  }, [user]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
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
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to your Dashboard!</h2>

            {!user.emailVerified && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  Your email is not verified. Please check your inbox and verify your email to unlock all features.
                </p>
              </div>
            )}

            {user.emailVerified && whatsappConnected === false && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  Connect your WhatsApp Business Account to start sending campaigns.
                </p>
                <Link
                  href="/dashboard/settings"
                  className="ml-4 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 whitespace-nowrap"
                >
                  Connect Now
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Business Name:</dt>
                    <dd className="text-gray-900">{user.businessName || 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Subscription:</dt>
                    <dd className="text-gray-900 capitalize">{user.subscriptionTier}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status:</dt>
                    <dd className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email Verified:</dt>
                    <dd className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/campaigns"
                    className="block w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm font-medium"
                  >
                    Send Messages
                  </Link>
                  <Link
                    href="/dashboard/contacts"
                    className="block w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm font-medium"
                  >
                    Manage Contacts
                  </Link>
                  <Link
                    href="/dashboard/templates"
                    className="block w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm font-medium"
                  >
                    View Templates
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm font-medium"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
