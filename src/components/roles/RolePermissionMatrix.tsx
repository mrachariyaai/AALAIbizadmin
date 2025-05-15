import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
}

const permissionGroups: PermissionGroup[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    permissions: [
      { id: "view_dashboard", name: "View Dashboard", description: "Can view the main dashboard" },
      { id: "view_analytics", name: "View Analytics", description: "Can view business analytics" },
      { id: "export_reports", name: "Export Reports", description: "Can export dashboard reports" }
    ]
  },
  {
    id: "stakeholders",
    name: "Stakeholders",
    permissions: [
      { id: "view_stakeholders", name: "View Stakeholders", description: "Can view stakeholder list" },
      { id: "add_stakeholder", name: "Add Stakeholder", description: "Can add new stakeholders" },
      { id: "edit_stakeholder", name: "Edit Stakeholder", description: "Can edit stakeholder details" },
      { id: "delete_stakeholder", name: "Delete Stakeholder", description: "Can remove stakeholders" }
    ]
  },
  {
    id: "employees",
    name: "Employees",
    permissions: [
      { id: "view_employees", name: "View Employees", description: "Can view employee list" },
      { id: "add_employee", name: "Add Employee", description: "Can add new employees" },
      { id: "edit_employee", name: "Edit Employee", description: "Can edit employee details" },
      { id: "delete_employee", name: "Delete Employee", description: "Can remove employees" }
    ]
  },
  {
    id: "services",
    name: "Services",
    permissions: [
      { id: "view_services", name: "View Services", description: "Can view services list" },
      { id: "configure_service", name: "Configure Service", description: "Can configure services" },
      { id: "add_service", name: "Add Service", description: "Can add new services" },
      { id: "delete_service", name: "Delete Service", description: "Can remove services" }
    ]
  },
  {
    id: "roles",
    name: "Roles & Permissions",
    permissions: [
      { id: "view_roles", name: "View Roles", description: "Can view role list" },
      { id: "assign_roles", name: "Assign Roles", description: "Can assign roles to users" },
      { id: "create_role", name: "Create Role", description: "Can create new roles" },
      { id: "edit_role", name: "Edit Role", description: "Can edit existing roles" },
      { id: "delete_role", name: "Delete Role", description: "Can delete custom roles" }
    ]
  }
];

interface RolePermissionMatrixProps {
  role?: {
    name: string;
    description: string;
    permissions: string[];
  };
  isEditing?: boolean;
}

export function RolePermissionMatrix({ role, isEditing = false }: RolePermissionMatrixProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions || []
  );
  const { toast } = useToast();
  
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prevState => {
      if (prevState.includes(permissionId)) {
        return prevState.filter(id => id !== permissionId);
      } else {
        return [...prevState, permissionId];
      }
    });
  };
  
  const handleGroupToggle = (group: PermissionGroup) => {
    const groupPermissionIds = group.permissions.map(p => p.id);
    const allSelected = groupPermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // If all permissions in the group are selected, unselect them all
      setSelectedPermissions(prevState => 
        prevState.filter(id => !groupPermissionIds.includes(id))
      );
    } else {
      // Otherwise, select all permissions in the group
      const newPermissions = [...selectedPermissions];
      groupPermissionIds.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      setSelectedPermissions(newPermissions);
    }
  };
  
  const isGroupSelected = (group: PermissionGroup) => {
    return group.permissions.every(p => selectedPermissions.includes(p.id));
  };
  
  const isGroupIndeterminate = (group: PermissionGroup) => {
    const selected = group.permissions.some(p => selectedPermissions.includes(p.id));
    return selected && !isGroupSelected(group);
  };
  
  const handleSave = () => {
    toast({
      title: "Permissions updated",
      description: `Updated permissions for ${role?.name || "new role"}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{role?.name || "Define Role Permissions"}</CardTitle>
        <CardDescription>
          {role?.description || "Select the permissions for this role"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {permissionGroups.map(group => (
            <div key={group.id} className="border rounded-md">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer bg-muted/30"
                onClick={() => handleGroupToggle(group)}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`group-${group.id}`}
                    checked={isGroupSelected(group)}
                    className={isGroupIndeterminate(group) ? "opacity-50" : ""}
                    onCheckedChange={() => handleGroupToggle(group)}
                  />
                  <label 
                    htmlFor={`group-${group.id}`} 
                    className="font-medium cursor-pointer"
                  >
                    {group.name}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedPermissions.filter(id => 
                    group.permissions.some(p => p.id === id)
                  ).length} / {group.permissions.length} selected
                </span>
              </div>
              
              <div className="p-4 border-t">
                {group.permissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <label 
                        htmlFor={permission.id} 
                        className="text-sm cursor-pointer"
                      >
                        {permission.name}
                      </label>
                    </div>
                    <div className="flex items-center text-muted-foreground" title={permission.description}>
                      <InfoIcon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Update Permissions" : "Save Permissions"}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
