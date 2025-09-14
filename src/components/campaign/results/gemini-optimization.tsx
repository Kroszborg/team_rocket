'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-spinner';

interface GeminiOptimizationProps {
  campaignId?: string;
  campaignData?: any;
}

interface GeminiInsights {
  overall_score: number;
  strategic_recommendations: string[];
  budget_optimization: {
    recommended_changes: string[];
    projected_improvement: string;
  };
  targeting_improvements: {
    audience_refinement: string[];
    demographic_insights: string;
  };
  creative_strategy: {
    messaging_improvements: string[];
    channel_specific_tips: string;
  };
  risk_factors: string[];
  competitive_insights: string;
}

export function GeminiOptimization({ campaignId, campaignData }: GeminiOptimizationProps) {
  const [insights, setInsights] = useState<GeminiInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsights = async () => {
    setLoading(true);

    // Simulate API call - in real implementation, this would call the backend
    setTimeout(() => {
      setInsights({
        overall_score: 82,
        strategic_recommendations: [
          'Increase focus on high-performing demographics (25-34 age group showing 40% higher engagement)',
          'Reallocate 15% of budget from Facebook to Google Ads based on conversion data',
          'Implement retargeting campaigns to capture interested but unconverted users',
          'Test video creative formats - similar campaigns see 60% higher engagement rates'
        ],
        budget_optimization: {
          recommended_changes: [
            'Move $750 from Facebook to Google Ads (higher ROAS: 4.2 vs 2.8)',
            'Allocate $500 to retargeting campaigns (typically 3x conversion rates)',
            'Reserve $300 for creative testing and iteration'
          ],
          projected_improvement: '25-35% increase in overall ROAS with optimized allocation'
        },
        targeting_improvements: {
          audience_refinement: [
            'Focus on "Tech Enthusiasts" segment - showing 45% higher conversion rates',
            'Exclude "Price Sensitive" segment to improve profit margins',
            'Add "Early Adopters" lookalike audience based on existing customers',
            'Implement geo-fencing around competitor locations'
          ],
          demographic_insights: 'Your highest-converting audience is males aged 28-35 with household income $75k+ in urban areas'
        },
        creative_strategy: {
          messaging_improvements: [
            'Emphasize "limited time" elements - creates 23% higher urgency response',
            'Include specific product benefits rather than generic value props',
            'Test social proof elements (customer testimonials, review counts)',
            'Optimize mobile-first creative - 68% of your traffic is mobile'
          ],
          channel_specific_tips: 'Instagram: Focus on visual product demos. Google: Emphasize technical specifications and comparisons'
        },
        risk_factors: [
          'Ad fatigue risk: Creative frequency is approaching 3.5x per user',
          'Seasonal downturn expected in 2 weeks based on historical data',
          'Competitor "TechCorp" launching similar campaign - monitor closely'
        ],
        competitive_insights: 'Competitor analysis shows opportunity in "professional productivity" messaging angle - currently underutilized in your sector'
      });
      setLoading(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Gemini AI Campaign Optimization
          <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState
            title="Gemini AI is Analyzing Your Campaign..."
            description="Generating strategic insights and optimization recommendations"
            size="lg"
          />
        ) : !insights ? (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-purple-200 rounded-lg">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get AI-Powered Campaign Insights
              </h3>
              <p className="text-gray-600 mb-6">
                Let Gemini AI analyze your campaign performance and provide strategic optimization recommendations across budget, targeting, and creative strategy.
              </p>
              <Button
                onClick={handleGenerateInsights}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Insights
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Campaign Score */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${getScoreColor(insights.overall_score)}`}>
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold text-xl">{insights.overall_score}/100</span>
                <span className="font-medium">Campaign Health: {getScoreLabel(insights.overall_score)}</span>
              </div>
            </div>

            {/* Optimization Tabs */}
            <Tabs defaultValue="strategic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="strategic">Strategic</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="targeting">Targeting</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
              </TabsList>

              <TabsContent value="strategic" className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Strategic Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {insights.strategic_recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Risk Factors to Monitor
                  </h4>
                  <ul className="space-y-2">
                    {insights.risk_factors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Competitive Intelligence
                  </h4>
                  <p className="text-sm text-gray-700">{insights.competitive_insights}</p>
                </div>
              </TabsContent>

              <TabsContent value="budget" className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Budget Reallocation Recommendations
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {insights.budget_optimization.recommended_changes.map((change, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{change}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-white border border-green-300 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      Projected Impact: {insights.budget_optimization.projected_improvement}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="targeting" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Audience Optimization
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {insights.targeting_improvements?.audience_refinement?.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{improvement}</span>
                      </li>
                    )) || []}
                  </ul>
                  <div className="bg-white border border-blue-300 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">
                      💡 Key Insight: {insights.targeting_improvements?.demographic_insights}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="creative" className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-600" />
                    Creative Strategy Improvements
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {insights.creative_strategy?.messaging_improvements?.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-white border border-orange-300 rounded-lg p-3">
                    <p className="text-sm font-medium text-orange-800">
                      🎯 Channel Strategy: {insights.creative_strategy.channel_specific_tips}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleGenerateInsights}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh AI Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}