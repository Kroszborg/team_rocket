import { Creative, CreativeScore } from '@/lib/types';
import { scoreCreative, generateCreativeSuggestions } from '@/lib/creative-scorer';
import { generateCreativeImprovements, checkMLServiceHealth } from '@/services/ml-service';

export class CreativeService {
  static validateCreative(creative: Creative): void {
    if (!creative || !creative.title || !creative.description) {
      throw new Error('Invalid creative data provided');
    }
  }

  static async scoreCreative(creative: Creative): Promise<CreativeScore> {
    this.validateCreative(creative);
    return await scoreCreative(creative);
  }

  static async generateSuggestions(
    channel: string,
    productName: string,
    category: string
  ): Promise<string[]> {
    if (!channel || !productName || !category) {
      throw new Error('Missing required parameters');
    }
    
    // Try ML-powered suggestions first
    try {
      const mlHealthy = await checkMLServiceHealth();
      if (mlHealthy) {
        const improvements = await generateCreativeImprovements(
          channel,
          `${productName} - Premium ${category}`,
          `Discover the best ${productName} for your ${category} needs. High quality, great value.`,
          'Shop Now'
        );
        
        // Combine all suggestions
        const allSuggestions = [
          ...improvements.titleSuggestions,
          ...improvements.descriptionSuggestions,
        ];
        
        if (allSuggestions.length > 0) {
          return allSuggestions.slice(0, 6); // Return top 6 suggestions
        }
      }
    } catch (error) {
      // ML suggestions unavailable, using fallback
    }
    
    // Fallback to rule-based suggestions
    return generateCreativeSuggestions(channel, productName, category);
  }
}