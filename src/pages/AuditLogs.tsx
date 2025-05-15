
import { PageLayout } from "@/components/common/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const logs = [
  {
    id: 1,
    user: "Admin User",
    action: "Service Configuration",
    details: "Updated Item Locator database configuration",
    timestamp: "2025-05-14 10:45:12",
    severity: "normal"
  },
  {
    id: 2,
    user: "John Smith",
    action: "User Management",
    details: "Added new employee: Diana Miller",
    timestamp: "2025-05-13 16:22:05",
    severity: "normal"
  },
  {
    id: 3,
    user: "System",
    action: "Security Alert",
    details: "Failed login attempt for user: unknown@example.com",
    timestamp: "2025-05-13 14:17:34",
    severity: "high"
  },
  {
    id: 4,
    user: "Emily Johnson",
    action: "Role Management",
    details: "Updated permissions for role: Analyst",
    timestamp: "2025-05-12 11:30:19",
    severity: "normal"
  },
  {
    id: 5,
    user: "Admin User",
    action: "Service Management",
    details: "Added new service: Customer Analytics",
    timestamp: "2025-05-12 09:15:47",
    severity: "normal"
  },
  {
    id: 6,
    user: "System",
    action: "Database Warning",
    details: "High database load detected on Easy Checkout service",
    timestamp: "2025-05-11 22:45:12",
    severity: "medium"
  },
  {
    id: 7,
    user: "Robert Davis",
    action: "Settings Change",
    details: "Updated system notification settings",
    timestamp: "2025-05-11 14:12:33",
    severity: "low"
  }
];

export default function AuditLogs() {
  return (
    <PageLayout title="Audit Logs">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>View and filter system audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Search logs..." />
            </div>
            <div className="w-full md:w-[180px]">
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="service">Service Config</SelectItem>
                  <SelectItem value="user">User Management</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="role">Role Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button>Filter</Button>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{log.timestamp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <div className="bg-primary/10 text-primary rounded-full w-full h-full flex items-center justify-center text-xs">
                              {log.user === "System" ? "S" : log.user.charAt(0)}
                            </div>
                          </Avatar>
                          <span className="text-sm">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{log.action}</td>
                      <td className="px-4 py-3 text-sm">{log.details}</td>
                      <td className="px-4 py-3">
                        {log.severity === "high" && <Badge className="bg-red-500">High</Badge>}
                        {log.severity === "medium" && <Badge className="bg-yellow-500">Medium</Badge>}
                        {log.severity === "low" && <Badge className="bg-blue-500">Low</Badge>}
                        {log.severity === "normal" && <Badge variant="outline">Normal</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between px-4 py-4 bg-white border-t">
              <div className="text-sm text-muted-foreground">
                Showing <strong>7</strong> of <strong>124</strong> logs
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
