import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { loadDomains } from "@/api/business";

interface AddBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (business: {
    operation: string;
    business_name: string;
    domain_id: string;
    domain_name: string;
    address: string;
    email: string;
    phone: string;
  }) => void;
}

interface Domain {
  domain_id: string;
  name: string;
}

export function AddBusinessDialog({ open, onOpenChange, onSubmit }: AddBusinessDialogProps) {
  const [businessName, setBusinessName] = useState("");
  const [domainId, setDomainId] = useState("");
  const [domainName, setDomainName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Use React Query to load domains only once with caching
  const { 
    data: domains = [], 
    isLoading: isLoadingDomains,
    error: domainsError 
  } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const data = await loadDomains();
      if (Array.isArray(data)) {
        return data as Domain[];
      } else {
        console.error("Invalid data format for domains:", data);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (domains don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 2,
    retryDelay: 1000,
  });

  const handleDomainChange = (selectedDomainId: string) => {
    const selectedDomain = domains.find(domain => domain.domain_id === selectedDomainId);
    if (selectedDomain) {
      setDomainId(selectedDomain.domain_id);
      setDomainName(selectedDomain.name);
    }
  };

  const resetForm = () => {
    setBusinessName("");
    setDomainId("");
    setDomainName("");
    setAddress("");
    setEmail("");
    setPhone("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }
    
    if (!email.trim()) {
      setError("Business email is required");
      return;
    }

    if (!domainId.trim()) {
      setError("Domain selection is required");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Create the new business object
      const newBusiness = {
        operation: "create",
        business_name: businessName.trim(),
        domain_id: domainId.trim(),
        domain_name: domainName.trim(),
        address: address.trim(),
        email: email.trim(),
        phone: phone.trim()
      };
      
      // Call the onSubmit handler
      onSubmit(newBusiness);
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error adding business:", error);
      setError("Failed to add business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Show error if domains failed to load
  if (domainsError) {
    console.error("Error loading domains:", domainsError);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Business</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="domain" className="text-right">
                Domain
              </Label>
              <Select 
                value={domainId} 
                onValueChange={handleDomainChange}
                disabled={isLoadingDomains}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue 
                    placeholder={
                      isLoadingDomains 
                        ? "Loading domains..." 
                        : "Select domain"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingDomains ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Loading domains...
                    </div>
                  ) : domains.length > 0 ? (
                    domains.map((domain) => (
                      <SelectItem key={domain.domain_id} value={domain.domain_id}>
                        {domain.name.charAt(0).toUpperCase() + domain.name.slice(1)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No domains available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
                placeholder="Enter business address"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Business Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="Enter business email"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Business Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                placeholder="Enter business phone"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoadingDomains}
            >
              {isSubmitting ? "Adding..." : "Add Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Optional: Create a custom hook for domains if need them elsewhere
export const useDomains = () => {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const data = await loadDomains();
      if (Array.isArray(data)) {
        return data as Domain[];
      } else {
        console.error("Invalid data format for domains:", data);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: 1000,
  });
};