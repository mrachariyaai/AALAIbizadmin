
import { PageLayout } from "@/components/common/PageLayout";
import { ServiceConfigurationWizard } from "@/components/services/ServiceConfigurationWizard";

export default function NewService() {
  return (
    <PageLayout title="Add New Service">
      <ServiceConfigurationWizard />
    </PageLayout>
  );
}
