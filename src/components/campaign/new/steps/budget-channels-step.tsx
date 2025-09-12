import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MARKETING_CHANNELS } from '../../constants';
import { CampaignFormData } from '../hooks/use-campaign-form';
import { MarketingChannel } from '@/lib/types';

interface BudgetChannelsStepProps {
  campaign: CampaignFormData;
  setCampaign: (updater: (prev: CampaignFormData) => CampaignFormData) => void;
  toggleChannel: (channel: MarketingChannel, type: 'preferred' | 'avoided') => void;
}

export function BudgetChannelsStep({
  campaign,
  setCampaign,
  toggleChannel,
}: BudgetChannelsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget & Channels</CardTitle>
        <CardDescription>Set your budget and preferred marketing channels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-budget" className="text-sm font-medium">Total Budget ($)</Label>
            <Input
              id="total-budget"
              type="number"
              value={campaign.budget?.total}
              onChange={(e) => setCampaign(prev => ({
                ...prev,
                budget: { ...prev.budget!, total: Number(e.target.value) }
              }))}
              placeholder="1000"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">Campaign Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={campaign.budget?.duration}
              onChange={(e) => setCampaign(prev => ({
                ...prev,
                budget: { ...prev.budget!, duration: Number(e.target.value) }
              }))}
              placeholder="30"
              className="h-10"
            />
          </div>
        </div>

        {/* Daily Budget Calculation */}
        {campaign.budget?.total && campaign.budget?.duration && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">Budget Breakdown</div>
            <div className="text-sm text-muted-foreground">
              Daily Budget: ${Math.round((campaign.budget.total / campaign.budget.duration) * 100) / 100}
            </div>
          </div>
        )}

        {/* Channel Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-green-700 dark:text-green-400">Preferred Channels</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select channels you want to prioritize for this campaign
            </p>
            <div className="flex flex-wrap gap-2">
              {MARKETING_CHANNELS.map((channel) => {
                const isPreferred = campaign.channels?.preferred.includes(channel.value);
                const isAvoided = campaign.channels?.avoided.includes(channel.value);
                
                return (
                  <Button
                    key={channel.value}
                    variant={isPreferred ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel(channel.value, 'preferred')}
                    disabled={isAvoided}
                    className={`${isPreferred ? 'bg-green-600 hover:bg-green-700' : ''} transition-colors`}
                  >
                    {channel.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-red-700 dark:text-red-400">Channels to Avoid</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select channels you want to exclude from this campaign
            </p>
            <div className="flex flex-wrap gap-2">
              {MARKETING_CHANNELS.map((channel) => {
                const isPreferred = campaign.channels?.preferred.includes(channel.value);
                const isAvoided = campaign.channels?.avoided.includes(channel.value);
                
                return (
                  <Button
                    key={channel.value}
                    variant={isAvoided ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel(channel.value, 'avoided')}
                    disabled={isPreferred}
                    className="transition-colors"
                  >
                    {channel.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Preferred Channels</h4>
            {campaign.channels?.preferred && campaign.channels.preferred.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {campaign.channels.preferred.map((channel) => (
                  <Badge key={channel} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {MARKETING_CHANNELS.find(c => c.value === channel)?.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No preferred channels selected</p>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Avoided Channels</h4>
            {campaign.channels?.avoided && campaign.channels.avoided.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {campaign.channels.avoided.map((channel) => (
                  <Badge key={channel} variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {MARKETING_CHANNELS.find(c => c.value === channel)?.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No channels to avoid</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}