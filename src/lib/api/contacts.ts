import apiClient from '../axios';
import { CreateContactInput, UpdateContactInput } from '@/lib/validations/contact';
import { useAuthStore } from '@/stores/authStore';

export interface Contact {
  id: string;
  userId: string;
  phone: string;
  name?: string;
  email?: string;
  optedIn: boolean;
  optedInAt?: string;
  optedOutAt?: string;
  optInSource?: 'manual' | 'csv' | 'api' | 'webhook';
  tags: string[];
  metadata?: Record<string, unknown>;
  isBlocked: boolean;
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsListResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ContactResponse {
  success: boolean;
  data: Contact;
}

export const contactsApi = {
  create: async (data: CreateContactInput): Promise<ContactResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<ContactResponse>('/contacts', {
      ...data,
      userId: user?.id,
    });
    return response.data;
  },

  getById: async (id: string): Promise<ContactResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.get<ContactResponse>(`/contacts/${id}?userId=${user?.id}`);
    return response.data;
  },

  list: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    optedIn?: boolean;
    tags?: string[];
    sortBy?: 'createdAt' | 'name' | 'phone' | 'updatedAt';
    order?: 'asc' | 'desc';
  }): Promise<ContactsListResponse> => {
    const { user } = useAuthStore.getState();
    const queryParams = new URLSearchParams();
    
    queryParams.append('userId', user?.id || '');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.optedIn !== undefined) queryParams.append('optedIn', params.optedIn.toString());
    if (params?.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const response = await apiClient.get<ContactsListResponse>(
      `/contacts?${queryParams.toString()}`
    );
    return response.data;
  },

  update: async (id: string, data: UpdateContactInput): Promise<ContactResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.put<ContactResponse>(`/contacts/${id}`, {
      ...data,
      userId: user?.id,
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/contacts/${id}?userId=${user?.id}`);
    return response.data;
  },

  optIn: async (id: string): Promise<ContactResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<ContactResponse>(`/contacts/${id}/opt-in`, { userId: user?.id });
    return response.data;
  },

  optOut: async (id: string): Promise<ContactResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<ContactResponse>(`/contacts/${id}/opt-out`, { userId: user?.id });
    return response.data;
  },

  bulkOptIn: async (contactIds: string[]): Promise<{ success: boolean; message: string }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/contacts/bulk-opt-in',
      { contactIds, userId: user?.id }
    );
    return response.data;
  },

  bulkOptOut: async (contactIds: string[]): Promise<{ success: boolean; message: string }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/contacts/bulk-opt-out',
      { contactIds, userId: user?.id }
    );
    return response.data;
  },

  updateTags: async (id: string, tags: string[]): Promise<ContactResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.patch<ContactResponse>(`/contacts/${id}/tags`, { tags, userId: user?.id });
    return response.data;
  },

  bulkTag: async (contactIds: string[], tags: string[]): Promise<{ success: boolean; message: string }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/contacts/bulk-tag',
      { contactIds, tags, userId: user?.id }
    );
    return response.data;
  },

  importCsv: async (file: File): Promise<{ success: boolean; imported: number; errors: string[] }> => {
    const { user } = useAuthStore.getState();
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; imported: number; errors: string[] }>(
      `/contacts/import-csv?userId=${user?.id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  exportCsv: async (): Promise<Blob> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.get(`/contacts/export-csv?userId=${user?.id}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
