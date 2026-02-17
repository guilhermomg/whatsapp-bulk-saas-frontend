import { z } from 'zod';

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number. Use E.164 format (e.g., +1234567890)');

export const createContactSchema = z.object({
  phone: phoneSchema,
  name: z.union([
    z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    z.literal(''),
  ]).optional(),
  email: z.union([
    z.string().email('Invalid email address'),
    z.literal(''),
  ]).optional(),
  tags: z.array(z.string()).optional(),
  optedIn: z.boolean().optional(),
});

export const updateContactSchema = z.object({
  phone: phoneSchema.optional(),
  name: z.union([
    z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    z.literal(''),
  ]).optional(),
  email: z.union([
    z.string().email('Invalid email address'),
    z.literal(''),
  ]).optional(),
  tags: z.array(z.string()).optional(),
  optedIn: z.boolean().optional(),
});

export const bulkTagSchema = z.object({
  contactIds: z.array(z.string().uuid()).min(1, 'At least one contact is required'),
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type BulkTagInput = z.infer<typeof bulkTagSchema>;
