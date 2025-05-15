
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface PageLayoutProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  title?: string;
}

export function PageLayout({ children, requiresAuth = true, title }: PageLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("aalaiUser");
    setIsAuthenticated(!!user);
  }, []);
  
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
          <div className="bg-white p-4 border-b shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
