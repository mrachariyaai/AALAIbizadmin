
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";

const data = [
  { name: "Mon", services: 4, agents: 8 },
  { name: "Tue", services: 6, agents: 9 },
  { name: "Wed", services: 8, agents: 12 },
  { name: "Thu", services: 7, agents: 10 },
  { name: "Fri", services: 9, agents: 14 },
  { name: "Sat", services: 3, agents: 5 },
  { name: "Sun", services: 2, agents: 4 },
];

export function ActivityChart() {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Service and agent activity over the past week</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="services" fill="#1EAEDB" name="Active Services" radius={[4, 4, 0, 0]} />
              <Bar dataKey="agents" fill="#0FA0CE" name="Active Agents" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
