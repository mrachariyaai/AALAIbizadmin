import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listBusinesses } from '@/api/business';
import { useAuth } from './AuthProvider';

interface Business {
  business_id: string;
  business_name: string;
  logo?: string;
  industry?: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface BusinessContextType {
  businesses: Business[];
  selectedBusiness: Business | null;
  setSelectedBusiness: (business: Business | null) => void;
  refreshBusinesses: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  
  const { user, authLoading } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = React.useState<Business | null>(null);

  // Use React Query for business data
  const { 
    data: businesses = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['businesses'],
    queryFn: listBusinesses,
    enabled: !authLoading && !!user, // Only fetch if user is authenticated
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour (updated from cacheTime)
  });

  const refreshBusinesses = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <BusinessContext.Provider value={{
      businesses,
      selectedBusiness,
      setSelectedBusiness,
      refreshBusinesses,
      isLoading,
      error: error as Error | null
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

// Hook to get current selected business ID (useful for API calls)
export const useSelectedBusinessId = () => {
  const { selectedBusiness } = useBusinessContext();
  return selectedBusiness?.business_id || null;
};