import { MainLayout } from '@/components/layout/main-layout';
import { ResultsDashboard } from '@/components/campaign/results/results-dashboard';

interface ResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  return (
    <MainLayout>
      <ResultsDashboard campaignId={id} />
    </MainLayout>
  );
}