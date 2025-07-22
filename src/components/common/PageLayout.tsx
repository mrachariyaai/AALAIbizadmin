import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BusinessSwitcher } from "@/components/common/BusinessSwitcher";
import { AddBusinessDialog } from "@/components/business/AddBusinessDialog";
import { createBusiness } from "@/api/business";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PageLayoutProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  title?: string;
}

export function PageLayout({ children, requiresAuth = true, title }: PageLayoutProps) {
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query mutation for creating business
  const createBusinessMutation = useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      // Invalidate and refetch businesses
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setIsAddBusinessOpen(false);
    },
    onError: (error) => {
      console.error("Error adding business:", error);
    }
  });

  // Function to handle business submission/addition
  const handleBusinessAdded = (newBusiness: {
    operation: string;
    business_name: string;
    domain_name: string;
    domain_id: string;
    address: string;
    email: string;
    phone: string;
  }) => {
    createBusinessMutation.mutate(newBusiness);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[250px] min-h-screen bg-aalai-background overflow-y-auto">
        {title && (
          <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BusinessSwitcher />
              {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
            </div>
            <button
              onClick={() => setIsAddBusinessOpen(true)}
              className="bg-primary text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
              disabled={createBusinessMutation.isPending}
            >
              <span className="text-lg">+</span> 
              {createBusinessMutation.isPending ? 'Adding...' : 'Add Business'}
              {createBusinessMutation.isPending && (
                <span className="loader"></span>
              )}
            </button>
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