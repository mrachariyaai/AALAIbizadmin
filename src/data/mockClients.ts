
import { Client, Contract, SupportTicket } from "@/types/client";

export const mockClients: Client[] = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@acmecorp.com",
    phone: "+1 (555) 123-4567",
    companyName: "ACME Corporation",
    industry: "Manufacturing",
    address: "123 Main St, Anytown, CA 90210",
    website: "https://acmecorp.com",
    logo: "/placeholder.svg",
    subscriptionTier: "Premium",
    onboardingStatus: "Completed",
    activeSince: "2023-01-15"
  },
  {
    id: "c2",
    name: "Emily Johnson",
    email: "emily@technovate.io",
    phone: "+1 (555) 987-6543",
    companyName: "Technovate",
    industry: "Technology",
    address: "456 Innovation Dr, Tech City, WA 98001",
    website: "https://technovate.io",
    subscriptionTier: "Enterprise",
    onboardingStatus: "Completed",
    activeSince: "2023-03-10"
  },
  {
    id: "c3",
    name: "Robert Chen",
    email: "robert@greenleaf.org",
    phone: "+1 (555) 456-7890",
    companyName: "GreenLeaf Organics",
    industry: "Agriculture",
    address: "789 Farm Rd, Rural County, OR 97201",
    subscriptionTier: "Standard",
    onboardingStatus: "In Progress",
    activeSince: "2023-08-22",
    notes: "Needs additional training on the platform."
  },
  {
    id: "c4",
    name: "Sarah Williams",
    email: "sarah@medipro.health",
    phone: "+1 (555) 222-3333",
    companyName: "MediPro Health Services",
    industry: "Healthcare",
    address: "321 Hospital Way, Wellness City, NY 10001",
    website: "https://medipro.health",
    subscriptionTier: "Premium",
    onboardingStatus: "In Progress",
    activeSince: "2023-10-05"
  },
  {
    id: "c5",
    name: "Michael Davis",
    email: "michael@eduquest.edu",
    phone: "+1 (555) 777-8888",
    companyName: "EduQuest Learning",
    industry: "Education",
    address: "555 Campus Blvd, Knowledge Park, MA 02108",
    website: "https://eduquest.edu",
    subscriptionTier: "Basic",
    onboardingStatus: "Not Started",
    activeSince: "2024-04-01",
    notes: "Just signed up, awaiting kickoff meeting."
  }
];

export const mockTickets: SupportTicket[] = [
  {
    id: "t1",
    clientId: "c1",
    subject: "Login issues after password reset",
    description: "Users are unable to log in after password reset was performed.",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-05-10T09:15:00Z",
    updatedAt: "2024-05-10T14:30:00Z",
    assignedTo: "Support Agent 1"
  },
  {
    id: "t2",
    clientId: "c1",
    subject: "Data import failure",
    description: "Batch import of customer data failed with error code 403.",
    status: "Open",
    priority: "Critical",
    createdAt: "2024-05-12T11:20:00Z",
    updatedAt: "2024-05-12T11:20:00Z"
  },
  {
    id: "t3",
    clientId: "c2",
    subject: "Feature request: Enhanced reporting",
    description: "Request to add custom fields to monthly activity reports.",
    status: "Open",
    priority: "Medium",
    createdAt: "2024-05-08T15:45:00Z",
    updatedAt: "2024-05-08T15:45:00Z",
    assignedTo: "Product Manager"
  },
  {
    id: "t4",
    clientId: "c3",
    subject: "Mobile app crashing",
    description: "iOS app crashes when uploading images larger than 5MB.",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-05-11T08:30:00Z",
    updatedAt: "2024-05-11T10:15:00Z",
    assignedTo: "Mobile Dev Team"
  },
  {
    id: "t5",
    clientId: "c4",
    subject: "Billing discrepancy",
    description: "April invoice shows charges for unused services.",
    status: "Resolved",
    priority: "Medium",
    createdAt: "2024-05-01T13:20:00Z",
    updatedAt: "2024-05-03T09:45:00Z",
    assignedTo: "Billing Department"
  }
];

export const mockContracts: Contract[] = [
  {
    id: "ct1",
    clientId: "c1",
    name: "ACME Premium Service Agreement",
    type: "Service Contract",
    startDate: "2023-01-15",
    endDate: "2024-01-14",
    status: "Active",
    value: 25000,
    documentUrl: "/contracts/acme-premium-agreement.pdf",
    notes: "Auto-renewal clause included"
  },
  {
    id: "ct2",
    clientId: "c1",
    name: "ACME Data Processing Addendum",
    type: "Legal Agreement",
    startDate: "2023-01-15",
    endDate: "2024-01-14",
    status: "Active",
    value: 0,
    documentUrl: "/contracts/acme-dpa.pdf"
  },
  {
    id: "ct3",
    clientId: "c2",
    name: "Technovate Enterprise Agreement",
    type: "Service Contract",
    startDate: "2023-03-10",
    endDate: "2026-03-09",
    status: "Active",
    value: 120000,
    documentUrl: "/contracts/technovate-enterprise.pdf",
    notes: "3-year contract with quarterly payment schedule"
  },
  {
    id: "ct4",
    clientId: "c3",
    name: "GreenLeaf Standard License",
    type: "License Agreement",
    startDate: "2023-08-22",
    endDate: "2024-08-21",
    status: "Active",
    value: 8000,
    documentUrl: "/contracts/greenleaf-license.pdf"
  },
  {
    id: "ct5",
    clientId: "c4",
    name: "MediPro Premium Contract",
    type: "Service Contract",
    startDate: "2023-10-05",
    endDate: "2025-10-04",
    status: "Active",
    value: 45000,
    documentUrl: "/contracts/medipro-premium.pdf",
    notes: "Includes HIPAA compliance addendum"
  },
  {
    id: "ct6",
    clientId: "c5",
    name: "EduQuest Basic Service",
    type: "Service Contract",
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    status: "Pending Signature",
    value: 5000,
    documentUrl: "/contracts/eduquest-basic.pdf",
    notes: "Awaiting final signature from client"
  }
];
