'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusCircle, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { withAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Campaign } from '@/lib/types' // Import the canonical Campaign type
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'

// The local Campaign definition is removed.

interface CampaignsResponse {
  campaigns: Campaign[];
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">{status}</Badge>;
      case 'completed':
        return <Badge variant="outline">{status}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{status}</Badge>;
      case 'paused':
      case 'archived':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">View and manage all your marketing campaigns.</p>
        </div>
        <Button asChild>
          <Link href="/campaign/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Campaign
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>A list of all your saved and past campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState
              title="No Campaigns Yet"
              description="Get started by creating your first marketing campaign."
              action={{ label: 'Create Campaign', onClick: () => router.push('/campaign/new') }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild><Link href={`/campaign/${campaign.id}`}>View Details</Link></DropdownMenuItem>
                          <DropdownMenuItem>View Results</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(CampaignsPage);
