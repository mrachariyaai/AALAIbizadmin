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
import { getUserData, BASE_URL } from "@/config";

type Business = {
  business_id: number;
  name: string;
  category?: string;
  description?: string;
  user_id: string;
};

// Create a custom event for business updates
export const BUSINESS_UPDATED_EVENT = "businessUpdated";

export function BusinessSwitcher({ onBusinessChange = undefined }: { onBusinessChange?: (business: Business) => void }) {
  const [value, setValue] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadBusinesses = async () => {
    try {
      const userData = getUserData();
      if (!userData || !userData.user_id) {
        throw new Error("User not found");
      }

      const response = await fetch(`${BASE_URL}/business/businesses?user_id=${userData.user_id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const businessesData = await response.json();
      const safeBusinesses = Array.isArray(businessesData) ? businessesData : [];
      
      setBusinesses(safeBusinesses);
      
      // Get previously selected business ID
      const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
      
      // Set the selected business value if it exists in the businesses array
      if (selectedBusinessId && safeBusinesses.some(b => b.business_id.toString() === selectedBusinessId)) {
        setValue(selectedBusinessId);
      } else if (safeBusinesses.length > 0) {
        // If no selected business or selected business not found, set to first business
        const firstBusinessId = safeBusinesses[0].business_id.toString();
        setValue(firstBusinessId);
        localStorage.setItem("aalaiSelectedBusiness", firstBusinessId);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading businesses:", error);
      // Set fallback data in case of error
      setBusinesses([{ business_id: 0, name: "Default Business", user_id: "" }]);
      setValue("0");
      localStorage.setItem("aalaiSelectedBusiness", "0");
      setIsLoaded(true);
    }
  };

  // Initial load
  useEffect(() => {
    loadBusinesses();
    
    // Listen for business updated events
    const handleBusinessUpdate = () => {
      console.log("BUSINESS_UPDATED_EVENT received, reloading businesses...");
      loadBusinesses();
    };
    
    window.addEventListener(BUSINESS_UPDATED_EVENT, handleBusinessUpdate);
    console.log("Event listener for BUSINESS_UPDATED_EVENT added.");
    
    // Cleanup
    return () => {
      window.removeEventListener(BUSINESS_UPDATED_EVENT, handleBusinessUpdate);
      console.log("Event listener for BUSINESS_UPDATED_EVENT removed.");
    };
  }, []);

  const handleBusinessChange = (newValue: string) => {
    setValue(newValue);
    localStorage.setItem("aalaiSelectedBusiness", newValue);
    
    // Find the selected business data
    const selectedBusiness = businesses.find(b => b.business_id.toString() === newValue);
    if (selectedBusiness) {
      // Update the settings with business data
      const businessData = {
        id: selectedBusiness.business_id.toString(),
        name: selectedBusiness.name,
        category: selectedBusiness.category || "",
        description: selectedBusiness.description || ""
      };
      
      // Store in a format that settings page can understand
      const businessesData = getBusinessesData();
      const updatedBusinesses = businessesData ? [...businessesData] : [];
      
      // Check if business already exists in the list
      const existingIndex = updatedBusinesses.findIndex(b => b.id === businessData.id);
      if (existingIndex >= 0) {
        updatedBusinesses[existingIndex] = businessData;
      } else {
        updatedBusinesses.push(businessData);
      }
      
      setBusinessesData(updatedBusinesses);
      
      // Pass the business data to the parent component, if callback exists
      if (typeof onBusinessChange === 'function') {
        onBusinessChange(selectedBusiness);
      }
    }

    // Dispatch event after data is updated
    window.dispatchEvent(new Event(BUSINESS_UPDATED_EVENT));
    console.log("Selected business ID:", newValue);
  };

  // Helper functions to maintain compatibility with Settings page
  const getBusinessesData = () => {
    try {
      const data = localStorage.getItem("aalaiBusinesses");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting businesses data:", error);
      return [];
    }
  };

  const setBusinessesData = (data) => {
    try {
      localStorage.setItem("aalaiBusinesses", JSON.stringify(data));
    } catch (error) {
      console.error("Error setting businesses data:", error);
    }
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
          {value && businesses.find(b => b.business_id.toString() === value) && (
            <div className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              {businesses.find(b => b.business_id.toString() === value)?.name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {businesses.length > 0 ? (
          businesses.map((business) => (
            <SelectItem key={business.business_id} value={business.business_id.toString()}>
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