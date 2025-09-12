import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizationSuggestion } from "@/lib/types";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface OptimizationInsightsProps {
  optimization: OptimizationSuggestion[];
}

export function OptimizationInsights({
  optimization,
}: OptimizationInsightsProps) {
  const getImpactLevel = (impact: {
    roi_increase: number;
    reach_increase: number;
    conversion_increase: number;
  }) => {
    const maxIncrease = Math.max(
      impact.roi_increase,
      impact.reach_increase,
      impact.conversion_increase
    );
    if (maxIncrease >= 20) return "high";
    if (maxIncrease >= 10) return "medium";
    return "low";
  };

  const getExpectedImprovement = (impact: {
    roi_increase: number;
    reach_increase: number;
    conversion_increase: number;
  }) => {
    return `${impact.roi_increase}% ROI increase`;
  };

  const getImpactColor = (impactLevel: string) => {
    switch (impactLevel.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getImpactIcon = (impactLevel: string) => {
    switch (impactLevel.toLowerCase()) {
      case "high":
        return <TrendingUp className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (!optimization || optimization.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Optimization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No optimization suggestions available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const highImpactSuggestions = optimization.filter(
    (opt) => getImpactLevel(opt.impact) === "high"
  );
  const otherSuggestions = optimization.filter(
    (opt) => getImpactLevel(opt.impact) !== "high"
  );

  return (
    <div className="space-y-6">
      {/* High Impact Suggestions */}
      {highImpactSuggestions.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              High Impact Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highImpactSuggestions.map((suggestion, index) => {
              const impactLevel = getImpactLevel(suggestion.impact);
              const expectedImprovement = getExpectedImprovement(
                suggestion.impact
              );

              return (
                <div
                  key={index}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(impactLevel)}
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        {suggestion.title}
                      </h3>
                    </div>
                    <Badge className={getImpactColor(impactLevel)}>
                      {impactLevel} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Potential improvement: +{expectedImprovement}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400"
                    >
                      Apply <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Other Suggestions */}
      {otherSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Additional Optimization Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {otherSuggestions.map((suggestion, index) => {
                const impactLevel = getImpactLevel(suggestion.impact);
                const expectedImprovement = getExpectedImprovement(
                  suggestion.impact
                );

                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getImpactIcon(impactLevel)}
                        <h3 className="font-semibold">{suggestion.title}</h3>
                      </div>
                      <Badge className={getImpactColor(impactLevel)}>
                        {impactLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        +{expectedImprovement}
                      </span>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 px-2 text-xs"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Ready to Optimize?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Implementing these suggestions could improve your campaign
                performance by up to{" "}
                <span className="font-bold">
                  {optimization.length > 0
                    ? Math.max(
                        ...optimization.map((opt) => opt.impact.roi_increase)
                      )
                    : 0}
                  %
                </span>
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Optimizing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
