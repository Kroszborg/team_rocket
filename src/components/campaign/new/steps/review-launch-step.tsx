import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MARKETING_CHANNELS, PRODUCT_CATEGORIES } from '../../constants';
import { CampaignFormData } from '../hooks/use-campaign-form';

interface ReviewLaunchStepProps {
  campaign: CampaignFormData;
}

export function ReviewLaunchStep({ campaign }: ReviewLaunchStepProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const getCategoryLabel = (value: string) => 
    PRODUCT_CATEGORIES.find(c => c.value === value)?.label || value;
  const getChannelLabel = (value: string) => 
    MARKETING_CHANNELS.find(c => c.value === value)?.label || value;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Launch</CardTitle>
        <CardDescription>Review your campaign details before launching the simulation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Overview */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Campaign Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Campaign Name</p>
              <p className="font-medium">{campaign.name || 'Untitled Campaign'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="font-medium">{formatCurrency(campaign.budget?.total || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{campaign.budget?.duration || 0} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Daily Budget</p>
              <p className="font-medium">
                {campaign.budget?.total && campaign.budget?.duration 
                  ? formatCurrency(campaign.budget.total / campaign.budget.duration)
                  : '$0'
                }
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Product Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Product Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Product Name</p>
              <p className="font-medium">{campaign.product?.name || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">
                {campaign.product?.category ? getCategoryLabel(campaign.product.category) : 'Not selected'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">{formatCurrency(campaign.product?.price || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Margin</p>
              <p className="font-medium">{campaign.product?.targetMargin || 0}%</p>
            </div>
          </div>
          {campaign.product?.description && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Product Description</p>
              <p className="text-sm">{campaign.product.description}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Target Audience */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Target Audience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Demographics</p>
              <div className="space-y-1 text-sm">
                <div>Age: {campaign.targeting?.ageRange.min}-{campaign.targeting?.ageRange.max} years</div>
                <div>Gender: {campaign.targeting?.gender === 'all' ? 'All Genders' : campaign.targeting?.gender}</div>
                <div>Income: {campaign.targeting?.income === 'all' ? 'All Income Levels' : `${campaign.targeting?.income} Income`}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Interests</p>
                {campaign.targeting?.interests && campaign.targeting.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {campaign.targeting.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No interests specified</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Locations</p>
                {campaign.targeting?.location && campaign.targeting.location.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {campaign.targeting.location.map((location) => (
                      <Badge key={location} variant="secondary" className="text-xs">
                        {location}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No locations specified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Channel Strategy */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Channel Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Preferred Channels</p>
              {campaign.channels?.preferred && campaign.channels.preferred.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {campaign.channels.preferred.map((channel) => (
                    <Badge key={channel} className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {getChannelLabel(channel)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No preferred channels</p>
              )}
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Avoided Channels</p>
              {campaign.channels?.avoided && campaign.channels.avoided.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {campaign.channels.avoided.map((channel) => (
                    <Badge key={channel} className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {getChannelLabel(channel)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No channels to avoid</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Ready to Launch</h4>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Your campaign is ready for simulation. We'll analyze your targeting, budget allocation, and channel strategy 
            to provide detailed insights and optimization recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}