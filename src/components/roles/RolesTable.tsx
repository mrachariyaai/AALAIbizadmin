
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Role {
  id: number;
  name: string;
  description: string;
  users: number;
  permissions: number;
  isSystem: boolean;
  lastUpdated: string;
}

const roles: Role[] = [
  {
    id: 1,
    name: "Admin",
    description: "Full access to all system features",
    users: 2,
    permissions: 35,
    isSystem: true,
    lastUpdated: "2025-04-15"
  },
  {
    id: 2,
    name: "Stakeholder",
    description: "View business metrics and reports",
    users: 5,
    permissions: 12,
    isSystem: true,
    lastUpdated: "2025-04-20"
  },
  {
    id: 3,
    name: "Employee",
    description: "Standard employee access",
    users: 12,
    permissions: 8,
    isSystem: true,
    lastUpdated: "2025-05-01"
  },
  {
    id: 4,
    name: "Service Manager",
    description: "Manage services and connected databases",
    users: 3,
    permissions: 15,
    isSystem: false,
    lastUpdated: "2025-05-08"
  },
  {
    id: 5,
    name: "Analyst",
    description: "View and export business analytics",
    users: 4,
    permissions: 7,
    isSystem: false,
    lastUpdated: "2025-05-10"
  }
];

export function RolesTable() {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Define and manage access roles for your organization</CardDescription>
          </div>
          <Button onClick={() => navigate("/roles/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Users</th>
                <th className="px-4 py-3 text-center">Permissions</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-left">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div className="font-medium">{role.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{role.description}</td>
                  <td className="px-4 py-3 text-center">{role.users}</td>
                  <td className="px-4 py-3 text-center">{role.permissions}</td>
                  <td className="px-4 py-3 text-center">
                    {role.isSystem ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{role.lastUpdated}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="icon" variant="ghost" disabled={role.isSystem}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" disabled={role.isSystem}>
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
