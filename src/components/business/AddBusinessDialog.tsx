import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BASE_URL } from "@/config";
import { getUserData, setSelectedBusinesses } from "@/config";
import { BUSINESS_UPDATED_EVENT } from "@/components/common/BusinessSwitcher";

interface AddBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (business: {
    id: string;
    name: string;
    category: string;
    description: string;
  }) => void;
}

export function AddBusinessDialog({ open, onOpenChange, onSubmit }: AddBusinessDialogProps) {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUsername(user.user_id);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }
    
    if (!category.trim()) {
      setError("Business category is required");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Make API call
      const response = await fetch(`${BASE_URL}/business/create_business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: username, // This should be dynamic based on logged-in user
          name: businessName.trim(),
          category: category.trim(),
          description: description.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create business');
      }

      const data = await response.json();
      
      // Create the new business object using the response data
      const newBusiness = {
        id: username,
        name: businessName.trim(),
        category: category.trim(),
        description: description.trim()
      };
      
      // Call the onSubmit handler
      onSubmit(newBusiness);
      
      // Set this as the selected business
      setSelectedBusinesses(newBusiness.id)
      
      // Reset form
      setBusinessName("");
      setCategory("");
      setDescription("");

    } catch (error) {
      console.error("Error adding business:", error);
      setError("Failed to add business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Business</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">User Name</Label>
              <div className="col-span-3 text-sm">{username || "-"}</div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Business Name
              </Label>
              <Input
                id="name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="col-span-3"
                placeholder="Enter business name"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Salon">Salon</SelectItem>
                  <SelectItem value="Religious">Religious</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter business description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}