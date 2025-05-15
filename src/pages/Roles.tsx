
import { PageLayout } from "@/components/common/PageLayout";
import { RolesTable } from "@/components/roles/RolesTable";

export default function Roles() {
  return (
    <PageLayout title="Role Management">
      <RolesTable />
    </PageLayout>
  );
}
