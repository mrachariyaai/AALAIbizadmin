
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import {
  Users,
  LayoutDashboard,
  Database,
  Settings,
  LogIn,
  Monitor,
  User,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building
} from "lucide-react";
import { signOut } from "@aws-amplify/auth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [ user, setUser ] = useState({name:'user', role:'role'});

  const navigate = useNavigate();
  const userString = localStorage.getItem("aalaiUser");
  const handleLogout = async () => {
    await signOut()
    navigate("/login");
  };
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={cn(
      "flex flex-col border-r bg-white fixed h-full transition-all",
      collapsed ? "w-[80px]" : "w-[250px]",
      className
    )}>
      <div className={cn(
        "flex items-center h-16 px-4 border-b",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <Logo className="h-8" />}
        {collapsed && <div className="flex justify-center w-full">
          <span className="font-bold text-xl text-primary">A</span>
        </div>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <NavItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" collapsed={collapsed} />
          <NavItem to="/stakeholders" icon={<Users className="h-4 w-4" />} label="Stakeholders" collapsed={collapsed} />
          <NavItem to="/employees" icon={<User className="h-4 w-4" />} label="Employees" collapsed={collapsed} />
          <NavItem to="/services" icon={<Database className="h-4 w-4" />} label="Services" collapsed={collapsed} />
          <NavItem to="/clients" icon={<Building className="h-4 w-4" />} label="Clients" collapsed={collapsed} />
          <NavItem to="/monitoring" icon={<Monitor className="h-4 w-4" />} label="Monitoring" collapsed={collapsed} />
          <NavItem to="/roles" icon={<Shield className="h-4 w-4" />} label="Role Management" collapsed={collapsed} />
          <NavItem to="/payment-billing" icon={<CreditCard className="h-4 w-4" />} label="Payment & Billing" collapsed={collapsed} />
          <NavItem to="/audit-logs" icon={<FileText className="h-4 w-4" />} label="Audit Logs" collapsed={collapsed} />
          <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" collapsed={collapsed} />
        </nav>
      </div>
      
      <div className={cn(
        "border-t p-4",
        collapsed ? "text-center" : ""
      )}>
        <div className="flex items-center justify-between mb-2">
          {!collapsed && (
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size={collapsed ? "icon" : "sm"} 
            onClick={handleLogout}
            className={cn(collapsed && "mx-auto")}
          >
            <LogIn className="h-4 w-4 mr-1" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

function NavItem({ to, icon, label, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2"
        )
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
