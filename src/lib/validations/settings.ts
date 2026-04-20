import { z } from 'zod';

export const connectWhatsAppSchema = z.object({
  wabaId: z.string().min(1, 'WABA ID is required'),
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  accessToken: z.string().min(1, 'Access token is required'),
});

export type ConnectWhatsAppFormInput = z.infer<typeof connectWhatsAppSchema>;
