import { Route, Routes } from "react-router-dom"
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Services from "../pages/Services";
import NewService from "../pages/NewService";
import Roles from "../pages/Roles";
import NewRole from "../pages/NewRole";
import Stakeholders from "../pages/Stakeholders";
import Employees from "../pages/Employees";
import Monitoring from "../pages/Monitoring";
import AuditLogs from "../pages/AuditLogs";
import Settings from "../pages/Settings";
import PaymentAndBilling from "../pages/PaymentAndBilling";
import Clients from "../pages/Clients";
import ClientProfile from "../pages/ClientProfile";
import { ServiceConfigurationWizard } from "../components/services/ServiceConfigurationWizard";
import { FC } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import AlreadyAuthRedirect from "@/auth/AlreadyAuthRedirect";
import RequireAuth from "@/auth/RequireAuth";

const AuthRoutes = () => {
    return (
        <Routes>
            
        </Routes>
    );
}

const AppRoutes = () => {
    return (
        <Routes>
            
        </Routes>
    );  
}
export const Navigation:FC = () => {
    
  return (
    <Routes>
      {/* Unauthenticated routes */}
      <Route path="/" element={<AlreadyAuthRedirect><Index /></AlreadyAuthRedirect>} />
      <Route path="/login" element={<AlreadyAuthRedirect><Login /></AlreadyAuthRedirect>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/services" element={<RequireAuth><Services /></RequireAuth>} />
      <Route path="/services/new" element={<RequireAuth><NewService /></RequireAuth>} />
      <Route path="/services/configure" element={<RequireAuth><ServiceConfigurationWizard /></RequireAuth>} />
      <Route path="/roles" element={<RequireAuth><Roles /></RequireAuth>} />
      <Route path="/roles/new" element={<RequireAuth><NewRole /></RequireAuth>} />
      <Route path="/stakeholders" element={<RequireAuth><Stakeholders /></RequireAuth>} />
      <Route path="/employees" element={<RequireAuth><Employees /></RequireAuth>} />
      <Route path="/monitoring" element={<RequireAuth><Monitoring /></RequireAuth>} />
      <Route path="/audit-logs" element={<RequireAuth><AuditLogs /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/payment-billing" element={<RequireAuth><PaymentAndBilling /></RequireAuth>} />
      <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
      <Route path="/clients/:id" element={<RequireAuth><ClientProfile /></RequireAuth>} />
    </Routes>
  )
}