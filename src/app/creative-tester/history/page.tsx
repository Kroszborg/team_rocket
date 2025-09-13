'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusCircle, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { withAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Creative } from '@/lib/types' // Import the canonical Creative type
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'

interface CreativeHistoryResponse {
  tests: Creative[];
}

function CreativeHistoryPage() {
  const [tests, setTests] = useState<Creative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCreativeHistory = async () => {
      setIsLoading(true);
      try {
        const data: CreativeHistoryResponse = await apiClient.getCreativeHistory();
        setTests(data.tests || []);
      } catch (error) {
        console.error('Failed to fetch creative history', error);
        // Handle error (e.g., show a toast message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreativeHistory();
  }, []);

  const getScoreBadge = (score: number | undefined) => {
    if (score === undefined) return <Badge variant="outline">Not Scored</Badge>;
    if (score >= 80) return <Badge variant="default">Excellent</Badge>;
    if (score >= 60) return <Badge variant="secondary">Good</Badge>;
    if (score >= 40) return <Badge>Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creative History</h1>
          <p className="text-muted-foreground">View results from all your past creative tests.</p>
        </div>
        <Button asChild>
          <Link href="/creative-tester">
            <PlusCircle className="mr-2 h-4 w-4" /> Test New Creative
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>A list of all your past creative analyses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : tests.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-10 h-10" />}
              title="No Tests Run Yet"
              description="Get started by testing your first creative asset."
              action={{ label: 'Test a Creative', onClick: () => router.push('/creative-tester') }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creative</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell>{getScoreBadge(test.score?.overall)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/creative-tester/results/${test.id}`}>View Report</Link>
                      </Button>
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

export default withAuth(CreativeHistoryPage);
