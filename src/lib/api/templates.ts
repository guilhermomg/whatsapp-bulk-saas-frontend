import apiClient from '../axios';
import { CreateTemplateInput, UpdateTemplateInput } from '@/lib/validations/template';
import { useAuthStore } from '@/stores/authStore';

export interface TemplateComponent {
  type?: 'document' | 'text' | 'image' | 'video';
  text?: string;
  url?: string;
}

export interface TemplateButton {
  type: 'url' | 'phone' | 'quick_reply';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  language: string;
  category: 'marketing' | 'utility' | 'authentication';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  whatsappTemplateId?: string;
  components: {
    header?: TemplateComponent;
    body: { text: string; variables?: string[] };
    footer?: TemplateComponent;
    buttons?: TemplateButton[];
  };
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesListResponse {
  success: boolean;
  data: Template[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface TemplateResponse {
  success: boolean;
  data: Template;
}

export interface SubmitTemplateResponse {
  success: boolean;
  data: {
    templateId: string;
    whatsappTemplateId: string;
    status: string;
    message: string;
  };
}

export interface PreviewTemplateResponse {
  success: boolean;
  data: {
    header?: string;
    body: string;
    footer?: string;
    buttons?: TemplateButton[];
  };
}

export const templatesApi = {
  list: async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<TemplatesListResponse> => {
    const { user } = useAuthStore.getState();
    const queryParams = new URLSearchParams();

    queryParams.append('userId', user?.id || '');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const response = await apiClient.get<TemplatesListResponse>(
      `/templates?${queryParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<TemplateResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.get<TemplateResponse>(
      `/templates/${id}?userId=${user?.id}`
    );
    return response.data;
  },

  create: async (data: CreateTemplateInput): Promise<TemplateResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<TemplateResponse>('/templates', {
      ...data,
      userId: user?.id,
    });
    return response.data;
  },

  update: async (id: string, data: UpdateTemplateInput): Promise<TemplateResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.put<TemplateResponse>(`/templates/${id}`, {
      ...data,
      userId: user?.id,
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/templates/${id}?userId=${user?.id}`
    );
    return response.data;
  },

  preview: async (
    id: string,
    parameters: Record<string, string | number>,
  ): Promise<PreviewTemplateResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<PreviewTemplateResponse>(
      `/templates/${id}/preview?userId=${user?.id}`,
      { parameters }
    );
    return response.data;
  },

  validateParameters: async (
    id: string,
    parameters: Record<string, string | number>,
  ): Promise<{ success: boolean; data: { valid: boolean; errors?: string[] } }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<{ success: boolean; data: { valid: boolean; errors?: string[] } }>(
      `/templates/${id}/validate?userId=${user?.id}`,
      { parameters }
    );
    return response.data;
  },

  submit: async (
    id: string,
    wabaId: string,
    accessToken: string,
  ): Promise<SubmitTemplateResponse> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<SubmitTemplateResponse>(
      `/templates/${id}/submit?userId=${user?.id}`,
      { wabaId, accessToken }
    );
    return response.data;
  },

  sync: async (): Promise<{ success: boolean; data: { synced: number; templates: Template[] } }> => {
    const { user } = useAuthStore.getState();
    const response = await apiClient.post<{ success: boolean; data: { synced: number; templates: Template[] } }>(
      `/templates/sync?userId=${user?.id}`,
      {}
    );
    return response.data;
  },
};
