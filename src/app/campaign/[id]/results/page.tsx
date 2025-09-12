import { MainLayout } from '@/components/layout/main-layout';
import { ResultsDashboard } from '@/components/campaign/results/results-dashboard';

export default function ResultsPage() {
  return (
    <MainLayout>
      <ResultsDashboard />
    </MainLayout>
  );
}