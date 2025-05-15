
import { PageLayout } from "@/components/common/PageLayout";
import { PeopleTable } from "@/components/users/PeopleTable";

const employees = [
  {
    id: 1,
    name: "Alice Cooper",
    email: "alice.c@aalai.com",
    role: "Service Manager",
    status: "active" as const,
    lastActive: "Now"
  },
  {
    id: 2,
    name: "Bob Richards",
    email: "bob.r@aalai.com",
    role: "Employee",
    status: "active" as const,
    lastActive: "10 minutes ago"
  },
  {
    id: 3,
    name: "Charlie Evans",
    email: "charlie.e@aalai.com",
    role: "Employee",
    status: "active" as const,
    lastActive: "1 hour ago"
  },
  {
    id: 4,
    name: "Diana Miller",
    email: "diana.m@aalai.com",
    role: "Analyst",
    status: "inactive" as const,
    lastActive: "2 days ago"
  },
  {
    id: 5,
    name: "Edward Thompson",
    email: "edward.t@aalai.com",
    role: "Employee",
    status: "pending" as const,
    lastActive: "Never"
  }
];

export default function Employees() {
  return (
    <PageLayout title="Employee Management">
      <PeopleTable 
        title="Employees"
        description="Manage employees and their roles within the system"
        people={employees}
        type="employees"
      />
    </PageLayout>
  );
}
