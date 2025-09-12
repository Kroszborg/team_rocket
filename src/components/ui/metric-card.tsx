import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20',
  warning: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20',
  destructive: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  variant = 'default',
}: MetricCardProps) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && trendValue && (
            <Badge 
              variant="outline" 
              className={cn("text-xs", trendColors[trend])}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}