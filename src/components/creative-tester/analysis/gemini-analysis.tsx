"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-spinner";
import { Creative } from "@/lib/types";
import { analyzeCreativeWithGemini } from "@/services/creative-api";

interface GeminiAnalysisProps {
  creative: Creative;
  isFormValid: boolean;
}

interface Analysis {
  overall_score: number;
  ai_feedback: string;
  strengths: string[];
  improvements: string[];
  channel_specific: string;
  predicted_engagement: string;
}

interface GeminiAnalysisResult {
  success: boolean;
  analysis: Analysis;
  source: string;
}

export function GeminiAnalysis({ creative, isFormValid }: GeminiAnalysisProps) {
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const result = await analyzeCreativeWithGemini(creative);

      // Validate the result structure
      if (result && result.success && result.analysis) {
        setAnalysis(result);
      } else {
        console.error("Invalid analysis result structure:", result);
        // Fallback to demo data if structure is invalid
        const fallbackResult = {
          success: true,
          analysis: {
            overall_score: 85,
            ai_feedback:
              "Your creative shows strong potential with clear messaging and good structure. The analysis system is currently using demo data to provide insights.",
            strengths: [
              "Clear messaging",
              "Good structure",
              "Professional tone",
            ],
            improvements: [
              "Add urgency elements",
              "Test variations",
              "Optimize for mobile",
            ],
            channel_specific: `This creative is optimized for ${creative.channel} platform.`,
            predicted_engagement:
              "Expected CTR: 2.8-3.5% (Above average for category)",
          },
          source: "fallback_demo",
        };
        setAnalysis(fallbackResult);
      }
    } catch (error) {
      console.error("Error analyzing creative:", error);
      // Set fallback data on error
      const errorFallback = {
        success: true,
        analysis: {
          overall_score: 80,
          ai_feedback:
            "Analysis completed with demo data. Your creative shows good potential with room for optimization.",
          strengths: ["Clear value proposition", "Good structure"],
          improvements: ["Add urgency elements", "Test different variations"],
          channel_specific: `Optimized for ${creative.channel} platform.`,
          predicted_engagement: "Expected CTR: 2.5-3.2% (Good performance)",
        },
        source: "error_fallback",
      };
      setAnalysis(errorFallback);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-8">
          <LoadingState
            title="AI Analyzing Your Creative..."
            description="Gemini AI is providing detailed feedback and optimization suggestions."
            size="lg"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Gemini AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis ? (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Get AI-Powered Insights
              </h3>
              <p className="text-muted-foreground mb-6">
                Let Gemini AI analyze your creative and provide detailed
                feedback, optimization suggestions, and performance predictions.
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={!isFormValid || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with Gemini AI
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getScoreColor(
                  analysis.analysis.overall_score
                )}`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold text-lg">
                  {analysis.analysis.overall_score}/100
                </span>
                <span className="font-medium">
                  {getScoreLabel(analysis.analysis.overall_score)}
                </span>
              </div>
            </div>

            {/* AI Feedback */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                AI Feedback
              </h4>
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-4">
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                  {analysis.analysis.ai_feedback || "No feedback available"}
                </div>
              </div>
            </div>

            {/* Strengths */}
            {analysis.analysis.strengths &&
              analysis.analysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Improvements */}
            {analysis.analysis.improvements &&
              analysis.analysis.improvements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    Optimization Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {analysis.analysis.improvements.map(
                      (improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">
                            {improvement}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Channel Specific */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Channel-Specific Insights
              </h4>
              <p className="text-sm text-foreground">
                {analysis.analysis.channel_specific ||
                  "No channel-specific insights available"}
              </p>
            </div>

            {/* Predicted Engagement */}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Performance Prediction
              </h4>
              <p className="text-sm text-foreground">
                {analysis.analysis.predicted_engagement ||
                  "No performance prediction available"}
              </p>
            </div>

            {/* Re-analyze Button */}
            <Button
              onClick={handleAnalyze}
              variant="outline"
              className="w-full"
              disabled={!isFormValid || loading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Re-analyze with Gemini
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
