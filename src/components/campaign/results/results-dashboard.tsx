'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-spinner';
import { useCampaignResults } from './hooks/use-campaign-results';
import { ResultsHeader } from './results-header';
import { MetricsOverview } from './metrics-overview';
import { ResultsCharts } from './charts/results-charts';
import { OptimizationInsights } from './optimization-insights';
import { RefreshCw } from 'lucide-react';

export function ResultsDashboard() {
  const {
    results,
    campaign,
    optimization,
    loading,
    error,
    isSharing,
    setIsSharing,
    isRegenerating,
    handleRetry,
    regenerateResults,
    router,
  } = useCampaignResults();

  if (loading) {
    return (
      <div className="container mx-auto py-16 max-w-2xl">
        <LoadingState
          title="Analyzing Your Campaign..."
          description="Crunching the numbers and generating insights based on industry data."
          size="lg"
        />
      </div>
    );
  }

  if (error || (!results && !loading)) {
    return (
      <div className="container mx-auto py-16 max-w-2xl">
        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Results Not Available</h3>
            <p className="text-muted-foreground mb-6">
              {error || 'Campaign results could not be loaded. This might be due to a timing issue.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => router.push('/campaign/new')}>
                Create New Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ResultsHeader
        campaign={campaign}
        results={results}
        optimization={optimization}
        isSharing={isSharing}
        setIsSharing={setIsSharing}
        isRegenerating={isRegenerating}
        regenerateResults={regenerateResults}
        router={router}
      />

      <MetricsOverview results={results} />

      <ResultsCharts results={results} />

      <OptimizationInsights optimization={optimization} />
    </div>
  );
}