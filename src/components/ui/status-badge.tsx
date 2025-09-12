'use client';

import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

type StatusType = 'success' | 'pending' | 'warning' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const statusConfig = {
  success: {
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  pending: {
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  },
  warning: {
    variant: 'secondary' as const,
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  },
  error: {
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  },
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, 'flex items-center gap-1', className)}
    >
      <Icon className="h-3 w-3" />
      {children}
    </Badge>
  );
}