'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Campaign, CampaignStats, campaignsApi } from '@/lib/api/campaigns';
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

function pct(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

export default function CampaignDetailPage() {
  const { user, isInitialized } = useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await campaignsApi.getById(id);
      setCampaign(res.data);
      setStats(res.data.stats);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;
    fetchCampaign();
  }, [user, fetchCampaign]);

  useEffect(() => {
    if (campaign?.status !== 'processing') return;

    const interval = setInterval(() => {
      fetchCampaign();
    }, 5000);

    return () => clearInterval(interval);
  }, [campaign?.status, fetchCampaign]);

  const handleAction = async (action: 'start' | 'pause' | 'cancel') => {
    try {
      setActionError('');
      const res = await campaignsApi[action](id);
      setCampaign(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e.response?.data?.message || `Failed to ${action} campaign`);
    }
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
          <button
            onClick={() => router.push('/dashboard/campaigns')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            &larr; Back to Campaigns
          </button>

          {campaign && (
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
              <StatusBadge status={campaign.status} />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{actionError}</p>
            <button
              onClick={() => setActionError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : campaign ? (
          <div className="space-y-6">
            {campaign.status === 'processing' && campaign.totalRecipients > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{pct(campaign.sentCount, campaign.totalRecipients)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct(campaign.sentCount, campaign.totalRecipients)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {campaign.sentCount} of {campaign.totalRecipients} sent
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Sent', value: stats?.sent ?? campaign.sentCount, color: 'text-blue-600' },
                { label: 'Delivered', value: stats?.delivered ?? campaign.deliveredCount, color: 'text-green-600' },
                { label: 'Failed', value: stats?.failed ?? campaign.failedCount, color: 'text-red-600' },
                { label: 'Read', value: stats?.read ?? campaign.readCount, color: 'text-purple-600' },
              ].map(({ label, value }) => {
                const total = stats?.total ?? campaign.totalRecipients;
                return (
                  <div key={label} className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">{label}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
                    {total > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {pct(value, total)}% of {total}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Template ID</dt>
                  <dd className="text-sm text-gray-900 font-mono mt-0.5">{campaign.templateId}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900 mt-0.5">
                    {new Date(campaign.createdAt).toLocaleString()}
                  </dd>
                </div>
                {campaign.scheduledAt && (
                  <div>
                    <dt className="text-sm text-gray-500">Scheduled At</dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {new Date(campaign.scheduledAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {campaign.startedAt && (
                  <div>
                    <dt className="text-sm text-gray-500">Started</dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {new Date(campaign.startedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {campaign.completedAt && (
                  <div>
                    <dt className="text-sm text-gray-500">Completed</dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {new Date(campaign.completedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex gap-3">
              {campaign.status === 'draft' && (
                <button
                  onClick={() => handleAction('start')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Campaign
                </button>
              )}
              {campaign.status === 'processing' && (
                <button
                  onClick={() => handleAction('pause')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pause
                </button>
              )}
              {(campaign.status === 'draft' ||
                campaign.status === 'processing' ||
                campaign.status === 'paused') && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
