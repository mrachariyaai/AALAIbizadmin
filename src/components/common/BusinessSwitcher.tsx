import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { useBusinessContext } from "@/contexts/BusinessContext";

type Business = {
  business_id: string;
  business_name: string;
  logo?: string;
  industry?: string;
  address?: string;
  email?: string;
  phone?: string;
};

// Keep the custom event for backward compatibility
export const BUSINESS_UPDATED_EVENT = "businessUpdated";

export function BusinessSwitcher() {
  const { 
    businesses, 
    selectedBusiness, 
    setSelectedBusiness, 
    isLoading 
  } = useBusinessContext();
  
  const [value, setValue] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selected business from localStorage when businesses are loaded
  useEffect(() => {
    if (businesses.length > 0 && !isInitialized) {
      const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
      
      // Find the business in the current list
      const businessToSelect = selectedBusinessId 
        ? businesses.find(b => b.business_id === selectedBusinessId)
        : businesses[0]; // Default to first business
      
      if (businessToSelect) {
        setValue(businessToSelect.business_id);
        setSelectedBusiness(businessToSelect);
        localStorage.setItem("aalaiSelectedBusiness", businessToSelect.business_id);
      }
      
      setIsInitialized(true);
    }
  }, [businesses, isInitialized, setSelectedBusiness]);

  // Keep the custom event listener for backward compatibility
  useEffect(() => {
    const handleBusinessUpdate = () => {
      // The context will automatically handle the refresh
      // This is just for backward compatibility
    };

    window.addEventListener(BUSINESS_UPDATED_EVENT, handleBusinessUpdate);
    
    return () => {
      window.removeEventListener(BUSINESS_UPDATED_EVENT, handleBusinessUpdate);
    };
  }, []);

  // Update local state when context changes (e.g., when a new business is added)
  useEffect(() => {
    if (selectedBusiness) {
      setValue(selectedBusiness.business_id);
    }
  }, [selectedBusiness]);

  const handleBusinessChange = (newValue: string) => {
    const selectedBus = businesses.find(b => b.business_id === newValue);
    
    if (selectedBus) {
      setValue(newValue);
      setSelectedBusiness(selectedBus);
      localStorage.setItem("aalaiSelectedBusiness", newValue);
      console.log("Selected business ID:", newValue);
    }
  };

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <Button variant="outline" className="w-[300px] justify-between">
        <span className="text-muted-foreground">Loading...</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Select value={value} onValueChange={handleBusinessChange}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select business">
          {value && businesses.find(b => b.business_id === value) && (
            <div className="flex items-center">
              <Building className="mr-2 h-4 w-4" key={value}/>
              {businesses.find(b => b.business_id === value)?.business_name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {businesses.length > 0 ? (
          businesses.map((business) => (
            <SelectItem key={business.business_id} value={business.business_id}>
              {business.business_name}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-sm text-muted-foreground">No businesses available</div>
        )}
      </SelectContent>
    </Select>
  );
}