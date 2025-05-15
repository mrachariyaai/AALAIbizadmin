
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { UserDialog } from "@/components/users/UserDialog";
import { Edit, Plus, Shield, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
}

interface PeopleTableProps {
  title: string;
  description: string;
  people: Person[];
  type: "stakeholders" | "employees";
}

export function PeopleTable({ title, description, people, type }: PeopleTableProps) {
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Person | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<Person | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedUser(undefined);
    setUserDialogOpen(true);
  };

  const handleEdit = (user: Person) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleDelete = (user: Person) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast.success(`${type === "stakeholders" ? "Stakeholder" : "Employee"} deleted successfully`);
    setDeleteDialogOpen(false);
  };

  const getStatusBadge = (status: Person["status"]) => {
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
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add {type === "stakeholders" ? "Stakeholder" : "Employee"}
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
                {people.map((person) => (
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

      {/* Add/Edit User Dialog */}
      <UserDialog 
        isOpen={userDialogOpen}
        onClose={() => setUserDialogOpen(false)} 
        title={selectedUser ? `Edit ${type === "stakeholders" ? "Stakeholder" : "Employee"}` : `Add ${type === "stakeholders" ? "Stakeholder" : "Employee"}`}
        type={type}
        user={selectedUser}
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
    </>
  );
}
