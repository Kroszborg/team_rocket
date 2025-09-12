import { useState } from 'react';

export const useCreativeSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSuggestion(index);
      setTimeout(() => setCopiedSuggestion(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setCopiedSuggestion(null);
  };

  return {
    suggestions,
    setSuggestions,
    copiedSuggestion,
    copyToClipboard,
    clearSuggestions,
  };
};