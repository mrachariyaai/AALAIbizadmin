// components/RequireAuth.tsx
import { useAuth } from "@/contexts/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
