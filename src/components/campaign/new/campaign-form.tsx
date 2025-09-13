'use client';

import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-spinner';
import { StepNavigation } from './step-navigation';
import { useCampaignForm } from './hooks/use-campaign-form';
import { 
  ProductDetailsStep,
  TargetAudienceStep,
  BudgetChannelsStep,
  ReviewLaunchStep
} from './steps';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

export function CampaignForm() {
  const {
    currentStep,
    setCurrentStep,
    isSubmitting,
    campaign,
    setCampaign,
    newInterest,
    setNewInterest,
    newLocation,
    setNewLocation,
    addInterest,
    removeInterest,
    addLocation,
    removeLocation,
    toggleChannel,
    handleSubmit,
  } = useCampaignForm();

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(campaign.name && campaign.product?.name && campaign.product?.category && campaign.product?.price);
      case 2:
        return !!(campaign.targeting?.ageRange.min && campaign.targeting?.ageRange.max);
      case 3:
        return !!(campaign.budget?.total && campaign.budget?.duration);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isSubmitting) {
    return (
      <div className="container mx-auto py-16 max-w-2xl">
        <LoadingState
          title="Creating Your Campaign..."
          description="Running simulation and generating insights. This will take just a moment."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Create New Campaign</h1>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed max-w-2xl mx-auto">
          Build your virtual marketing campaign and get predictive insights in minutes
        </p>
      </div>

      <StepNavigation currentStep={currentStep} />

      <div className="space-y-6">
        {/* Step Content */}
        {currentStep === 1 && (
          <ProductDetailsStep
            campaign={campaign}
            setCampaign={setCampaign}
          />
        )}

        {currentStep === 2 && (
          <TargetAudienceStep
            campaign={campaign}
            setCampaign={setCampaign}
            newInterest={newInterest}
            setNewInterest={setNewInterest}
            newLocation={newLocation}
            setNewLocation={setNewLocation}
            addInterest={addInterest}
            removeInterest={removeInterest}
            addLocation={addLocation}
            removeLocation={removeLocation}
          />
        )}

        {currentStep === 3 && (
          <BudgetChannelsStep
            campaign={campaign}
            setCampaign={setCampaign}
            toggleChannel={toggleChannel}
          />
        )}

        {currentStep === 4 && (
          <ReviewLaunchStep campaign={campaign} />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-border/50 mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 h-11 px-6 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground font-medium bg-muted/30 px-3 py-1 rounded-full">
            Step {currentStep} of 4
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="flex items-center gap-2 h-11 px-6 font-medium"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(4)}
              className="flex items-center gap-2 h-11 px-6 font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Zap className="h-4 w-4" />
              Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}