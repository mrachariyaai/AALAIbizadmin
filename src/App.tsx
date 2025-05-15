
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import NewService from "./pages/NewService";
import Roles from "./pages/Roles";
import NewRole from "./pages/NewRole";
import Stakeholders from "./pages/Stakeholders";
import Employees from "./pages/Employees";
import Monitoring from "./pages/Monitoring";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import PaymentAndBilling from "./pages/PaymentAndBilling";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/new" element={<NewService />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/roles/new" element={<NewRole />} />
          <Route path="/stakeholders" element={<Stakeholders />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/payment-billing" element={<PaymentAndBilling />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
