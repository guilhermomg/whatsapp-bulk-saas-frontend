import apiClient from '../axios';

export interface Campaign {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'paused';
  messageType: string;
  messageContent: { contactFilter?: { tags?: string[] } };
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  readCount: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  total: number;
}

export interface CampaignsListResponse {
  success: boolean;
  data: Campaign[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CampaignResponse {
  success: boolean;
  data: Campaign;
}

export interface CampaignDetailResponse {
  success: boolean;
  data: Campaign & { stats: CampaignStats };
}

export const campaignsApi = {
  list: async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<CampaignsListResponse> => {
    const response = await apiClient.get<CampaignsListResponse>('/campaigns', { params });
    return response.data;
  },

  getById: async (id: string): Promise<CampaignDetailResponse> => {
    const response = await apiClient.get<CampaignDetailResponse>(`/campaigns/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    templateId: string;
    contactFilter?: { tags?: string[] };
    scheduledAt?: string;
  }): Promise<CampaignResponse> => {
    const response = await apiClient.post<CampaignResponse>('/campaigns', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      templateId?: string;
      contactFilter?: { tags?: string[] };
      scheduledAt?: string;
    },
  ): Promise<CampaignResponse> => {
    const response = await apiClient.put<CampaignResponse>(`/campaigns/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  start: async (id: string): Promise<CampaignResponse> => {
    const response = await apiClient.post<CampaignResponse>(`/campaigns/${id}/start`);
    return response.data;
  },

  pause: async (id: string): Promise<CampaignResponse> => {
    const response = await apiClient.post<CampaignResponse>(`/campaigns/${id}/pause`);
    return response.data;
  },

  cancel: async (id: string): Promise<CampaignResponse> => {
    const response = await apiClient.post<CampaignResponse>(`/campaigns/${id}/cancel`);
    return response.data;
  },
};
