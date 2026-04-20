import apiClient from '../axios';
import { useAuthStore } from '@/stores/authStore';

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber: string | null;
  qualityRating: string | null;
  messagingLimitTier: string | null;
  connectedAt: string | null;
}

export interface ConnectWhatsAppInput {
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
}

export interface ConnectWhatsAppResponse {
  success: boolean;
  message: string;
  data: {
    whatsapp: {
      phoneNumber: string;
      verifiedName: string;
      qualityRating: string;
      messagingLimitTier: string;
      connectedAt: string;
    };
  };
}

export const whatsappApi = {
  getStatus: async (): Promise<{ success: boolean; data: WhatsAppStatus }> => {
    const response = await apiClient.get('/users/me/whatsapp');
    return response.data;
  },

  connect: async (input: ConnectWhatsAppInput): Promise<ConnectWhatsAppResponse> => {
    const response = await apiClient.post('/users/connect-whatsapp', input);
    return response.data;
  },

  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/users/me/whatsapp');
    return response.data;
  },
};
