
import { PageLayout } from "@/components/common/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Monitoring() {
  return (
    <PageLayout title="Application Monitoring">
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Agent {i}</CardTitle>
                    <CardDescription>Item Locator Agent</CardDescription>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Status</div>
                      <div className="font-medium">Running Normally</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current Tasks</div>
                      <div className="font-medium">2 active, 0 pending</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Response Time</div>
                      <div className="font-medium">125ms (avg)</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Last Error</div>
                      <div className="font-medium">None</div>
                    </div>
                    <div className="pt-2 flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">View Logs</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Item Locator</CardTitle>
                    <CardDescription>Core Service</CardDescription>
                  </div>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Database Connection</div>
                    <div className="font-medium">Connected</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Response Time</div>
                    <div className="font-medium">98ms (avg)</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Related Agents</div>
                    <div className="font-medium">3 (all operational)</div>
                  </div>
                  <div className="pt-2 flex space-x-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Test Connection</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Easy Checkout</CardTitle>
                    <CardDescription>Core Service</CardDescription>
                  </div>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Database Connection</div>
                    <div className="font-medium">Connected</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Response Time</div>
                    <div className="font-medium">112ms (avg)</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Related Agents</div>
                    <div className="font-medium">2 (all operational)</div>
                  </div>
                  <div className="pt-2 flex space-x-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Test Connection</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Review system logs and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="bg-muted p-3 border-b">
                  <div className="flex justify-between">
                    <div className="font-mono text-xs">
                      [2025-05-14 08:12:45] INFO: System startup complete
                    </div>
                    <Badge variant="outline">INFO</Badge>
                  </div>
                </div>
                <div className="bg-white p-3 border-b">
                  <div className="flex justify-between">
                    <div className="font-mono text-xs">
                      [2025-05-14 08:15:32] INFO: Database connection established
                    </div>
                    <Badge variant="outline">INFO</Badge>
                  </div>
                </div>
                <div className="bg-muted p-3 border-b">
                  <div className="flex justify-between">
                    <div className="font-mono text-xs">
                      [2025-05-14 08:15:45] INFO: Agent services started
                    </div>
                    <Badge variant="outline">INFO</Badge>
                  </div>
                </div>
                <div className="bg-white p-3 border-b">
                  <div className="flex justify-between">
                    <div className="font-mono text-xs">
                      [2025-05-14 09:23:12] WARN: Memory usage over 70%
                    </div>
                    <Badge className="bg-yellow-500">WARN</Badge>
                  </div>
                </div>
                <div className="bg-muted p-3 border-b">
                  <div className="flex justify-between">
                    <div className="font-mono text-xs">
                      [2025-05-14 09:25:18] INFO: Memory optimization complete
                    </div>
                    <Badge variant="outline">INFO</Badge>
                  </div>
                </div>
                <div className="bg-white p-3">
                  <div className="flex justify-between">
                    <div className="font-mono text-xs">
                      [2025-05-14 10:01:45] INFO: User admin@aalai.com logged in
                    </div>
                    <Badge variant="outline">INFO</Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline">Load More Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
