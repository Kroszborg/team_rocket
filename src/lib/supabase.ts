import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Campaign {
  id: string
  user_id: string
  name: string
  product_data: any
  budget_data: any
  targeting_data: any
  channels_data: any
  optimization_results: any
  status: string
  created_at: string
  updated_at: string
}

export interface CreativeTest {
  id: string
  user_id: string
  campaign_id: string
  creative_data: any
  test_results: any
  created_at: string
}

export interface UserProfile {
  id: string
  full_name?: string
  company?: string
  role?: string
  avatar_url?: string
  preferences: any
  created_at: string
  updated_at: string
}