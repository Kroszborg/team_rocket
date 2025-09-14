'use client'

import { useEffect, useState } from 'react'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { useCampaigns, useUserStats } from '@/hooks/useApiWithAuth'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  Target,
  Lightbulb,
  Plus,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Sparkles
} from 'lucide-react'

function DashboardPage() {
  const { user } = useAuth()
  const { campaigns, loading: campaignsLoading, fetchCampaigns, deleteCampaign } = useCampaigns()
  const { stats, loading: statsLoading } = useUserStats()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleDeleteCampaign = async (campaignId: string, campaignName: string) => {
    if (confirm(`Are you sure you want to delete "${campaignName}"?`)) {
      setDeletingId(campaignId)
      const result = await deleteCampaign(campaignId)
      setDeletingId(null)
      
      if (!result.success) {
        alert('Failed to delete campaign: ' + result.error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculate analytics from campaigns
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0)
  const avgROI = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.optimization_results?.expected_roi || 0), 0) / campaigns.length 
    : 0
  const recentCampaigns = campaigns.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.full_name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your campaigns today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/creative-tester">
                <Lightbulb className="h-4 w-4 mr-2" />
                Test Creative
              </Link>
            </Button>
            <Button asChild>
              <Link href="/campaign/new">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : campaigns.length}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget Tested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalBudget)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Expected ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(avgROI * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creative Tests</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalCreatives || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+8</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Campaigns</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/campaigns">View All</Link>
                  </Button>
                </div>
                <CardDescription>
                  Your latest campaign simulations and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading campaigns...</span>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <BarChart3 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first campaign to get started with optimization
                    </p>
                    <Button asChild>
                      <Link href="/campaign/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Campaign
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{campaign.name}</h4>
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
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/campaign/${campaign.id}/results`}>
                              View Results
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                            disabled={deletingId === campaign.id}
                          >
                            {deletingId === campaign.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into testing and optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/campaign/new">
                    <Target className="h-4 w-4 mr-2" />
                    Launch Campaign Lab
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/creative-tester">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Test Ad Copy
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/campaigns">
                    <Activity className="h-4 w-4 mr-2" />
                    View All Campaigns
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/profile">
                    <Users className="h-4 w-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's Progress</CardTitle>
                <CardDescription>Your campaign testing activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Campaigns Created</span>
                    <span>{campaigns.length}/10</span>
                  </div>
                  <Progress value={(campaigns.length / 10) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Budget Optimized</span>
                    <span>{formatCurrency(totalBudget)}</span>
                  </div>
                  <Progress value={Math.min((totalBudget / 50000) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Creative Tests</span>
                    <span>{stats?.totalCreatives || 0}/25</span>
                  </div>
                  <Progress value={((stats?.totalCreatives || 0) / 25) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Test multiple budget allocations for the same campaign to find the optimal distribution 
                  across channels. Our AI will help identify the best performing combinations.
                </p>
                <Button size="sm" variant="outline" className="mt-3 w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)