
import { useState } from "react";
import { PageLayout } from "@/components/common/PageLayout";
import { ClientDetailsPanel } from "@/components/clients/ClientDetailsPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { ContractDialog } from "@/components/clients/ContractDialog";
import { TicketDialog } from "@/components/clients/TicketDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  File,
  MessageSquare,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { Client } from "@/types/client";

export default function ClientProfile() {
  const { id } = useParams();
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  // Mock client data - updated to match Client interface
  const client: Client = {
    id: id || "1",
    name: "Acme Corporation",
    email: "contact@acmecorp.com",
    phone: "(555) 123-4567",
    companyName: "Acme Corporation",  // Added to match interface
    industry: "Technology",
    address: "123 Business Ave, Commerce City, CA 90210",
    website: "www.acmecorp.com",
    subscriptionTier: "Enterprise", // Changed from planTier to match interface
    onboardingStatus: "Completed", // Updated to match allowed values
    activeSince: "2023-01-15", // Added to match interface
    notes: "Key enterprise client with multiple service contracts",
    // Additional properties from the mock client that we'll handle in the component
    contracts: [
      { id: "c1", name: "Services Agreement", status: "Active", startDate: "2023-01-15", endDate: "2024-01-14" },
      { id: "c2", name: "Support Agreement", status: "Active", startDate: "2023-01-15", endDate: "2024-01-14" }
    ],
    tickets: [
      { id: "t1", title: "Login Issues", status: "Open", priority: "High", created: "2023-05-10" },
      { id: "t2", title: "Feature Request", status: "In Progress", priority: "Medium", created: "2023-06-05" },
      { id: "t3", title: "Billing Question", status: "Closed", priority: "Low", created: "2023-04-22" }
    ]
  };

  return (
    <PageLayout title="Client Details">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/clients" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Link>
        </Button>
      </div>

      <ClientDetailsPanel client={client} />

      <Tabs defaultValue="contracts" className="mt-8">
        <TabsList>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contracts" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Contract Management</h3>
            <Button onClick={() => setIsContractDialogOpen(true)}>
              Add Contract
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.contracts && client.contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <File className="h-5 w-5 text-primary" />
                      {contract.name}
                    </div>
                    <Badge>{contract.status}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Valid: {contract.startDate} to {contract.endDate}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" size="sm">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tickets" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Support Tickets</h3>
            <Button onClick={() => setIsTicketDialogOpen(true)}>
              Create Ticket
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.tickets && client.tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {ticket.title}
                    </div>
                    <Badge variant={ticket.status === "Closed" ? "outline" : "default"}>
                      {ticket.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Priority: {ticket.priority}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Created: {ticket.created}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">View Ticket</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="onboarding" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>Current status: {client.onboardingStatus}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Setup Completed</p>
                    <p className="text-sm text-muted-foreground">Account setup and initial configuration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Integration Completed</p>
                    <p className="text-sm text-muted-foreground">Systems integration and data setup</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Training Completed</p>
                    <p className="text-sm text-muted-foreground">User training and documentation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Client Users</h3>
            <Button>Add User</Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>Manage users associated with this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p className="font-medium">John Smith</p>
                    <p className="text-sm text-muted-foreground">Primary Contact • Admin</p>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Technical Lead • Standard User</p>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ClientDialog 
        open={isClientDialogOpen} 
        onOpenChange={setIsClientDialogOpen}
        client={client}
        mode="edit"
        onSave={() => {}}
      />
      
      <ContractDialog
        open={isContractDialogOpen}
        onOpenChange={setIsContractDialogOpen}
        clientId={client.id}
      />
      
      <TicketDialog
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        clientId={client.id}
      />
    </PageLayout>
  );
}
