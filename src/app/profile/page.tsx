'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { Campaign, Creative } from '@/lib/types'
import {
  User,
  Settings,
  History,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Calendar,
  DollarSign,
  LogOut,
  Eye,
  Sparkles,
  Activity
} from 'lucide-react'

interface ProfileData {
  full_name: string;
  company?: string;
  role?: string;
}

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  company: z.string().optional(),
  role: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function ProfilePage() {
  const { user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [creativeTests, setCreativeTests] = useState<Creative[]>([])
  const [statsLoading, setStatsLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      company: '',
      role: '',
    },
  })

  const { isSubmitting } = form.formState

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true)
      setStatsLoading(true)
      try {
        // Fetch profile data
        const profileData: ProfileData = await apiClient.getProfile()
        if (profileData) {
          form.reset({
            full_name: profileData.full_name || user?.full_name || '',
            company: profileData.company || '',
            role: profileData.role || '',
          })
        }

        // Fetch campaigns
        const campaignsData = await apiClient.getCampaigns()
        setCampaigns(campaignsData.campaigns?.slice(0, 5) || []) // Show only recent 5

        // TODO: Fetch creative tests when API is ready
        // const creativeData = await apiClient.getCreativeTests()
        // setCreativeTests(creativeData.tests?.slice(0, 5) || [])
        setCreativeTests([]) // Placeholder
      } catch (error) {
        console.error('Failed to fetch profile data', error)
        toast.error('Failed to load some profile data.')
        // Set form defaults from auth context if API fails
        form.reset({ full_name: user?.full_name || '' })
      } finally {
        setIsLoading(false)
        setStatsLoading(false)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await apiClient.updateProfile(values)
      toast.success('Your profile has been updated.')
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update your profile.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">{status}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{status}</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'archived':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate user statistics
  const userStats = {
    totalCampaigns: campaigns.length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0),
    avgROI: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.optimization_results?.expected_roi || 0), 0) / campaigns.length 
      : 0,
    totalCreatives: creativeTests.length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        {/* Header with User Info */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={undefined} alt={user?.full_name || user?.email || 'User'} />
              <AvatarFallback className="text-lg">
                {(user?.full_name || user?.email || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user?.full_name || user?.email}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              {form.watch('company') && (
                <p className="text-sm text-muted-foreground">{form.watch('company')}</p>
              )}
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{userStats.totalCampaigns}</div>
                  <div className="text-xs text-muted-foreground">Campaigns</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{userStats.completedCampaigns}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">${Math.round(userStats.totalBudget / 1000)}k</div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{(userStats.avgROI * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Avg ROI</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{userStats.totalCreatives}</div>
                  <div className="text-xs text-muted-foreground">Creatives</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <BarChart3 className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="creatives">
              <Lightbulb className="h-4 w-4 mr-2" />
              Creatives
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and account preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="cursor-not-allowed bg-muted" 
                      />
                      <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        {...form.register('full_name')} 
                        disabled={isSubmitting} 
                        className="h-10"
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        {...form.register('company')} 
                        disabled={isSubmitting} 
                        placeholder="Your company name"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        onValueChange={(value) => form.setValue('role', value)} 
                        value={form.watch('role') || ''} 
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                          <SelectItem value="digital-marketer">Digital Marketer</SelectItem>
                          <SelectItem value="campaign-manager">Campaign Manager</SelectItem>
                          <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                          <SelectItem value="founder">Founder</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account settings and security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your account password for better security.</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">Download Data</h3>
                    <p className="text-sm text-muted-foreground">Export all your campaigns and creative test data.</p>
                  </div>
                  <Button variant="outline">Export Data</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                  <div>
                    <h3 className="font-medium text-destructive">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                  </div>
                  <Button variant="outline" onClick={signOut} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign History Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Campaigns</CardTitle>
                    <CardDescription>Your latest campaign tests and optimizations</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/campaigns">
                      <History className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    <span className="text-muted-foreground">Loading campaigns...</span>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">Start optimizing your marketing with your first campaign</p>
                    <Button asChild>
                      <Link href="/campaign/new">Create First Campaign</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{campaign.name}</h4>
                            {getStatusBadge(campaign.status)}
                            {campaign.optimization_results?.expected_roi && (
                              <Badge variant="secondary">
                                {(campaign.optimization_results.expected_roi * 100).toFixed(1)}% ROI
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(campaign.budget?.total || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(campaign.created_at)}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/campaign/${campaign.id}/results`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creative Tests History Tab */}
          <TabsContent value="creatives" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Creative Test History</CardTitle>
                    <CardDescription>Your past creative tests and performance scores</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/creative-tester">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Test Creative
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No creative tests yet</h3>
                  <p className="text-muted-foreground mb-4">Test your ad copy and creatives to see how they perform</p>
                  <Button asChild>
                    <Link href="/creative-tester">Start Testing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default withAuth(ProfilePage)