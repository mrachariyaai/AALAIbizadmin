
export type SubscriptionTier = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type OnboardingStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ContractStatus = 'Draft' | 'Pending Signature' | 'Active' | 'Expired' | 'Terminated';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  address: string;
  website?: string;
  logo?: string;
  subscriptionTier: SubscriptionTier;
  onboardingStatus: OnboardingStatus;
  activeSince: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  attachments?: string[];
}

export interface Contract {
  id: string;
  clientId: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  value: number;
  documentUrl?: string;
  notes?: string;
}
