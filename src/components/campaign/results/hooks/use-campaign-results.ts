import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SimulationResults, OptimizationSuggestion, Campaign } from '@/lib/types';

export function useCampaignResults() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [optimization, setOptimization] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchResults = async (attempt = 0) => {
      if (!params.id) {
        setError('Campaign ID not found');
        setLoading(false);
        return;
      }

      // Check if we have campaign data stored locally first
      if (typeof params.id === 'string') {
        const storedCampaign = localStorage.getItem(`campaign_${params.id}`);
        if (storedCampaign) {
          console.log('Found stored campaign, generating results locally');
          const campaign = JSON.parse(storedCampaign);

          // Generate results using simulation and ML services
          const { runCampaignSimulation, generateOptimizationSuggestions } = await import('@/lib/simulation');

          const simulation = runCampaignSimulation(campaign);
          const optimization = await generateOptimizationSuggestions(campaign);

          setCampaign({ ...campaign, id: params.id });
          setResults(simulation);
          setOptimization(optimization);
          setLoading(false);
          return;
        }
      }

      try {
        console.log(`Fetching results for campaign ${params.id}, attempt ${attempt + 1}`);
        
        const response = await fetch(`/api/campaigns/${params.id}/results`);

        if (!response.ok && response.status !== 202) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse response JSON:', parseError);
          throw new Error('Invalid response format from server');
        }

        console.log('Results API Response:', data);
        
        if (data.success) {
          setResults(data.results);
          setOptimization(data.optimization);
          setCampaign(data.campaign);
          setError(null);
          setLoading(false);
        } else {
          // If campaign not found and we haven't retried too many times
          if ((data?.error === 'Campaign not found' || response.status === 404) && attempt < 3) {
            console.log(`Campaign not found, retrying in 2 seconds... (attempt ${attempt + 1}/3)`);
            setTimeout(() => {
              fetchResults(attempt + 1);
            }, 2000);
          } else {
            const errorMessage = data?.error || data?.message || 'Failed to load results';
            setError(errorMessage);
            setLoading(false);
            console.error('API Error:', {
              response_status: response.status,
              response_data: data || 'No data received',
              campaign_id: params.id
            });
          }
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        if (attempt < 3) {
          setTimeout(() => {
            fetchResults(attempt + 1);
          }, 2000);
        } else {
          setError('Failed to fetch results after multiple attempts');
          setLoading(false);
        }
      }
    };

    if (params.id) {
      fetchResults();
    }
  }, [params.id]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const regenerateResults = async () => {
    if (!params.id) return;
    
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/campaigns/${params.id}/results`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setOptimization(data.optimization);
      }
    } catch (error) {
      console.error('Error regenerating results:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    results,
    campaign,
    optimization,
    loading,
    error,
    isSharing,
    setIsSharing,
    isRegenerating,
    handleRetry,
    regenerateResults,
    router,
  };
}