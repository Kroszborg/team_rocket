'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreativeScore } from '@/lib/types';
import { getScoreColor, getScoreLabel, getScoreVariant } from '@/utils/score';
import { TrendingUp } from 'lucide-react';

interface ScoreDisplayProps {
  score: CreativeScore;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Creative Performance Score
        </CardTitle>
        <CardDescription>AI-powered analysis of your ad copy effectiveness</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center relative">
          <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          </div>
          <Badge 
            variant={getScoreVariant(score.overall)} 
            className="text-lg px-4 py-2"
          >
            {getScoreLabel(score.overall)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Clarity</span>
              <span className="text-sm text-muted-foreground">{score.breakdown.clarity}/100</span>
            </div>
            <Progress value={score.breakdown.clarity} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Urgency</span>
              <span className="text-sm text-muted-foreground">{score.breakdown.urgency}/100</span>
            </div>
            <Progress value={score.breakdown.urgency} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Relevance</span>
              <span className="text-sm text-muted-foreground">{score.breakdown.relevance}/100</span>
            </div>
            <Progress value={score.breakdown.relevance} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Call to Action</span>
              <span className="text-sm text-muted-foreground">{score.breakdown.callToAction}/100</span>
            </div>
            <Progress value={score.breakdown.callToAction} />
          </div>
        </div>

        {score.suggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Improvement Suggestions</h4>
            <ul className="space-y-2">
              {score.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}