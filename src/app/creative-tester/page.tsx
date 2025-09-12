'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { LoadingState } from '@/components/ui/loading-spinner';
import { CreativeTesterHeader } from '@/components/creative-tester/creative-tester-header';
import { CreativeForm } from '@/components/creative-tester/form/creative-form';
import { ScoreDisplay } from '@/components/creative-tester/score/score-display';
import { ScorePlaceholder } from '@/components/creative-tester/score/score-placeholder';
import { SuggestionsList } from '@/components/creative-tester/suggestions/suggestions-list';
import { useCreativeForm } from '@/hooks/creative-tester/use-creative-form';
import { useCreativeSuggestions } from '@/hooks/creative-tester/use-creative-suggestions';
import { scoreCreative, generateSuggestions } from '@/services/creative-api';

export default function CreativeTesterPage() {
  const {
    creative,
    setCreative,
    score,
    setScore,
    loading,
    setLoading,
    resetForm,
    isFormValid,
  } = useCreativeForm();

  const {
    suggestions,
    setSuggestions,
    copiedSuggestion,
    copyToClipboard,
    clearSuggestions,
  } = useCreativeSuggestions();

  const handleScore = async () => {
    if (!isFormValid()) return;
    
    setLoading(true);
    try {
      const scoreResult = await scoreCreative(creative);
      setScore(scoreResult);
    } catch (error) {
      console.error('Error scoring creative:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!creative.channel) return;
    
    try {
      const suggestionResults = await generateSuggestions(creative.channel, 'Your Product', 'electronics');
      setSuggestions(suggestionResults);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleReset = () => {
    resetForm();
    clearSuggestions();
  };

  const handleApplySuggestion = (suggestion: string) => {
    const parts = suggestion.split(' - ');
    if (parts.length === 2) {
      setCreative(prev => ({
        ...prev,
        title: parts[0],
        description: parts[1],
      }));
    } else {
      setCreative(prev => ({ ...prev, title: suggestion }));
    }
  };

  if (loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="container mx-auto py-16 max-w-2xl">
          <LoadingState
            title="Analyzing Your Copy..."
            description="Running our AI-powered scoring algorithm on your creative."
            size="lg"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 max-w-6xl">
        <CreativeTesterHeader />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CreativeForm 
              creative={creative} 
              setCreative={setCreative}
              onScore={handleScore}
              onGenerateSuggestions={handleGenerateSuggestions}
              onReset={handleReset}
              isFormValid={isFormValid()}
              loading={loading}
            />

            <SuggestionsList
              suggestions={suggestions}
              copiedSuggestion={copiedSuggestion}
              onCopy={copyToClipboard}
              onApply={handleApplySuggestion}
            />
          </div>

          <div>
            {score ? (
              <ScoreDisplay score={score} />
            ) : (
              <ScorePlaceholder />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}