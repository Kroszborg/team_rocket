import { MarketingChannel } from '@/lib/types';

export const MARKETING_CHANNELS: { value: MarketingChannel; label: string }[] = [
  { value: 'facebook', label: 'Facebook Ads' },
  { value: 'instagram', label: 'Instagram Ads' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'youtube', label: 'YouTube Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'twitter', label: 'Twitter Ads' },
  { value: 'email', label: 'Email Marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'influencer', label: 'Influencer Marketing' },
];

export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
} as const;

export const SCORE_COLORS = {
  excellent: 'text-green-600',
  good: 'text-yellow-600',
  poor: 'text-red-600',
} as const;

export const SCORE_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Needs Work',
} as const;