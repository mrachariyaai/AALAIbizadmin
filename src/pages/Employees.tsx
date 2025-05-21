import { PageLayout } from "@/components/common/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Edit, Plus, Shield, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { AddEmployeeDialog } from "@/components/Employee/AddEmployeeDialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<typeof employees[0] | undefined>(undefined);
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | undefined>(undefined);

  const handleDelete = (user: typeof employees[0]) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (user: typeof employees[0]) => {
    setSelectedEmployee(user);
    setAddEmployeeDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedEmployee(undefined);
    setAddEmployeeDialogOpen(true);
  };

  const confirmDelete = () => {
    toast.success("Employee deleted successfully");
    setDeleteDialogOpen(false);
  };

  const getStatusBadge = (status: typeof employees[0]["status"]) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageLayout title="Employee Management">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Manage employees and their roles within the system</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Last Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <div className="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center text-xs">
                            {person.name.split(" ").map(name => name[0]).join("")}
                          </div>
                        </Avatar>
                        <div className="font-medium">{person.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{person.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{person.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(person.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{person.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(person)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(person)}>
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

      {/* Add/Edit Employee Dialog */}
      <AddEmployeeDialog 
        isOpen={addEmployeeDialogOpen}
        onClose={() => {
          setAddEmployeeDialogOpen(false);
          setSelectedEmployee(undefined);
        }}
        title={selectedEmployee ? "Edit Employee" : "Add New Employee"}
        user={selectedEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
