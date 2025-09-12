import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, X } from 'lucide-react';
import { CampaignFormData } from '../hooks/use-campaign-form';

interface TargetAudienceStepProps {
  campaign: CampaignFormData;
  setCampaign: (updater: (prev: CampaignFormData) => CampaignFormData) => void;
  newInterest: string;
  setNewInterest: (value: string) => void;
  newLocation: string;
  setNewLocation: (value: string) => void;
  addInterest: () => void;
  removeInterest: (interest: string) => void;
  addLocation: () => void;
  removeLocation: (location: string) => void;
}

export function TargetAudienceStep({
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
}: TargetAudienceStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Audience</CardTitle>
        <CardDescription>Define your ideal customers and demographics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Age Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Minimum Age</Label>
              <Input
                type="number"
                min="13"
                max="80"
                value={campaign.targeting?.ageRange.min}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  targeting: {
                    ...prev.targeting!,
                    ageRange: { ...prev.targeting!.ageRange, min: Number(e.target.value) }
                  }
                }))}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Maximum Age</Label>
              <Input
                type="number"
                min="18"
                max="90"
                value={campaign.targeting?.ageRange.max}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  targeting: {
                    ...prev.targeting!,
                    ageRange: { ...prev.targeting!.ageRange, max: Number(e.target.value) }
                  }
                }))}
                className="h-9"
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Target age range: {campaign.targeting?.ageRange.min} - {campaign.targeting?.ageRange.max} years
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gender</Label>
          <Select
            value={campaign.targeting?.gender}
            onValueChange={(value: 'male' | 'female' | 'all') => setCampaign(prev => ({
              ...prev,
              targeting: { ...prev.targeting!, gender: value }
            }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Income Level */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Income Level</Label>
          <Select
            value={campaign.targeting?.income}
            onValueChange={(value: 'low' | 'medium' | 'high' | 'all') => setCampaign(prev => ({
              ...prev,
              targeting: { ...prev.targeting!, income: value }
            }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Income Levels</SelectItem>
              <SelectItem value="low">Low Income</SelectItem>
              <SelectItem value="medium">Medium Income</SelectItem>
              <SelectItem value="high">High Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Interests & Hobbies</Label>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="e.g., technology, fitness, cooking..."
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              className="h-9"
            />
            <Button onClick={addInterest} size="sm" className="h-9 px-3">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {campaign.targeting?.interests && campaign.targeting.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {campaign.targeting.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeInterest(interest)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Target Locations</Label>
          <div className="flex gap-2">
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g., United States, California, New York..."
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
              className="h-9"
            />
            <Button onClick={addLocation} size="sm" className="h-9 px-3">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {campaign.targeting?.location && campaign.targeting.location.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {campaign.targeting.location.map((location) => (
                <Badge key={location} variant="secondary" className="gap-1">
                  {location}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeLocation(location)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}