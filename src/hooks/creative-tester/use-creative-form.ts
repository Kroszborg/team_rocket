import { useState } from 'react';
import { Creative, CreativeScore } from '@/lib/types';

export const useCreativeForm = () => {
  const [creative, setCreative] = useState<Creative>({
    id: '',
    title: '',
    description: '',
    callToAction: '',
    channel: 'facebook',
  });

  const [score, setScore] = useState<CreativeScore | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCreative({
      id: '',
      title: '',
      description: '',
      callToAction: '',
      channel: 'facebook',
    });
    setScore(null);
  };

  const isFormValid = () => {
    return !!(creative.title && creative.description);
  };

  return {
    creative,
    setCreative,
    score,
    setScore,
    loading,
    setLoading,
    resetForm,
    isFormValid,
  };
};