import { Creative, CreativeScore } from '@/lib/types';
import { apiClient, isBackendAvailable } from '@/lib/api';

export const scoreCreative = async (creative: Creative): Promise<CreativeScore> => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      const data = await apiClient.scoreCreative({
        channel: creative.channel,
        title: creative.title,
        description: creative.description,
        cta: creative.callToAction,
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to score creative');
      }

      return data.score;
    } catch (error) {
      console.warn('Backend scoring failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API, then demo mode
  try {
    const response = await fetch('/api/creative-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creative }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success) {
        return data.score;
      }
    }
  } catch (error) {
    console.warn('Local API failed, using demo mode');
  }

  // Final fallback to demo mode
  const demoMode = (await import('@/lib/demo-mode')).default;
  return demoMode.generateCreativeScore(creative);
};

export const generateSuggestions = async (
  channel: string,
  productName: string = 'Your Product',
  category: string = 'electronics'
): Promise<string[]> => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      const data = await apiClient.getCreativeSuggestions(channel, productName, category);

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      return data.suggestions;
    } catch (error) {
      console.warn('Backend suggestions failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API
  const response = await fetch(
    `/api/creative-score?channel=${channel}&productName=${encodeURIComponent(productName)}&category=${category}`
  );

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate suggestions');
  }

  return data.suggestions;
};