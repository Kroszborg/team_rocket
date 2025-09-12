'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Zap } from 'lucide-react';

interface FormActionsProps {
  onScore: () => void;
  onGenerateSuggestions: () => void;
  onReset: () => void;
  isFormValid: boolean;
  loading: boolean;
}

export function FormActions({ 
  onScore, 
  onGenerateSuggestions, 
  onReset, 
  isFormValid, 
  loading 
}: FormActionsProps) {
  return (
    <div className="flex gap-3">
      <Button 
        onClick={onScore}
        disabled={!isFormValid || loading}
        className="flex-1"
      >
        <Zap className="h-4 w-4 mr-2" />
        {loading ? 'Scoring...' : 'Score Creative'}
      </Button>
      
      <Button 
        variant="outline"
        onClick={onGenerateSuggestions}
        disabled={loading}
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        Get Ideas
      </Button>
      
      <Button 
        variant="outline"
        size="icon"
        onClick={onReset}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}