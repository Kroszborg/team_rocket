'use client';

import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-12 space-y-4",
      className
    )}>
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground flex items-center justify-center bg-muted rounded-full">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}