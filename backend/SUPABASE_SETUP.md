# 🔐 Supabase Integration Setup Guide

## 🎯 **What This Adds to Your App:**

- ✅ **User Registration & Login**
- ✅ **Secure Authentication with JWT**
- ✅ **User Dashboard with Saved Campaigns**
- ✅ **Campaign History & Management**
- ✅ **Creative Test Results Storage**
- ✅ **Row-Level Security** (users see only their data)

## 🚀 **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with GitHub
3. **Create New Project**:
   - Project Name: `team-rocket-backend`
   - Database Password: Generate secure password
   - Region: Choose closest to you
4. **Wait 2-3 minutes** for setup completion

## 🗄️ **Step 2: Set Up Database Schema**

1. **In Supabase Dashboard** → Go to **SQL Editor**
2. **Copy and paste** the entire contents of `supabase-schema.sql`
3. **Click "RUN"** to create all tables and security policies

### **Tables Created:**
- ✅ `campaigns` - User campaign data and ML results
- ✅ `creative_tests` - Creative testing results
- ✅ `user_profiles` - Extended user information
- ✅ **Row Level Security** enabled on all tables

## 🔑 **Step 3: Get API Keys**

1. **In Supabase Dashboard** → Go to **Settings** → **API**
2. **Copy these values**:

```env
# From "Project URL"
SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# From "Project API keys" → "anon public"  
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# From "Project API keys" → "service_role" (keep secret!)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚙️ **Step 4: Configure Backend**

### **Local Development:**

Create `.env` file in backend folder:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Generate with: openssl rand -hex 32
SECRET_KEY=your-super-secure-jwt-secret-key

# Other existing vars...
ENVIRONMENT=development
DEBUG=true
```

### **Railway Production:**

In Railway dashboard → Environment Variables, add:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
SECRET_KEY=your-super-secure-jwt-secret-key
```

## 🧪 **Step 5: Test Authentication**

### **Register a User:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123",
    "full_name": "Test User"
  }'
```

### **Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "securepassword123"
  }'
```

**Response includes `access_token` - use for authenticated requests!**

### **Test Authenticated Endpoint:**
```bash
curl -X GET http://localhost:8000/api/dashboard/campaigns \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 🎨 **Step 6: Frontend Integration**

### **Install Supabase Client:**
```bash
cd C:\coding\team_rocket
npm install @supabase/supabase-js
```

### **Create Supabase Client:**
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **Environment Variables for Frontend:**
In Vercel → Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

## 🔐 **Step 7: Add Authentication UI**

### **Login Component Example:**
```tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Login error:', error.message)
    } else {
      console.log('Login successful:', data.user)
      // Redirect to dashboard
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
        Login
      </button>
    </form>
  )
}
```

## 📊 **Step 8: User Dashboard**

### **Saved Campaigns Component:**
```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function UserCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  
  useEffect(() => {
    fetchCampaigns()
  }, [])
  
  const fetchCampaigns = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const response = await fetch('/api/dashboard/campaigns', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const result = await response.json()
      if (result.success) {
        setCampaigns(result.campaigns)
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Campaigns</h2>
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="p-4 border rounded">
          <h3 className="font-semibold">{campaign.name}</h3>
          <p className="text-gray-600">
            Created: {new Date(campaign.created_at).toLocaleDateString()}
          </p>
          <p>ROI: {campaign.optimization_results?.expected_roi || 'N/A'}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🔍 **Step 9: Verify Everything Works**

### **Backend API Endpoints Added:**

1. **Authentication:**
   - `POST /api/auth/register` - Register new user
   - `POST /api/auth/login` - Login user  
   - `POST /api/auth/logout` - Logout user
   - `GET /api/auth/me` - Get current user

2. **User Dashboard:**
   - `GET /api/dashboard/campaigns` - Get user's campaigns
   - `POST /api/dashboard/campaigns` - Save new campaign
   - `GET /api/dashboard/campaigns/{id}` - Get specific campaign
   - `PUT /api/dashboard/campaigns/{id}` - Update campaign
   - `DELETE /api/dashboard/campaigns/{id}` - Delete campaign
   - `GET /api/dashboard/stats` - User statistics

3. **Enhanced Features:**
   - ✅ Campaign optimization **still works without auth**
   - ✅ **Automatic saving** when user is logged in
   - ✅ **Privacy protection** with Row Level Security
   - ✅ **User dashboard** for campaign management

## 🚀 **Production Deployment Checklist**

- ✅ **Supabase project created** and schema deployed
- ✅ **Environment variables** set in Railway
- ✅ **Frontend environment variables** set in Vercel
- ✅ **Authentication flow** tested
- ✅ **Database security** (RLS policies active)
- ✅ **API integration** working

## 🔒 **Security Features**

- ✅ **JWT tokens** with expiration
- ✅ **Row Level Security** - users see only their data
- ✅ **Password hashing** with bcrypt
- ✅ **CORS protection** 
- ✅ **SQL injection protection** via Supabase
- ✅ **API key security** (service key server-only)

Your app now has **enterprise-grade authentication** and **user data persistence**! 🎉