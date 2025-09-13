from datetime import datetime
from typing import Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field
from enum import Enum

# Enums
class MarketingChannel(str, Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    GOOGLE_ADS = "google-ads"
    TIKTOK = "tiktok"
    YOUTUBE = "youtube"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    EMAIL = "email"
    SEO = "seo"
    INFLUENCER = "influencer"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    ALL = "all"

class Income(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    ALL = "all"

class OptimizationType(str, Enum):
    BUDGET_REALLOCATION = "budget_reallocation"
    CHANNEL_ADDITION = "channel_addition"
    CREATIVE_IMPROVEMENT = "creative_improvement"

# Base Models
class ProductDetails(BaseModel):
    name: str
    category: str
    price: float
    description: str
    target_margin: float = Field(alias='targetMargin')

    class Config:
        allow_population_by_field_name = True

class AgeRange(BaseModel):
    min: int
    max: int

class TargetDemographics(BaseModel):
    age_range: AgeRange = Field(alias='ageRange')
    gender: Gender
    interests: List[str]
    location: List[str]
    income: Income

    class Config:
        allow_population_by_field_name = True

class ChannelBudget(BaseModel):
    facebook: float = 0
    instagram: float = 0
    google_ads: float = Field(0, alias='google-ads')
    tiktok: float = 0
    youtube: float = 0
    linkedin: float = 0
    twitter: float = 0
    email: float = 0
    seo: float = 0
    influencer: float = 0

    class Config:
        allow_population_by_field_name = True

class BudgetAllocation(BaseModel):
    total: float
    duration: int  # days
    channels: ChannelBudget

class ChannelPreferences(BaseModel):
    preferred: List[MarketingChannel]
    avoided: List[MarketingChannel]

class CreativeBreakdown(BaseModel):
    clarity: float
    urgency: float
    relevance: float
    call_to_action: float = Field(alias='callToAction')

    class Config:
        allow_population_by_field_name = True

class CreativeScore(BaseModel):
    overall: float
    breakdown: CreativeBreakdown
    suggestions: List[str]

class Creative(BaseModel):
    id: str
    title: str
    description: str
    call_to_action: str = Field(alias='callToAction')
    channel: MarketingChannel
    score: Optional[CreativeScore] = None

    class Config:
        allow_population_by_field_name = True

class Campaign(BaseModel):
    id: str
    name: str
    product: ProductDetails
    targeting: TargetDemographics
    budget: BudgetAllocation
    channels: ChannelPreferences
    creatives: List[Creative] = []
    created_at: datetime = Field(default_factory=datetime.utcnow, alias='createdAt')

    class Config:
        allow_population_by_field_name = True

class ChannelMetrics(BaseModel):
    spend: float
    reach: int
    conversions: int
    roi: float

class SimulationMetrics(BaseModel):
    estimated_reach: int = Field(alias='estimatedReach')
    estimated_engagement: int = Field(alias='estimatedEngagement')
    estimated_conversions: int = Field(alias='estimatedConversions')
    estimated_roi: float = Field(alias='estimatedROI')
    cost_per_conversion: float = Field(alias='costPerConversion')

    class Config:
        allow_population_by_field_name = True

class TimelinePoint(BaseModel):
    day: int
    reach: int
    conversions: int
    spend: float

class SimulationResults(BaseModel):
    campaign_id: str = Field(alias='campaignId')
    metrics: SimulationMetrics
    channel_breakdown: Dict[MarketingChannel, ChannelMetrics] = Field(alias='channelBreakdown')
    timeline: List[TimelinePoint]

    class Config:
        allow_population_by_field_name = True

class OptimizationImpact(BaseModel):
    roi_increase: float
    reach_increase: float
    conversion_increase: float

class OptimizationChanges(BaseModel):
    from_channel: Optional[MarketingChannel] = None
    to_channel: Optional[MarketingChannel] = None
    amount: Optional[float] = None
    creative_changes: Optional[List[str]] = None

class OptimizationSuggestion(BaseModel):
    type: OptimizationType
    title: str
    description: str
    impact: OptimizationImpact
    changes: OptimizationChanges

# Request/Response Models
class CampaignCreateRequest(BaseModel):
    name: str
    product: ProductDetails
    targeting: TargetDemographics
    budget: BudgetAllocation
    channels: ChannelPreferences
    creatives: List[Creative] = []

class CampaignResponse(BaseModel):
    success: bool
    campaign_id: str
    message: str
    stats: Optional[Dict] = None

class CreativeScoreRequest(BaseModel):
    channel: str
    title: str
    description: str
    cta: str

class CreativeScoreResponse(BaseModel):
    success: bool
    score: Optional[CreativeScore] = None
    error: Optional[str] = None

class CreativeSuggestionsRequest(BaseModel):
    channel: str
    product_name: str
    category: str

class CreativeSuggestionsResponse(BaseModel):
    success: bool
    suggestions: List[str] = []
    error: Optional[str] = None

# ML Service Models
class MLCampaignOptimizationRequest(BaseModel):
    total_budget: float
    aov: float
    age: int
    gender: str
    income_level: str
    creative_quality: float
    campaign_days: int
    target_margin: float

class MLCampaignOptimizationResponse(BaseModel):
    recommended_split: Dict[str, float]
    predicted_revenue: float
    predicted_roi: float
    confidence_score: float
    warning: Optional[str] = None

class MLCreativeScoreRequest(BaseModel):
    channel: str
    title: str
    description: str
    cta: str

class MLCreativeScoreResponse(BaseModel):
    channel: str
    scores: Dict[str, float]
    feedback: List[str]
    improvements: Dict[str, List[str]]