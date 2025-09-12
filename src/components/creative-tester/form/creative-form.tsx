'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Creative, MarketingChannel } from '@/lib/types';
import { MARKETING_CHANNELS } from '../constants';
import { FormActions } from './form-actions';

interface CreativeFormProps {
  creative: Creative;
  setCreative: React.Dispatch<React.SetStateAction<Creative>>;
  onScore: () => void;
  onGenerateSuggestions: () => void;
  onReset: () => void;
  isFormValid: boolean;
  loading: boolean;
}

export function CreativeForm({ 
  creative, 
  setCreative, 
  onScore, 
  onGenerateSuggestions, 
  onReset, 
  isFormValid, 
  loading 
}: CreativeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Creative Details</CardTitle>
        <CardDescription>Enter your ad copy to get scored</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="channel">Marketing Channel</Label>
          <Select
            value={creative.channel}
            onValueChange={(value: MarketingChannel) => setCreative(prev => ({ ...prev, channel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKETING_CHANNELS.map(channel => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Ad Title/Headline</Label>
          <Input
            id="title"
            value={creative.title}
            onChange={(e) => setCreative(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Revolutionary Wireless Headphones"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {creative.title.length}/60 characters
          </p>
        </div>

        <div>
          <Label htmlFor="description">Ad Description</Label>
          <Textarea
            id="description"
            value={creative.description}
            onChange={(e) => setCreative(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Experience crystal-clear sound with our premium wireless headphones. Perfect for music lovers who demand quality."
            rows={4}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {creative.description.length}/200 characters
          </p>
        </div>

        <div>
          <Label htmlFor="cta">Call to Action</Label>
          <Input
            id="cta"
            value={creative.callToAction}
            onChange={(e) => setCreative(prev => ({ ...prev, callToAction: e.target.value }))}
            placeholder="Shop Now"
            maxLength={25}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {creative.callToAction.length}/25 characters
          </p>
        </div>

        <FormActions
          onScore={onScore}
          onGenerateSuggestions={onGenerateSuggestions}
          onReset={onReset}
          isFormValid={isFormValid}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}