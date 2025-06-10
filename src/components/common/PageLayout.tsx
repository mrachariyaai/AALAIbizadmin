import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BusinessSwitcher, BUSINESS_UPDATED_EVENT } from "@/components/common/BusinessSwitcher";
import { AddBusinessDialog } from "@/components/business/AddBusinessDialog";

interface PageLayoutProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  title?: string;
}

export function PageLayout({ children, requiresAuth = true, title }: PageLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getUserData();
    //setIsAuthenticated(!!user);
    setIsAuthenticated(true); // For testing purposes, assume user is authenticated
  }, []);

  // Function to handle business submission/addition
  const handleBusinessAdded = (newBusiness: {
    id: string;
    name: string;
    industry: string;
    address: string;
    email: string;
    phone: string;
  }) => {
    // Close the dialog
    setIsAddBusinessOpen(false);
    
    // Get existing businesses
    const savedBusinesses = localStorage.getItem("aalaiBusinesses");
    let businesses = [];
    
    try {
      businesses = savedBusinesses ? JSON.parse(savedBusinesses) : [];
      // Ensure we have an array
      if (!Array.isArray(businesses)) businesses = [];
    } catch (error) {
      console.error("Error parsing businesses from localStorage", error);
      businesses = [];
    }
    
    // Add the new business
    businesses.push(newBusiness);
    
    // Save back to localStorage
    localStorage.setItem("aalaiBusinesses", JSON.stringify(businesses));
    
    // Set as selected business
    localStorage.setItem("aalaiSelectedBusiness", newBusiness.id);
    
    // Dispatch custom event to notify BusinessSwitcher to update
    window.dispatchEvent(new Event(BUSINESS_UPDATED_EVENT));
  };
  
  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if authentication is required but user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[250px] min-h-screen bg-aalai-background overflow-y-auto">
        {title && (
          <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              {isAuthenticated && <BusinessSwitcher />}
              {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
            </div>
            {isAuthenticated && (
              <button 
                onClick={() => setIsAddBusinessOpen(true)} 
                className="bg-primary text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
              >
                <span className="text-lg">+</span> Add Business
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </main>
      
      <AddBusinessDialog
        open={isAddBusinessOpen}
        onOpenChange={setIsAddBusinessOpen}
        onSubmit={handleBusinessAdded}
      />
    </div>
  );
}
