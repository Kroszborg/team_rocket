"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Lightbulb, TrendingUp } from "lucide-react";

interface SuggestionsListProps {
  suggestions: string[];
  copiedSuggestion: number | null;
  onCopy: (text: string, index: number) => void;
  onApply: (suggestion: string) => void;
}

export function SuggestionsList({
  suggestions,
  copiedSuggestion,
  onCopy,
  onApply,
}: SuggestionsListProps) {
  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Creative Ideas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="group relative p-4 bg-muted/50 rounded-lg border hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm leading-relaxed pr-4">{suggestion}</p>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onCopy(suggestion, index)}
                    title="Copy to clipboard"
                  >
                    {copiedSuggestion === index ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onApply(suggestion)}
                    title="Apply to form"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
