import { z } from 'zod';

export const templateComponentHeaderSchema = z.object({
  type: z.enum(['text', 'image', 'video', 'document']).optional(),
  text: z.string().max(60, 'Header text must be less than 60 characters').optional(),
  url: z.string().url('Invalid URL').optional(),
}).optional();

export const templateComponentBodySchema = z.object({
  text: z.string()
    .min(1, 'Body text is required')
    .max(1024, 'Body text must be less than 1024 characters'),
  variables: z.array(z.string()).optional(),
});

export const templateComponentFooterSchema = z.object({
  text: z.string().max(60, 'Footer text must be less than 60 characters').optional(),
}).optional();

export const templateButtonSchema = z.object({
  type: z.enum(['url', 'phone', 'quick_reply']),
  text: z.string()
    .min(1, 'Button text is required')
    .max(20, 'Button text must be less than 20 characters'),
  url: z.string().url('Invalid URL').optional(),
  phone_number: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
});

export const createTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Template name is required')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  category: z.enum(['marketing', 'utility', 'authentication'])
    .refine((val) => ['marketing', 'utility', 'authentication'].includes(val), {
      message: 'Select a valid category',
    }),
  language: z.string().default('en_US').optional(),
  components: z.object({
    header: templateComponentHeaderSchema,
    body: templateComponentBodySchema,
    footer: templateComponentFooterSchema,
    buttons: z.array(templateButtonSchema).max(3, 'Maximum 3 buttons allowed').optional(),
  }),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateComponents = z.infer<typeof createTemplateSchema>['components'];
