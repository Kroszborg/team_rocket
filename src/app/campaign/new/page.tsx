import { MainLayout } from '@/components/layout/main-layout';
import { CampaignForm } from '@/components/campaign/new/campaign-form';

export default function NewCampaignPage() {
  return (
    <MainLayout showFooter={false}>
      <CampaignForm />
    </MainLayout>
  );
}