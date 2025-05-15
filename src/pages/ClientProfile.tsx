
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageLayout } from "@/components/common/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileText, Building, Package, Check, Ticket, FileContract, Edit, ChevronLeft } from "lucide-react";
import { mockClients, mockTickets, mockContracts } from "@/data/mockClients";
import { Client } from "@/types/client";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { ClientDetailsPanel } from "@/components/clients/ClientDetailsPanel";
import { TicketDialog } from "@/components/clients/TicketDialog";
import { ContractDialog } from "@/components/clients/ContractDialog";

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we'd fetch this from an API
    const foundClient = mockClients.find(c => c.id === id);
    if (!foundClient) {
      navigate("/clients");
    }
    setClient(foundClient);
  }, [id, navigate]);

  const handleUpdateClient = (updatedClient: Omit<Client, "id">) => {
    if (client) {
      setClient({ ...updatedClient, id: client.id });
    }
    setIsEditDialogOpen(false);
  };

  // Get filtered data for this client
  const clientTickets = mockTickets.filter(ticket => ticket.clientId === id);
  const clientContracts = mockContracts.filter(contract => contract.clientId === id);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout>
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/clients">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{client.companyName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/clients")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{client.companyName}</h1>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Edit Client
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <ClientDetailsPanel client={client} />
        </TabsContent>
        
        <TabsContent value="tickets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>View and manage support tickets for this client</CardDescription>
              </div>
              <Button onClick={() => setIsTicketDialogOpen(true)}>Add Ticket</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {ticket.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={ticket.status === 'Open' ? 'destructive' : 
                                 ticket.status === 'In Progress' ? 'default' :
                                 ticket.status === 'Resolved' ? 'secondary' : 'outline'}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={ticket.priority === 'Critical' ? 'destructive' : 
                                 ticket.priority === 'High' ? 'default' :
                                 ticket.priority === 'Medium' ? 'secondary' : 'outline'}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{ticket.assignedTo || "Unassigned"}</TableCell>
                    </TableRow>
                  ))}
                  {clientTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>Manage client contracts and agreements</CardDescription>
              </div>
              <Button onClick={() => setIsContractDialogOpen(true)}>Add Contract</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="font-medium">{contract.name}</div>
                        {contract.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {contract.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={contract.status === 'Active' ? 'default' : 
                                contract.status === 'Pending Signature' ? 'secondary' :
                                contract.status === 'Expired' ? 'outline' : 'destructive'}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.startDate}</TableCell>
                      <TableCell>{contract.endDate}</TableCell>
                      <TableCell>${contract.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {clientContracts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ClientDialog
        client={client}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateClient}
      />

      <TicketDialog
        clientId={client.id}
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
      />

      <ContractDialog
        clientId={client.id}
        open={isContractDialogOpen}
        onOpenChange={setIsContractDialogOpen}
      />
    </PageLayout>
  );
}
