import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Creative, MarketingChannel } from '@/lib/types';
import { MARKETING_CHANNELS } from '@/components/campaign/constants';
import { Zap, RotateCcw, Lightbulb } from 'lucide-react';

interface CreativeFormProps {
  creative: Creative;
  setCreative: (updater: (prev: Creative) => Creative) => void;
  onScore: () => void;
  onGenerateSuggestions: () => void;
  onReset: () => void;
  loading: boolean;
}

export function CreativeForm({
  creative,
  setCreative,
  onScore,
  onGenerateSuggestions,
  onReset,
  loading
}: CreativeFormProps) {
  const isFormValid = creative.title && creative.description && creative.callToAction;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Creative Details
        </CardTitle>
        <CardDescription>
          Enter your ad copy details to get an AI-powered performance score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="channel" className="text-sm font-medium">Marketing Channel</Label>
          <Select
            value={creative.channel}
            onValueChange={(value: MarketingChannel) => 
              setCreative(prev => ({ ...prev, channel: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              {MARKETING_CHANNELS.map((channel) => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">Ad Title/Headline</Label>
          <Input
            id="title"
            value={creative.title}
            onChange={(e) => setCreative(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter your compelling headline..."
            maxLength={60}
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
          <div className="text-xs text-muted-foreground text-right">
            {creative.title.length}/60 characters
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Ad Description</Label>
          <Textarea
            id="description"
            value={creative.description}
            onChange={(e) => setCreative(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your product's benefits and key features..."
            rows={4}
            maxLength={150}
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
          <div className="text-xs text-muted-foreground text-right">
            {creative.description.length}/150 characters
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta" className="text-sm font-medium">Call to Action</Label>
          <Input
            id="cta"
            value={creative.callToAction}
            onChange={(e) => setCreative(prev => ({ ...prev, callToAction: e.target.value }))}
            placeholder="Shop Now, Learn More, Get Started..."
            maxLength={25}
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
          <div className="text-xs text-muted-foreground text-right">
            {creative.callToAction.length}/25 characters
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={onScore}
            disabled={!isFormValid || loading}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Score Creative'}
          </Button>
          
          <Button
            onClick={onGenerateSuggestions}
            variant="outline"
            disabled={!creative.channel}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Ideas
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}