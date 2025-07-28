
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Edit, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { listServices } from "@/api/business";
import { useSelectedBusinessId } from "@/contexts/BusinessContext";

interface Service {
  service_id: number;
  name: string;
  type: string;
  status: "active" | "inactive" | "pending" | "error";
  last_updated: string;
  users: number;
}

export function ServicesTable() {

  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);

  const businessId = useSelectedBusinessId();
  
  useEffect(() => {


    // Fetch services from API
    listServices(businessId)
      .then((data) => {
        console.log("Fetched services: ", data);
        setServices(data);
      })
      .catch((error) => {
        console.error("Error fetching services: ", error);
        // Fallback to static data if API fails
        setServices([]);
      }); 
  }, [businessId])

  const getStatusBadge = (status: Service["status"]) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription>Manage your AALAI services and connected agents</CardDescription>
          </div>
          <Button onClick={() => navigate("/services/new")}>Add Service</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Users</th>
                <th className="px-4 py-3 text-left">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.service_id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div className="font-medium">{service.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{service.type}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(service.status)}</td>
                  <td className="px-4 py-3 text-center">{service.users}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(service.last_updated).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="icon" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
