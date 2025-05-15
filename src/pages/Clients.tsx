
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/common/PageLayout";
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
import { Building, Package, Check, Plus, Search } from "lucide-react";
import { mockClients } from "@/data/mockClients";
import { Client, OnboardingStatus, SubscriptionTier } from "@/types/client";
import { ClientDialog } from "@/components/clients/ClientDialog";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [clients, setClients] = useState(mockClients);
  const navigate = useNavigate();

  const filteredClients = clients.filter(
    client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = (client: Omit<Client, "id">) => {
    const newClient = {
      ...client,
      id: `c${clients.length + 1}`,
    };
    setClients([...clients, newClient]);
    setShowAddDialog(false);
  };

  const getStatusColor = (status: OnboardingStatus) => {
    switch(status) {
      case "Completed": return "green";
      case "In Progress": return "blue";
      case "Not Started": return "gray";
      case "On Hold": return "amber";
      default: return "gray";
    }
  };

  const getSubscriptionColor = (tier: SubscriptionTier) => {
    switch(tier) {
      case "Basic": return "gray";
      case "Standard": return "blue";
      case "Premium": return "purple";
      case "Enterprise": return "gold";
      default: return "gray";
    }
  };

  return (
    <PageLayout title="Client Management">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            Manage your client accounts and their subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Onboarding Status</TableHead>
                <TableHead>Active Since</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{client.companyName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={getSubscriptionColor(client.subscriptionTier) as any}>
                        {client.subscriptionTier}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={getStatusColor(client.onboardingStatus) as any}>
                        {client.onboardingStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(client.activeSince).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => navigate(`/clients/${client.id}`)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ClientDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAddClient}
      />
    </PageLayout>
  );
}
