import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExportDialog } from '@/components/ui/export-dialog';
import { Campaign, SimulationResults, OptimizationSuggestion } from '@/lib/types';
import { ExportData, shareResults } from '@/lib/export';
import { ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react';

interface ResultsHeaderProps {
  campaign: Campaign | null;
  results: SimulationResults | null;
  optimization: OptimizationSuggestion[];
  isSharing: boolean;
  setIsSharing: (value: boolean) => void;
  isRegenerating: boolean;
  regenerateResults: () => void;
  router: any;
}

export function ResultsHeader({
  campaign,
  results,
  optimization,
  isSharing,
  setIsSharing,
  isRegenerating,
  regenerateResults,
  router,
}: ResultsHeaderProps) {
  const handleShare = async () => {
    if (!campaign || !results) return;
    
    setIsSharing(true);
    const exportData: ExportData = {
      campaign,
      results,
      optimization,
      exportedAt: new Date(),
      version: '1.0.0',
    };
    
    try {
      await shareResults(exportData);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant="secondary">Campaign Results</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={regenerateResults}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          
          {campaign && results && (
            <ExportDialog
              data={{
                campaign,
                results,
                optimization,
                exportedAt: new Date(),
                version: '1.0.0',
              }}
              trigger={
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              }
            />
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </div>
      
      {campaign && (
        <div>
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{campaign.product.name}</span>
            <span>•</span>
            <span>${campaign.budget.total.toLocaleString()} budget</span>
            <span>•</span>
            <span>{campaign.budget.duration} days</span>
            <span>•</span>
            <span>{campaign.targeting.ageRange.min}-{campaign.targeting.ageRange.max} years</span>
          </div>
        </div>
      )}
    </div>
  );
}