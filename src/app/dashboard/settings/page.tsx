'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { DashboardNav } from '@/components/DashboardNav';
import { whatsappApi, type WhatsAppStatus } from '@/lib/api/whatsapp';
import { connectWhatsAppSchema, type ConnectWhatsAppFormInput } from '@/lib/validations/settings';

type QualityRating = 'GREEN' | 'YELLOW' | 'RED';

function QualityBadge({ rating }: { rating: string | null }) {
  if (!rating) return null;
  const styles: Record<QualityRating, string> = {
    GREEN: 'bg-green-100 text-green-800',
    YELLOW: 'bg-yellow-100 text-yellow-800',
    RED: 'bg-red-100 text-red-800',
  };
  const style = styles[rating as QualityRating] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {rating}
    </span>
  );
}

function ConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConnectWhatsAppFormInput>({
    resolver: zodResolver(connectWhatsAppSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ConnectWhatsAppFormInput) => {
    try {
      setIsLoading(true);
      setError('');
      await whatsappApi.connect(data);
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect WhatsApp account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Connect WhatsApp Business Account</h2>
        </div>

        <div className="px-6 pt-4 pb-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm font-medium text-blue-900 mb-2">Where to find these values:</p>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to <strong>Meta Business Suite → WhatsApp Manager</strong></li>
            <li>Select your account — the <strong>WABA ID</strong> appears at the top</li>
            <li>Under <strong>Phone Numbers</strong>, click your number — copy the <strong>Phone Number ID</strong></li>
            <li>Go to <strong>Meta for Developers → Your App → System Users</strong> to generate a <strong>permanent access token</strong> with <code>whatsapp_business_messaging</code> permission</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="wabaId" className="block text-sm font-medium text-gray-700">
              WhatsApp Business Account ID (WABA ID) *
            </label>
            <input
              {...register('wabaId')}
              id="wabaId"
              type="text"
              placeholder="123456789012345"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.wabaId && (
              <p className="mt-1 text-sm text-red-600">{errors.wabaId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700">
              Phone Number ID *
            </label>
            <input
              {...register('phoneNumberId')}
              id="phoneNumberId"
              type="text"
              placeholder="987654321098765"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.phoneNumberId && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumberId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
              Permanent Access Token *
            </label>
            <input
              {...register('accessToken')}
              id="accessToken"
              type="password"
              placeholder="EAAxxxxxxxx..."
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.accessToken && (
              <p className="mt-1 text-sm text-red-600">{errors.accessToken.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use a system user token, not a short-lived user token.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DisconnectConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Disconnect WhatsApp</h2>
        <p className="text-sm text-gray-600 mb-6">
          This will remove your WhatsApp credentials. Any pending campaigns will be paused. You can reconnect at any time.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isInitialized } = useRequireAuth();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [error, setError] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      setError('');
      const res = await whatsappApi.getStatus();
      setStatus(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load WhatsApp status');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user]);

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await whatsappApi.disconnect();
      setShowDisconnectModal(false);
      setSuccessMessage('WhatsApp account disconnected successfully.');
      await fetchStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect');
      setShowDisconnectModal(false);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnectSuccess = async () => {
    setSuccessMessage('WhatsApp account connected successfully!');
    await fetchStatus();
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
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={() => setError('')} className="mt-1 text-sm text-red-600 underline">
                Dismiss
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{successMessage}</p>
              <button onClick={() => setSuccessMessage('')} className="mt-1 text-sm text-green-600 underline">
                Dismiss
              </button>
            </div>
          )}

          {/* WhatsApp Connection Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Business Account</h2>

            {isLoadingStatus ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading status...</span>
              </div>
            ) : status?.connected ? (
              <>
                {(status.qualityRating === 'YELLOW' || status.qualityRating === 'RED') && (
                  <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
                    <p className="text-sm font-medium text-yellow-800">
                      {status.qualityRating === 'RED'
                        ? 'Your WhatsApp account quality is RED. Sending may be restricted. Reduce message frequency and ensure all contacts have opted in.'
                        : 'Your WhatsApp account quality is YELLOW. Monitor your sending patterns to avoid restrictions.'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div className="flex gap-4">
                        <dt className="text-gray-500 w-36">Phone Number:</dt>
                        <dd className="text-gray-900 font-medium">{status.phoneNumber}</dd>
                      </div>
                      <div className="flex gap-4">
                        <dt className="text-gray-500 w-36">Quality Rating:</dt>
                        <dd><QualityBadge rating={status.qualityRating} /></dd>
                      </div>
                      <div className="flex gap-4">
                        <dt className="text-gray-500 w-36">Messaging Tier:</dt>
                        <dd className="text-gray-900">{status.messagingLimitTier ?? '—'}</dd>
                      </div>
                      <div className="flex gap-4">
                        <dt className="text-gray-500 w-36">Connected Since:</dt>
                        <dd className="text-gray-900">
                          {status.connectedAt
                            ? new Date(status.connectedAt).toLocaleDateString()
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <button
                    onClick={() => setShowDisconnectModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                    Not Connected
                  </span>
                  <p className="text-sm text-gray-600">
                    Connect your WhatsApp Business Account to start sending campaigns.
                  </p>
                </div>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Connect WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={handleConnectSuccess}
      />

      <DisconnectConfirmModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnect}
        isLoading={isDisconnecting}
      />
    </div>
  );
}
