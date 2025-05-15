
import { PageLayout } from "@/components/common/PageLayout";
import { PeopleTable } from "@/components/users/PeopleTable";

const stakeholders = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Primary Stakeholder",
    status: "active" as const,
    lastActive: "Today"
  },
  {
    id: 2,
    name: "Emily Johnson",
    email: "emily.j@example.com",
    role: "Investor",
    status: "active" as const,
    lastActive: "Yesterday"
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    role: "Board Member",
    status: "inactive" as const,
    lastActive: "1 week ago"
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    role: "Advisor",
    status: "active" as const,
    lastActive: "3 days ago"
  },
  {
    id: 5,
    name: "Robert Davis",
    email: "robert.d@example.com",
    role: "Investor",
    status: "pending" as const,
    lastActive: "Never"
  }
];

export default function Stakeholders() {
  return (
    <PageLayout title="Stakeholder Management">
      <PeopleTable 
        title="Stakeholders"
        description="Manage stakeholders and their access to business data"
        people={stakeholders}
        type="stakeholders"
      />
    </PageLayout>
  );
}
