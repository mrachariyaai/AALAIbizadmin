import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";

type Business = {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  address?: string;
  email?: string;
  phone?: string;
};

// Create a custom event for business updates
export const BUSINESS_UPDATED_EVENT = "businessUpdated";

export function BusinessSwitcher() {
  const [value, setValue] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadBusinesses = () => {
    try {
      // Get businesses from localStorage or use default
      const savedBusinesses = localStorage.getItem("aalaiBusinesses");
      const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
      
      const initialBusinesses = savedBusinesses 
        ? JSON.parse(savedBusinesses)
        : [
            { id: "b1", name: "Acme Corp" },
            { id: "b2", name: "Globex Industries" },
          ];
      
      // Ensure we always have an array, even if parsing failed
      const safeBusinesses = Array.isArray(initialBusinesses) ? initialBusinesses : [];
      
      setBusinesses(safeBusinesses);
      
      // Set the selected business value if it exists in the businesses array
      if (selectedBusinessId && safeBusinesses.some(b => b.id === selectedBusinessId)) {
        setValue(selectedBusinessId);
      } else if (safeBusinesses.length > 0) {
        // If no selected business or selected business not found, set to first business
        setValue(safeBusinesses[0].id);
        localStorage.setItem("aalaiSelectedBusiness", safeBusinesses[0].id);
      }

      // Mark as loaded after initialization
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading businesses:", error);
      // Set fallback data in case of error
      setBusinesses([{ id: "default", name: "Default Business" }]);
      setValue("default");
      localStorage.setItem("aalaiSelectedBusiness", "default");
      setIsLoaded(true);
    }
  };

  // Initial load
  useEffect(() => {
    loadBusinesses();
    
    // Listen for business updated events
    window.addEventListener(BUSINESS_UPDATED_EVENT, loadBusinesses);
    
    // Cleanup
    return () => {
      window.removeEventListener(BUSINESS_UPDATED_EVENT, loadBusinesses);
    };
  }, []);

  const handleBusinessChange = (newValue: string) => {
    setValue(newValue);
    
    // Save selected business ID to localStorage for persistence
    localStorage.setItem("aalaiSelectedBusiness", newValue);
    
    // You can add additional logic here if needed when a business is selected
    console.log("Selected business ID:", newValue);
  };

  // Don't render until data is loaded
  if (!isLoaded) {
    return (
      <Button variant="outline" className="w-[200px] justify-between">
        <span className="text-muted-foreground">Loading...</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Select value={value} onValueChange={handleBusinessChange}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select business">
          {value && businesses.find(b => b.id === value) && (
            <div className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              {businesses.find(b => b.id === value)?.name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {businesses.length > 0 ? (
          businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              {business.name}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-sm text-muted-foreground">No businesses available</div>
        )}
      </SelectContent>
    </Select>
  );
}