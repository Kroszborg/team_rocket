import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Creative, CreativeScore, MarketingChannel } from '@/lib/types';

export function useCreativeTester() {
  const router = useRouter();
  const [creative, setCreative] = useState<Creative>({
    id: '',
    title: '',
    description: '',
    callToAction: '',
    channel: 'facebook',
  });
  
  const [score, setScore] = useState<CreativeScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null);

  const handleScore = async () => {
    if (!creative.title || !creative.description) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/creative-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creative }),
      });
      
      const data = await response.json();
      if (data.success) {
        setScore(data.score);
      }
    } catch (error) {
      console.error('Error scoring creative:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!creative.channel) return;
    
    try {
      const response = await fetch(
        `/api/creative-score?channel=${creative.channel}&productName=Your Product&category=electronics`
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const copySuggestion = (suggestion: string, index: number) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedSuggestion(index);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  const applySuggestion = (suggestion: string) => {
    const words = suggestion.split(' ');
    const isTitle = words.length <= 8;
    
    if (isTitle) {
      setCreative(prev => ({ ...prev, title: suggestion }));
    } else {
      setCreative(prev => ({ ...prev, description: suggestion }));
    }
    handleScore();
  };

  const resetForm = () => {
    setCreative({
      id: '',
      title: '',
      description: '',
      callToAction: '',
      channel: 'facebook',
    });
    setScore(null);
    setSuggestions([]);
    setCopiedSuggestion(null);
  };

  return {
    creative,
    setCreative,
    score,
    loading,
    suggestions,
    copiedSuggestion,
    handleScore,
    generateSuggestions,
    copySuggestion,
    applySuggestion,
    resetForm,
    router,
  };
}