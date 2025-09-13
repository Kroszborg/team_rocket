"use client";

import { useEffect, useState } from "react";
import { useAuth, withAuth } from "@/contexts/AuthContext";
import { useCampaigns, useUserStats } from "@/hooks/useApiWithAuth";
import Link from "next/link";

function DashboardPage() {
  const { user, signOut } = useAuth();
  const {
    campaigns,
    loading: campaignsLoading,
    error,
    fetchCampaigns,
    deleteCampaign,
  } = useCampaigns();
  const { stats, loading: statsLoading } = useUserStats();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDeleteCampaign = async (
    campaignId: string,
    campaignName: string
  ) => {
    if (confirm(`Are you sure you want to delete "${campaignName}"?`)) {
      setDeletingId(campaignId);
      const result = await deleteCampaign(campaignId);
      setDeletingId(null);

      if (!result.success) {
        alert("Failed to delete campaign: " + result.error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.full_name || user?.email}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your campaigns and track performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/campaign/new"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition duration-200"
              >
                New Campaign
              </Link>
              <Link
                href="/creative-tester"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-lg font-medium transition duration-200"
              >
                Test Creative
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Profile
              </Link>
              <button
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Total Campaigns
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? "..." : stats?.totalCampaigns || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary/10">
                <svg
                  className="w-6 h-6 text-secondary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Creative Tests
                </h3>
                <p className="text-2xl font-bold text-secondary-foreground">
                  {statsLoading ? "..." : stats?.totalCreatives || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent">
                <svg
                  className="w-6 h-6 text-accent-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Member Since
                </h3>
                <p className="text-2xl font-bold text-accent-foreground">
                  {statsLoading ? "..." : stats?.memberSince || "2024"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-card rounded-lg border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Your Campaigns
              </h2>
              <Link
                href="/campaign/new"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Create New Campaign
              </Link>
            </div>
          </div>

          <div className="p-6">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">
                  Loading campaigns...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-destructive mb-2">
                  Failed to load campaigns
                </div>
                <p className="text-muted-foreground text-sm">{error}</p>
                <button
                  onClick={fetchCampaigns}
                  className="mt-4 text-primary hover:text-primary/80 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No campaigns yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to get started with optimization
                </p>
                <Link
                  href="/campaign/new"
                  className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition duration-200"
                >
                  Create First Campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {campaign.name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Product:</span>
                            <p className="font-medium">
                              {campaign.product?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Budget:</span>
                            <p className="font-medium">
                              {formatCurrency(campaign.budget?.total || 0)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Expected ROI:</span>
                            <p className="font-medium text-green-600">
                              {campaign.optimization_results?.expected_roi
                                ? `${(
                                    campaign.optimization_results.expected_roi *
                                    100
                                  ).toFixed(1)}%`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p className="font-medium">
                              {formatDate(campaign.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() =>
                            handleDeleteCampaign(campaign.id, campaign.name)
                          }
                          disabled={deletingId === campaign.id}
                          className="text-red-600 hover:text-red-700 disabled:text-red-400 p-2 rounded transition duration-200"
                          title="Delete campaign"
                        >
                          {deletingId === campaign.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
