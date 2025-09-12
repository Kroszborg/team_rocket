import { Creative, CreativeScore } from '@/lib/types';
import { scoreCreative, generateCreativeSuggestions } from '@/lib/creative-scorer';

export class CreativeService {
  static validateCreative(creative: Creative): void {
    if (!creative || !creative.title || !creative.description) {
      throw new Error('Invalid creative data provided');
    }
  }

  static async scoreCreative(creative: Creative): Promise<CreativeScore> {
    this.validateCreative(creative);
    return scoreCreative(creative);
  }

  static async generateSuggestions(
    channel: string,
    productName: string,
    category: string
  ): Promise<string[]> {
    if (!channel || !productName || !category) {
      throw new Error('Missing required parameters');
    }
    
    return generateCreativeSuggestions(channel, productName, category);
  }
}