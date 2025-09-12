import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PRODUCT_CATEGORIES } from '../../constants';
import { CampaignFormData } from '../hooks/use-campaign-form';

interface ProductDetailsStepProps {
  campaign: CampaignFormData;
  setCampaign: (updater: (prev: CampaignFormData) => CampaignFormData) => void;
}

export function ProductDetailsStep({ campaign, setCampaign }: ProductDetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>Tell us about your product or service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name" className="text-sm font-medium">Campaign Name</Label>
            <Input
              id="campaign-name"
              value={campaign.name}
              onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Summer Sale Campaign"
              className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-name" className="text-sm font-medium">Product Name</Label>
            <Input
              id="product-name"
              value={campaign.product?.name}
              onChange={(e) => setCampaign(prev => ({
                ...prev,
                product: { ...prev.product!, name: e.target.value }
              }))}
              placeholder="Wireless Headphones"
              className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            <Select
              value={campaign.product?.category}
              onValueChange={(value) => setCampaign(prev => ({
                ...prev,
                product: { ...prev.product!, category: value }
              }))}
            >
              <SelectTrigger className="h-10 transition-all focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={campaign.product?.price}
              onChange={(e) => setCampaign(prev => ({
                ...prev,
                product: { ...prev.product!, price: Number(e.target.value) }
              }))}
              placeholder="99"
              className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Product Description</Label>
          <Textarea
            id="description"
            value={campaign.product?.description}
            onChange={(e) => setCampaign(prev => ({
              ...prev,
              product: { ...prev.product!, description: e.target.value }
            }))}
            placeholder="Describe your product's key features and benefits..."
            rows={3}
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Target Margin (%)</Label>
          <div className="px-2">
            <Slider
              value={[campaign.product?.targetMargin || 0]}
              onValueChange={([value]) => setCampaign(prev => ({
                ...prev,
                product: { ...prev.product!, targetMargin: value }
              }))}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span className="font-medium text-primary">{campaign.product?.targetMargin || 0}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}