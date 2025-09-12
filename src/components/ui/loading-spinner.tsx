import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  title = 'Loading...', 
  description, 
  size = 'md' 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <LoadingSpinner size={size} className="mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}