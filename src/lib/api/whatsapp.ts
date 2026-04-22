import apiClient from '../axios';

export interface WhatsAppStatusData {
  connected: boolean;
  qualityRating: string | null;
  phoneNumberId?: string;
  wabaId?: string;
  messagingLimit?: string;
}

export interface WhatsAppStatusResponse {
  success: boolean;
  data: WhatsAppStatusData;
}

export const whatsappApi = {
  getStatus: (): Promise<WhatsAppStatusResponse> =>
    apiClient.get('/users/whatsapp-status').then((res) => res.data),
};
