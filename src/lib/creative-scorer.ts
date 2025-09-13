import { Creative, CreativeScore } from './types';
import { scoreCreativeWithML, checkMLServiceHealth } from '@/services/ml-service';

// Keywords that typically perform well in marketing copy
const POWER_WORDS = [
  'exclusive', 'limited', 'free', 'guaranteed', 'instant', 'proven', 'secret',
  'amazing', 'breakthrough', 'revolutionary', 'ultimate', 'perfect', 'premium',
  'professional', 'certified', 'trusted', 'recommended', 'popular', 'bestseller'
];

const URGENCY_WORDS = [
  'now', 'today', 'immediately', 'quickly', 'fast', 'urgent', 'hurry',
  'limited time', 'while supplies last', 'don\'t wait', 'act now', 'expires',
  'deadline', 'final', 'last chance', 'ending soon'
];

const CTA_WORDS = [
  'buy', 'shop', 'order', 'get', 'download', 'subscribe', 'join', 'start',
  'try', 'discover', 'learn', 'claim', 'grab', 'secure', 'book', 'reserve',
  'sign up', 'register', 'contact', 'call', 'click', 'tap', 'visit'
];

const EMOTIONAL_WORDS = [
  'love', 'hate', 'fear', 'excited', 'thrilled', 'amazed', 'surprised',
  'confident', 'proud', 'happy', 'satisfied', 'frustrated', 'worried',
  'concerned', 'relief', 'peace', 'comfort', 'security', 'freedom'
];

// Enhanced scoring function that uses ML when available
export async function scoreCreative(creative: Creative): Promise<CreativeScore> {
  try {
    // Check if ML service is available and use it for scoring
    const mlHealthy = await checkMLServiceHealth();
    if (mlHealthy) {
      const mlScore = await scoreCreativeWithML(creative);
      return mlScore;
    }
  } catch (error) {
    console.warn('ML service unavailable, falling back to rule-based scoring:', error);
  }
  
  // Fallback to rule-based scoring
  return scoreCreativeRuleBased(creative);
}

// Original rule-based scoring (renamed)
function scoreCreativeRuleBased(creative: Creative): CreativeScore {
  const text = `${creative.title} ${creative.description} ${creative.callToAction}`.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  // Clarity Score (0-100)
  let clarityScore = 50; // Base score
  
  // Penalize if too short or too long
  if (wordCount < 10) clarityScore -= 20;
  else if (wordCount > 50) clarityScore -= 15;
  else if (wordCount >= 15 && wordCount <= 30) clarityScore += 20;
  
  // Check for jargon or complex words (simplified check)
  const complexWords = words.filter(word => word.length > 12).length;
  if (complexWords > 3) clarityScore -= 15;
  
  // Check sentence structure (simple check for periods/exclamation marks)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 1 && wordCount > 20) clarityScore -= 10; // Run-on sentence
  
  clarityScore = Math.max(0, Math.min(100, clarityScore));
  
  // Urgency Score (0-100)
  let urgencyScore = 0;
  
  URGENCY_WORDS.forEach(urgencyWord => {
    if (text.includes(urgencyWord)) {
      urgencyScore += 15;
    }
  });
  
  // Check for numbers/percentages (discounts, quantities)
  const numberMatches = text.match(/\d+%|\d+\s*(off|discount|save)/gi);
  if (numberMatches) urgencyScore += 20;
  
  // Check for time-sensitive language
  if (text.includes('sale') || text.includes('offer')) urgencyScore += 10;
  
  urgencyScore = Math.min(100, urgencyScore);
  
  // Relevance Score (0-100)
  let relevanceScore = 30; // Base score
  
  // Check for power words
  POWER_WORDS.forEach(powerWord => {
    if (text.includes(powerWord)) {
      relevanceScore += 8;
    }
  });
  
  // Check for emotional words
  EMOTIONAL_WORDS.forEach(emotionalWord => {
    if (text.includes(emotionalWord)) {
      relevanceScore += 6;
    }
  });
  
  // Check for benefit-focused language
  const benefitWords = ['you', 'your', 'benefit', 'advantage', 'solution', 'result'];
  benefitWords.forEach(word => {
    if (text.includes(word)) relevanceScore += 5;
    }
  );
  
  relevanceScore = Math.min(100, relevanceScore);
  
  // Call to Action Score (0-100)
  let ctaScore = 0;
  
  // Check if CTA is present and clear
  if (creative.callToAction && creative.callToAction.trim().length > 0) {
    ctaScore += 30;
    
    const ctaText = creative.callToAction.toLowerCase();
    
    // Check for action words
    CTA_WORDS.forEach(ctaWord => {
      if (ctaText.includes(ctaWord)) {
        ctaScore += 15;
      }
    });
    
    // Check CTA length (should be concise)
    const ctaWords = ctaText.split(/\s+/).length;
    if (ctaWords >= 2 && ctaWords <= 4) ctaScore += 15;
    else if (ctaWords > 6) ctaScore -= 10;
    
    // Check for imperative mood (starts with action word)
    const startsWithAction = CTA_WORDS.some(word => ctaText.trim().startsWith(word));
    if (startsWithAction) ctaScore += 10;
  }
  
  ctaScore = Math.min(100, ctaScore);
  
  // Calculate overall score
  const overallScore = Math.round((clarityScore * 0.3 + urgencyScore * 0.2 + relevanceScore * 0.3 + ctaScore * 0.2));
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (clarityScore < 60) {
    suggestions.push("Simplify your language and use shorter sentences for better clarity");
  }
  
  if (urgencyScore < 40) {
    suggestions.push("Add time-sensitive language or limited-time offers to create urgency");
  }
  
  if (relevanceScore < 50) {
    suggestions.push("Include more power words and focus on customer benefits");
  }
  
  if (ctaScore < 50) {
    suggestions.push("Strengthen your call-to-action with clear, actionable language");
  }
  
  if (wordCount < 10) {
    suggestions.push("Expand your copy to include more compelling details");
  } else if (wordCount > 40) {
    suggestions.push("Consider shortening your copy for better engagement");
  }
  
  // Channel-specific suggestions
  if (creative.channel === 'facebook' || creative.channel === 'instagram') {
    if (!text.includes('emoji') && suggestions.length < 3) {
      suggestions.push("Consider adding emojis for social media engagement");
    }
  }
  
  if (creative.channel === 'google-ads') {
    if (creative.title && creative.title.length > 30) {
      suggestions.push("Google Ads headlines work best under 30 characters");
    }
  }
  
  return {
    overall: overallScore,
    breakdown: {
      clarity: clarityScore,
      urgency: urgencyScore,
      relevance: relevanceScore,
      callToAction: ctaScore,
    },
    suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
  };
}

export async function compareCreatives(creatives: Creative[]): Promise<Creative[]> {
  const scoredCreatives = await Promise.all(
    creatives.map(async (creative) => ({
      ...creative,
      score: await scoreCreative(creative),
    }))
  );
  
  return scoredCreatives.sort((a, b) => (b.score?.overall || 0) - (a.score?.overall || 0));
}

export function generateCreativeSuggestions(channel: string, productName: string, category: string): string[] {
  const suggestions = [];
  
  const channelSpecific = {
    facebook: [
      `🚀 Discover ${productName} - Transform Your ${category} Experience!`,
      `${productName}: The #1 Choice for Smart ${category} Lovers. Get Yours Today!`,
      `Why settle for ordinary? Upgrade to ${productName} and see the difference!`
    ],
    instagram: [
      `✨ ${productName} - Because You Deserve the Best ✨`,
      `📸 Show off your new ${productName}! Tag us for a chance to win!`,
      `🔥 ${productName} is trending! Join thousands of happy customers`
    ],
    'google-ads': [
      `Buy ${productName} - Free Shipping & 30-Day Returns`,
      `${productName} Sale - Save Up to 40% Today Only`,
      `Top-Rated ${productName} - Order Now & Save`
    ],
    linkedin: [
      `Boost Your Professional ${category} Game with ${productName}`,
      `Industry Leaders Choose ${productName}. Here's Why You Should Too.`,
      `${productName}: The Professional's Choice for ${category}`
    ],
  };
  
  return channelSpecific[channel as keyof typeof channelSpecific] || [
    `Experience the difference with ${productName}`,
    `${productName} - Quality you can trust`,
    `Upgrade your ${category} with ${productName} today`
  ];
}