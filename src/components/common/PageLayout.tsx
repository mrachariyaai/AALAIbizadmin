import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BusinessSwitcher, BUSINESS_UPDATED_EVENT } from "@/components/common/BusinessSwitcher";
import { AddBusinessDialog } from "@/components/business/AddBusinessDialog";
import { getUserData, getBusinessesData, setBusinessesData } from "@/config";

interface PageLayoutProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  title?: string;
}

interface BusinessData {
  id: string;
  name: string;
  category: string;
  description: string;
}

export function PageLayout({ children, requiresAuth = true, title }: PageLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const user = getUserData();
    //setIsAuthenticated(!!user);
    setIsAuthenticated(true); // For testing purposes, assume user is authenticated
  }, []);

  useEffect(() => {
    const loadBusinessData = () => {
      const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
      const businesses = getBusinessesData();
      // ... loads business data ...
    };

    // Load initial data
    loadBusinessData();

    // Listen for business changes
    window.addEventListener(BUSINESS_UPDATED_EVENT, loadBusinessData);

    return () => {
      window.removeEventListener(BUSINESS_UPDATED_EVENT, loadBusinessData);
    };
  }, []);

  
  // Function to handle business submission/addition
  const handleBusinessAdded = (newBusiness: BusinessData) => {
    // Close the dialog
    setIsAddBusinessOpen(false);
    
    // Get existing businesses using the centralized function
    const businesses = getBusinessesData() || [];
    
    // Add the new business
    businesses.push(newBusiness);
    
    // Save back to localStorage using the centralized function
    setBusinessesData(businesses);
    
    // Set as selected business
    localStorage.setItem("aalaiSelectedBusiness", newBusiness.id);
    
    // Dispatch custom event to notify BusinessSwitcher to update
    console.log("Business created successfully, triggering BUSINESS_UPDATED_EVENT...");
    window.dispatchEvent(new Event(BUSINESS_UPDATED_EVENT));
    console.log("BUSINESS_UPDATED_EVENT dispatched.");
    
    // Refresh the current location
    navigate(location.pathname, { replace: true });
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
              {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <BusinessSwitcher />
                    {/* <button 
                      onClick={() => window.dispatchEvent(new Event(BUSINESS_UPDATED_EVENT))} 
                      className="text-gray-600 hover:text-gray-800"
                      title="Refresh"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button> */}
                  </div>
                )}
              {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
            </div>
            {isAuthenticated && (
              <button 
                onClick={() => {
                  setIsAddBusinessOpen(true);
                  // Refresh the BusinessSwitcher dropdown
                  window.dispatchEvent(new Event(BUSINESS_UPDATED_EVENT));
                }} 
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