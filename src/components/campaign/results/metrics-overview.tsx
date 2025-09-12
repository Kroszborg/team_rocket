import { MetricCard } from '@/components/ui/metric-card';
import { SimulationResults } from '@/lib/types';
import { TrendingUp, Target, Users, MousePointer } from 'lucide-react';

interface MetricsOverviewProps {
  results: SimulationResults;
}

export function MetricsOverview({ results }: MetricsOverviewProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  const formatNumber = (number: number | null | undefined) => {
    if (number == null || isNaN(number)) return '0';
    return number.toLocaleString();
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (percentage == null || isNaN(percentage)) return '0%';
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Estimated Reach"
        value={formatNumber(results.metrics.estimatedReach)}
        trendValue="12.5%"
        trend="up"
        icon={Users}
        description="People who will see your ads"
      />
      <MetricCard
        title="Expected ROI"
        value={formatPercentage(results.metrics.estimatedROI)}
        trendValue="8.3%"
        trend="up"
        icon={TrendingUp}
        description="Return on investment"
      />
      <MetricCard
        title="Conversions"
        value={formatNumber(results.metrics.estimatedConversions)}
        trendValue="2.1%"
        trend="down"
        icon={Target}
        description="Expected conversions"
      />
      <MetricCard
        title="Cost per Conversion"
        value={formatCurrency(results.metrics.costPerConversion)}
        trendValue="5.7%"
        trend="down"
        icon={MousePointer}
        description="Average cost per conversion"
      />
    </div>
  );
}