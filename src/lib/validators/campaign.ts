import { z } from 'zod';

export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name too long'),
  product: z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Product category is required'),
    price: z.number().positive('Price must be positive'),
    description: z.string().min(1, 'Product description is required'),
    targetMargin: z.number().min(0).max(100, 'Target margin must be between 0-100%'),
  }),
  targeting: z.object({
    ageRange: z.object({
      min: z.number().min(13, 'Minimum age must be at least 13').max(80),
      max: z.number().min(18).max(90, 'Maximum age cannot exceed 90'),
    }),
    gender: z.enum(['male', 'female', 'all']),
    interests: z.array(z.string()).max(20, 'Too many interests specified'),
    location: z.array(z.string()).max(50, 'Too many locations specified'),
    income: z.enum(['low', 'medium', 'high', 'all']),
  }),
  budget: z.object({
    total: z.number().positive('Budget must be positive').max(1000000, 'Budget too large'),
    duration: z.number().positive('Duration must be positive').max(365, 'Duration cannot exceed 365 days'),
    channels: z.record(z.string(), z.number().min(0)),
  }),
  channels: z.object({
    preferred: z.array(z.string()),
    avoided: z.array(z.string()),
  }),
  creatives: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    callToAction: z.string(),
    channel: z.string(),
  })).optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;