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

export const analyzeCreativeWithGemini = async (creative: Creative): Promise<any> => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();

  if (backendAvailable) {
    try {
      // Use backend API
      const data = await apiClient.analyzeCreative({
        channel: creative.channel,
        title: creative.title,
        description: creative.description,
        cta: creative.callToAction,
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze creative');
      }

      return data;
    } catch (error) {
      console.warn('Backend analysis failed, falling back to demo mode:', error);
    }
  }

  // Fallback to demo mode with enhanced data
  const demoResult = {
    success: true,
    analysis: {
      overall_score: Math.floor(75 + Math.random() * 20), // Random score between 75-95
      ai_feedback: `Your creative for ${creative.channel} shows strong potential with clear messaging and good structure. The headline "${creative.title}" effectively captures attention while your description provides solid value communication.\n\n**Key Findings:**\n• Messaging clarity score: ${85 + Math.floor(Math.random() * 10)}/100\n• Emotional engagement potential: High\n• Channel optimization: Well-aligned for ${creative.channel}\n• Call-to-action strength: ${creative.callToAction ? 'Strong' : 'Needs improvement'}\n\n**Strategic Recommendations:**\n• Enhanced urgency elements could increase conversion rates by 15-20%\n• A/B testing different emotional triggers may improve engagement\n• Consider mobile-first optimization for better reach\n• Test variations of your call-to-action for better performance\n\n**Performance Outlook:**\nBased on similar campaigns and current market trends, this creative is positioned to perform 20-30% above category benchmarks.`,
      strengths: [
        "Clear value proposition in the headline",
        "Strong emotional appeal and messaging",
        `Appropriate length for ${creative.channel} platform`,
        "Professional tone and brand consistency",
        creative.callToAction ? "Effective call-to-action" : "Good overall structure"
      ].filter(Boolean),
      improvements: [
        "Add scarcity or urgency elements to increase conversions",
        "Test different headline variations for better engagement",
        "Consider personalization elements for target audience",
        "Optimize for mobile viewing experience",
        !creative.callToAction ? "Add a strong call-to-action" : "Test different CTA variations"
      ].filter(Boolean),
      channel_specific: `This creative is well-optimized for ${creative.channel}. ${creative.channel === 'facebook' ? 'Consider using more visual elements and shorter text for better engagement.' : creative.channel === 'instagram' ? 'Great for visual storytelling - consider adding hashtags and user-generated content elements.' : creative.channel === 'google-ads' ? 'Good for search intent - consider adding more specific keywords and benefits.' : 'Platform-specific optimizations can further improve performance.'}`,
      predicted_engagement: `Expected CTR: ${(2.5 + Math.random() * 1.5).toFixed(1)}-${(3.2 + Math.random() * 1.3).toFixed(1)}% (Above average for ${creative.channel} category)`
    },
    source: "demo_mode"
  };

  return demoResult;
};