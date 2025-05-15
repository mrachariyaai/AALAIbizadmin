
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: "John Doe",
    action: "Added a new service",
    serviceName: "Database Configuration",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Sarah Smith",
    action: "Updated stakeholder permissions",
    serviceName: "Role Management",
    time: "3 hours ago",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Created a new employee account",
    serviceName: "User Management",
    time: "5 hours ago",
  },
  {
    id: 4,
    user: "Emma Williams",
    action: "Generated monthly report",
    serviceName: "Reporting",
    time: "Yesterday",
  },
  {
    id: 5,
    user: "Robert Brown",
    action: "Modified workflow",
    serviceName: "Item Locator",
    time: "Yesterday",
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest activities across your business</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
              <Avatar>
                <div className="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center">
                  {activity.user.split(" ").map(name => name[0]).join("")}
                </div>
              </Avatar>
              <div>
                <div className="font-medium">{activity.user}</div>
                <div className="text-sm text-muted-foreground">
                  {activity.action} - {activity.serviceName}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
