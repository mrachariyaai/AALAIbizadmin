// components/AlreadyAuthRedirect.tsx
import { useAuth } from "@/auth/AuthProvider";
import { Navigate } from "react-router-dom";

const AlreadyAuthRedirect = ({ children }: { children: JSX.Element }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div>Loading...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AlreadyAuthRedirect;
