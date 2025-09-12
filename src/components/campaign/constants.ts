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

export const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: '📱 Electronics', icon: '📱' },
  { value: 'fashion', label: '👕 Fashion', icon: '👕' },
  { value: 'health', label: '🏥 Health & Beauty', icon: '🏥' },
  { value: 'home', label: '🏠 Home & Garden', icon: '🏠' },
  { value: 'sports', label: '⚽ Sports & Outdoors', icon: '⚽' },
  { value: 'software', label: '💻 Software', icon: '💻' },
  { value: 'education', label: '📚 Education', icon: '📚' },
] as const;