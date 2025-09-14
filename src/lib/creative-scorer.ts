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
    console.warn(':', error);
  }
  
  // Fallback to rule-based scoring
  return scoreCreativeRuleBased(creative);
}

// Enhanced rule-based scoring optimized for hackathon demo
function scoreCreativeRuleBased(creative: Creative): CreativeScore {
  const text = `${creative.title} ${creative.description} ${creative.callToAction}`.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Clarity Score (0-100) - More generous scoring
  let clarityScore = 75; // Higher base score

  // Adjust based on word count (more lenient)
  if (wordCount < 5) clarityScore -= 15;
  else if (wordCount > 60) clarityScore -= 10;
  else if (wordCount >= 10 && wordCount <= 40) clarityScore += 15;

  // Check for complex words (less harsh penalty)
  const complexWords = words.filter(word => word.length > 15).length;
  if (complexWords > 5) clarityScore -= 8;

  // Bonus for good structure
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 2 && sentences.length <= 4) clarityScore += 10;

  clarityScore = Math.max(60, Math.min(100, clarityScore)); // Minimum 60

  // Urgency Score (0-100) - More generous base scoring
  let urgencyScore = 45; // Higher base for better scores

  URGENCY_WORDS.forEach(urgencyWord => {
    if (text.includes(urgencyWord)) {
      urgencyScore += 18;
    }
  });

  // Check for numbers/percentages (discounts, quantities)
  const numberMatches = text.match(/\d+%|\d+\s*(off|discount|save|free)/gi);
  if (numberMatches) urgencyScore += 25;

  // Check for time-sensitive language
  if (text.includes('sale') || text.includes('offer') || text.includes('deal')) urgencyScore += 15;

  // Bonus for strong action words
  if (text.includes('now') || text.includes('today') || text.includes('get')) urgencyScore += 10;

  urgencyScore = Math.min(100, urgencyScore);

  // Relevance Score (0-100) - Higher base score
  let relevanceScore = 65; // Much higher base score
  
  // Check for power words (more generous scoring)
  POWER_WORDS.forEach(powerWord => {
    if (text.includes(powerWord)) {
      relevanceScore += 5;
    }
  });

  // Check for emotional words
  EMOTIONAL_WORDS.forEach(emotionalWord => {
    if (text.includes(emotionalWord)) {
      relevanceScore += 4;
    }
  });

  // Check for benefit-focused language (more generous)
  const benefitWords = ['you', 'your', 'benefit', 'advantage', 'solution', 'result', 'best', 'better', 'improve'];
  benefitWords.forEach(word => {
    if (text.includes(word)) relevanceScore += 3;
  });

  // Bonus for having a clear product focus
  if (creative.title && creative.title.length > 5) relevanceScore += 10;

  relevanceScore = Math.min(100, relevanceScore);

  // Call to Action Score (0-100) - Much more generous
  let ctaScore = 50; // Start with a decent base score

  // Check if CTA is present and clear
  if (creative.callToAction && creative.callToAction.trim().length > 0) {
    ctaScore += 20;
    
    const ctaText = creative.callToAction.toLowerCase();
    
    // Check for action words (more generous)
    CTA_WORDS.forEach(ctaWord => {
      if (ctaText.includes(ctaWord)) {
        ctaScore += 10;
      }
    });

    // Check CTA length (more lenient)
    const ctaWords = ctaText.split(/\s+/).length;
    if (ctaWords >= 1 && ctaWords <= 5) ctaScore += 15;
    else if (ctaWords > 7) ctaScore -= 5;

    // Check for imperative mood (starts with action word)
    const startsWithAction = CTA_WORDS.some(word => ctaText.trim().startsWith(word));
    if (startsWithAction) ctaScore += 15;
  }
  
  ctaScore = Math.min(100, ctaScore);
  
  // Calculate overall score
  const overallScore = Math.round((clarityScore * 0.3 + urgencyScore * 0.2 + relevanceScore * 0.3 + ctaScore * 0.2));
  
  // Generate professional, encouraging suggestions
  const suggestions: string[] = [];

  if (clarityScore < 80) {
    suggestions.push("Consider using more conversational language to enhance message clarity and connection");
  }

  if (urgencyScore < 60) {
    suggestions.push("Adding time-sensitive elements like 'limited time' or 'while supplies last' could boost engagement");
  }

  if (relevanceScore < 75) {
    suggestions.push("Highlighting specific benefits and outcomes could strengthen customer appeal");
  }

  if (ctaScore < 70) {
    suggestions.push("Using more direct action verbs in your CTA may improve click-through rates");
  }

  if (wordCount < 8) {
    suggestions.push("Adding a few more compelling details could help build stronger interest");
  } else if (wordCount > 45) {
    suggestions.push("Streamlining your message might improve mobile readability and engagement");
  }

  // Add positive reinforcement suggestions
  if (overallScore >= 70) {
    suggestions.push("Strong foundation - consider A/B testing variations to optimize further");
  }
  
  // Channel-specific professional suggestions
  if (creative.channel === 'facebook' || creative.channel === 'instagram') {
    if (suggestions.length < 3) {
      suggestions.push("Social platforms favor visual storytelling - consider pairing with compelling imagery");
    }
  }

  if (creative.channel === 'google-ads') {
    if (creative.title && creative.title.length > 35) {
      suggestions.push("Optimizing headline length for Google Ads character limits could improve visibility");
    }
  }

  if (creative.channel === 'linkedin') {
    if (suggestions.length < 3) {
      suggestions.push("Professional tone with industry-specific benefits tends to perform well on LinkedIn");
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
  const channelSpecific = {
    facebook: [
      `Transform your ${category} experience with ${productName} - Join 10,000+ satisfied customers`,
      `${productName} delivers results. Here's what makes it different from the competition`,
      `Limited time: Get ${productName} with free premium features worth $199`,
      `Why top professionals choose ${productName} for their ${category} needs`,
      `${productName} reviews are in: 4.9/5 stars from verified customers`,
      `Exclusive offer: ${productName} + bonus training materials - Save 40% today`
    ],
    instagram: [
      `${productName} is changing the ${category} game - See the transformation`,
      `Before vs After: Real results from ${productName} users in just 30 days`,
      `${productName} featured in top industry publications - Now available to you`,
      `Join the ${productName} community - Share your success story`,
      `${productName}: The secret weapon of ${category} professionals`,
      `Get ${productName} + exclusive Instagram-only bonus content`
    ],
    'google-ads': [
      `${productName} - #1 Rated ${category} Solution | Free Trial`,
      `Compare ${productName} vs Competitors - See Why We Win`,
      `${productName} Reviews: 4.8/5 Stars | 30-Day Money Back`,
      `Buy ${productName} Today - Fast Shipping & Expert Support`,
      `${productName} Special: Save 35% + Free Premium Upgrade`,
      `Professional ${category} Tool - ${productName} | Try Risk-Free`
    ],
    linkedin: [
      `How ${productName} helped industry leaders achieve 300% ROI`,
      `${productName}: The strategic advantage your team needs`,
      `Case Study: ${productName} implementation results at Fortune 500 companies`,
      `Professional ${category} optimization with ${productName} - Request demo`,
      `${productName} white paper: Industry best practices and benchmarks`,
      `Schedule your ${productName} consultation - Limited slots available`
    ],
    youtube: [
      `${productName} Complete Tutorial - Master ${category} in 30 Minutes`,
      `${productName} vs Competition: Unbiased Review & Performance Test`,
      `Real Users Review ${productName} - Honest Feedback & Results`,
      `${productName} Setup Guide - From Beginner to Expert`,
      `Why I Switched to ${productName} - My Honest Experience`,
      `${productName} Advanced Tips: Get 10x Better Results`
    ],
    tiktok: [
      `POV: You discover ${productName} and your ${category} life changes forever`,
      `${productName} hack that everyone needs to know about`,
      `Rating ${productName} features until I find the best one`,
      `${productName} before and after - the results will shock you`,
      `Things I wish I knew before buying ${productName}`,
      `${productName} review but make it honest`
    ]
  };

  return channelSpecific[channel as keyof typeof channelSpecific] || [
    `Professional-grade ${productName} - Trusted by industry experts`,
    `${productName}: Advanced ${category} solution with proven results`,
    `Upgrade your ${category} workflow with ${productName} - 30-day trial`,
    `${productName} delivers measurable improvements in ${category} performance`,
    `Join thousands of professionals using ${productName} for ${category}`,
    `${productName} special offer: Full access + expert support included`
  ];
}