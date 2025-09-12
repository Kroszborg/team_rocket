import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Target, Users, DollarSign, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  { number: 1, title: 'Product Details', description: 'Set up your product information', icon: Target },
  { number: 2, title: 'Target Audience', description: 'Define your ideal customers', icon: Users },
  { number: 3, title: 'Budget & Channels', description: 'Allocate budget and select channels', icon: DollarSign },
  { number: 4, title: 'Review & Launch', description: 'Finalize and run simulation', icon: Zap },
];

interface StepNavigationProps {
  currentStep: number;
}

export function StepNavigation({ currentStep }: StepNavigationProps) {
  return (
    <div className="mb-8">
      {/* Mobile step indicator */}
      <div className="sm:hidden flex items-center justify-between mb-4 p-4 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm font-medium text-primary">
          {steps[currentStep - 1].title}
        </span>
      </div>
      
      {/* Desktop step navigation */}
      <div className="hidden sm:flex justify-between items-center mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex-1 flex items-center">
              <div className={`flex items-center space-x-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg transform scale-110'
                      : isActive
                      ? 'border-primary text-primary bg-primary/10 shadow-md transform scale-105'
                      : 'border-muted text-muted-foreground bg-muted/50 hover:border-muted-foreground/50'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden md:block">
                  <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? 'bg-primary shadow-sm' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="space-y-2">
        <Progress value={(currentStep / 4) * 100} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
        </div>
      </div>
    </div>
  );
}