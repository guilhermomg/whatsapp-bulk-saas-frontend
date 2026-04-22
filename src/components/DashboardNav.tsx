'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { whatsappApi } from '@/lib/api/whatsapp';

export function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [qualityRating, setQualityRating] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (!user) return;
    whatsappApi.getStatus()
      .then(({ success, data }) => {
        if (success && data?.qualityRating) {
          setQualityRating(data.qualityRating);
        }
      })
      .catch(() => {});
  }, [user]);

  const qualityBadge = () => {
    if (qualityRating === 'GREEN') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Connected
        </span>
      );
    }
    if (qualityRating === 'YELLOW') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-700">
          <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
          Quality: YELLOW
        </span>
      );
    }
    if (qualityRating === 'RED') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          Quality: RED
        </span>
      );
    }
    return null;
  };

  return (
    <div>
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
                <Link
                  href="/dashboard/settings"
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${isActive('/dashboard/settings')
                      ? 'text-gray-900 border-blue-600'
                      : 'text-gray-700 border-transparent hover:text-gray-900'
                    }`}
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              {qualityBadge()}
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
      {(qualityRating === 'YELLOW' || qualityRating === 'RED') && (
        <div className={`px-4 py-2 text-sm text-center font-medium ${
          qualityRating === 'RED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {qualityRating === 'RED'
            ? 'Your WhatsApp account quality is RED. Sending may be restricted. Go to Settings to review.'
            : 'Your WhatsApp account quality is YELLOW. Monitor your sending patterns to avoid restrictions.'}
          {' '}
          <Link href="/dashboard/settings" className="underline font-semibold">View Settings</Link>
        </div>
      )}
    </div>
  );
}
