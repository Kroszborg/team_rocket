'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lightbulb } from 'lucide-react';

export function ScorePlaceholder() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-12 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Lightbulb className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Ready to Score Your Creative?</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Fill out your ad creative details and click &ldquo;Score Creative&rdquo; to get AI-powered feedback and optimization suggestions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Instant Analysis
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Optimization Tips
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Performance Predictions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}