'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface DashboardNavProps {
  title?: string;
}

export function DashboardNav({ title }: DashboardNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">WhatsApp Bulk SaaS</h1>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${isActive('/dashboard')
                    ? 'text-gray-900 border-blue-600'
                    : 'text-gray-700 border-transparent hover:text-gray-900'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/contacts"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${isActive('/dashboard/contacts')
                    ? 'text-gray-900 border-blue-600'
                    : 'text-gray-700 border-transparent hover:text-gray-900'
                  }`}
              >
                Contacts
              </Link>
              <Link
                href="/dashboard/templates"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${isActive('/dashboard/templates')
                    ? 'text-gray-900 border-blue-600'
                    : 'text-gray-700 border-transparent hover:text-gray-900'
                  }`}
              >
                Templates
              </Link>
              <Link
                href="/dashboard/campaigns"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${isActive('/dashboard/campaigns')
                    ? 'text-gray-900 border-blue-600'
                    : 'text-gray-700 border-transparent hover:text-gray-900'
                  }`}
              >
                Campaigns
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
