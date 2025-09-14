'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  MoreHorizontal,
  Search,
  Download,
  BarChart3,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { withAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Campaign } from '@/lib/types'

// The local Campaign definition is removed.

interface CampaignsResponse {
  campaigns: Campaign[];
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Memoized filtered and sorted campaigns
  const filteredCampaigns = useMemo(() => {
    const filtered = campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || campaign.status === statusFilter)
    );

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'budget':
          return (b.budget?.total || 0) - (a.budget?.total || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchQuery, statusFilter, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0);
    const avgROI = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.optimization_results?.expected_roi || 0), 0) / campaigns.length 
      : 0;
    const activeCount = campaigns.filter(c => c.status === 'active').length;
    const completedCount = campaigns.filter(c => c.status === 'completed').length;

    return {
      total: campaigns.length,
      active: activeCount,
      completed: completedCount,
      totalBudget,
      avgROI
    };
  }, [campaigns]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const data: CampaignsResponse = await apiClient.getCampaigns();
        setCampaigns(data.campaigns || []);
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
        // Handle error (e.g., show a toast message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (campaignId: string, campaignName: string) => {
    if (confirm(`Are you sure you want to delete "${campaignName}"?`)) {
      try {
        // Add delete API call here when backend is ready
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const handleExportData = () => {
    const data = filteredCampaigns.map(campaign => ({
      name: campaign.name,
      status: campaign.status,
      created: new Date(campaign.created_at).toLocaleDateString(),
      budget: campaign.budget?.total || 0,
      roi: campaign.optimization_results?.expected_roi ? (campaign.optimization_results.expected_roi * 100).toFixed(1) + '%' : 'N/A'
    }));
    
    const csv = [
      'Name,Status,Created,Budget,ROI',
      ...data.map(row => `${row.name},${row.status},${row.created},$${row.budget},${row.roi}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your campaign tests and optimizations.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button asChild>
              <Link href="/campaign/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active, {stats.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalBudget)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
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
                {(stats.avgROI * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average across campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Campaigns completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Campaign History</CardTitle>
                <CardDescription>Search, filter, and manage your campaigns</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full sm:w-[250px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="budget">Budget High-Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Campaign
                  </Link>
                </Button>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Budget</TableHead>
                      <TableHead className="hidden md:table-cell">Expected ROI</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground sm:hidden">
                              {formatCurrency(campaign.budget?.total || 0)} • {formatDate(campaign.created_at)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {formatCurrency(campaign.budget?.total || 0)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {campaign.optimization_results?.expected_roi ? (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {(campaign.optimization_results.expected_roi * 100).toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Processing...</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(campaign.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/campaign/${campaign.id}/results`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/campaign/${campaign.id}`} className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/campaign/${campaign.id}/results`} className="flex items-center">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Results
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/campaign/${campaign.id}/edit`} className="flex items-center">
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit Campaign
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600" 
                                  onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CampaignsPage);