
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "stakeholders" | "employees";
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive" | "pending";
    lastActive: string;
  };
}

export function UserDialog({ isOpen, onClose, title, type, user }: UserDialogProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(user?.status || "active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, this would be connected to an API
    // This is just a simulation of form submission
    toast.success(
      user ? `${type === "stakeholders" ? "Stakeholder" : "Employee"} updated successfully` 
           : `${type === "stakeholders" ? "Stakeholder" : "Employee"} added successfully`
    );
    
    onClose();
  };

  const roleOptions = type === "stakeholders" 
    ? ["Primary Stakeholder", "Investor", "Board Member", "Advisor"] 
    : ["Service Manager", "Employee", "Analyst", "Director"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Fill out the details below to {user ? "update" : "add"} a {type === "stakeholders" ? "stakeholder" : "employee"}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="col-span-3" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={status} onValueChange={(value: "active" | "inactive" | "pending") => setStatus(value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{user ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
