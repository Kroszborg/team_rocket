import { Creative, CreativeScore } from '@/lib/types';

export const scoreCreative = async (creative: Creative): Promise<CreativeScore> => {
  const response = await fetch('/api/creative-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creative }),
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to score creative');
  }

  return data.score;
};

export const generateSuggestions = async (
  channel: string,
  productName: string = 'Your Product',
  category: string = 'electronics'
): Promise<string[]> => {
  const response = await fetch(
    `/api/creative-score?channel=${channel}&productName=${encodeURIComponent(productName)}&category=${category}`
  );

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate suggestions');
  }

  return data.suggestions;
};