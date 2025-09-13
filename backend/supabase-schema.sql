-- Team Rocket Backend Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security (RLS) by default
-- Users can only access their own data

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    
    -- Campaign Configuration Data
    product_data JSONB NOT NULL DEFAULT '{}',
    budget_data JSONB NOT NULL DEFAULT '{}',
    targeting_data JSONB NOT NULL DEFAULT '{}',
    channels_data JSONB NOT NULL DEFAULT '{}',
    
    -- ML Optimization Results
    optimization_results JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see/modify their own campaigns
CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX campaigns_user_id_idx ON public.campaigns(user_id);
CREATE INDEX campaigns_created_at_idx ON public.campaigns(created_at DESC);
CREATE INDEX campaigns_status_idx ON public.campaigns(status);

-- =============================================
-- CREATIVE TESTS TABLE
-- =============================================

CREATE TABLE public.creative_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    
    -- Creative Test Data
    creative_data JSONB NOT NULL DEFAULT '{}',
    test_results JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creative_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own creative tests" ON public.creative_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creative tests" ON public.creative_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creative tests" ON public.creative_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own creative tests" ON public.creative_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX creative_tests_user_id_idx ON public.creative_tests(user_id);
CREATE INDEX creative_tests_campaign_id_idx ON public.creative_tests(campaign_id);
CREATE INDEX creative_tests_created_at_idx ON public.creative_tests(created_at DESC);

-- =============================================
-- USER PROFILES TABLE (Optional - for additional user data)
-- =============================================

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company TEXT,
    role TEXT,
    avatar_url TEXT,
    
    -- Settings
    preferences JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to campaigns table
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Apply to user_profiles table
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- VIEWS FOR ANALYTICS (Optional)
-- =============================================

-- Campaign summary view
CREATE OR REPLACE VIEW public.campaign_summary AS
SELECT 
    user_id,
    COUNT(*) as total_campaigns,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_campaigns,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as campaigns_last_30_days,
    AVG((optimization_results->>'expected_roi')::numeric) as avg_expected_roi,
    MIN(created_at) as first_campaign_date,
    MAX(created_at) as last_campaign_date
FROM public.campaigns
GROUP BY user_id;

-- Enable RLS on view
ALTER VIEW public.campaign_summary SET (security_invoker = true);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Note: This will only work if you have test users created
-- You can uncomment and modify user_id values after creating test accounts

/*
INSERT INTO public.campaigns (user_id, name, product_data, budget_data, targeting_data, optimization_results) VALUES
(
    'your-test-user-id-here',  -- Replace with actual user ID
    'Sample Electronics Campaign',
    '{"name": "Wireless Headphones", "category": "electronics", "price": 199.99}',
    '{"total": 5000, "duration": 30}',
    '{"age_range": {"min": 25, "max": 45}, "interests": ["technology", "music"]}',
    '{"expected_roi": 2.5, "recommended_channels": ["facebook", "google"], "confidence_score": 0.85}'
);
*/

-- =============================================
-- PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for the service role (for backend operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;