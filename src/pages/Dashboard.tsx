
import { PageLayout } from "@/components/common/PageLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Database, Settings, User, Users, Monitor, FileText, Shield } from "lucide-react";

export default function Dashboard() {
  return (
    <PageLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Services"
          value="7"
          icon={<Database className="h-5 w-5 text-primary" />}
          trend={{ value: 16.7, positive: true }}
        />
        <StatCard 
          title="Connected Agents"
          value="12"
          icon={<Settings className="h-5 w-5 text-primary" />}
          trend={{ value: 8.2, positive: true }}
        />
        <StatCard 
          title="Stakeholders"
          value="5"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard 
          title="Employees"
          value="24"
          icon={<User className="h-5 w-5 text-primary" />}
          trend={{ value: 4.5, positive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <ActivityChart />
        <RecentActivity />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2 text-lg font-semibold mb-4">
            <Monitor className="h-5 w-5 text-primary" />
            <h3>Service Health</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Database Connections</span>
              <span className="font-medium text-green-500">Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">API Endpoints</span>
              <span className="font-medium text-green-500">Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Agent Response Time</span>
              <span className="font-medium text-green-500">Normal</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2 text-lg font-semibold mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3>Recent Audit Logs</h3>
          </div>
          <div className="space-y-3">
            <div className="border-b pb-2">
              <p className="text-sm">Service configuration changed</p>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm">New employee added</p>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </div>
            <div>
              <p className="text-sm">Role permissions updated</p>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2 text-lg font-semibold mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3>Security Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Security Scan</span>
              <span className="font-medium">Today</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Issues Found</span>
              <span className="font-medium">None</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Security Status</span>
              <span className="font-medium text-green-500">Protected</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
