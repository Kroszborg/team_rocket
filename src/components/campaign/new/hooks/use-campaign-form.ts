import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, MarketingChannel } from '@/lib/types';

export interface CampaignFormData extends Partial<Campaign> {}

export const initialCampaignState: CampaignFormData = {
  name: '',
  product: {
    name: '',
    category: '',
    price: 0,
    description: '',
    targetMargin: 0,
  },
  targeting: {
    ageRange: { min: 18, max: 65 },
    gender: 'all',
    interests: [],
    location: [],
    income: 'all',
  },
  budget: {
    total: 1000,
    duration: 30,
    channels: {
      'facebook': 0,
      'instagram': 0,
      'google-ads': 0,
      'tiktok': 0,
      'youtube': 0,
      'linkedin': 0,
      'twitter': 0,
      'email': 0,
      'seo': 0,
      'influencer': 0,
    },
  },
  channels: {
    preferred: [],
    avoided: [],
  },
  creatives: [],
};

export function useCampaignForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaign, setCampaign] = useState<CampaignFormData>(initialCampaignState);
  const [newInterest, setNewInterest] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const addInterest = () => {
    if (newInterest && !campaign.targeting?.interests.includes(newInterest)) {
      setCampaign(prev => ({
        ...prev,
        targeting: {
          ...prev.targeting!,
          interests: [...prev.targeting!.interests, newInterest],
        },
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setCampaign(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting!,
        interests: prev.targeting!.interests.filter(i => i !== interest),
      },
    }));
  };

  const addLocation = () => {
    if (newLocation && !campaign.targeting?.location.includes(newLocation)) {
      setCampaign(prev => ({
        ...prev,
        targeting: {
          ...prev.targeting!,
          location: [...prev.targeting!.location, newLocation],
        },
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setCampaign(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting!,
        location: prev.targeting!.location.filter(l => l !== location),
      },
    }));
  };

  const toggleChannel = (channel: MarketingChannel, type: 'preferred' | 'avoided') => {
    setCampaign(prev => ({
      ...prev,
      channels: {
        ...prev.channels!,
        [type]: prev.channels![type].includes(channel)
          ? prev.channels![type].filter(c => c !== channel)
          : [...prev.channels![type], channel],
        [type === 'preferred' ? 'avoided' : 'preferred']: prev.channels![type === 'preferred' ? 'avoided' : 'preferred'].filter(c => c !== channel),
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting campaign:', campaign);
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok && data.success && data.campaignId) {
        // Small delay to ensure data is saved
        setTimeout(() => {
          router.push(`/campaign/${data.campaignId}/results`);
        }, 100);
      } else {
        console.error('Campaign creation failed:', data);
        alert(`Failed to create campaign: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}