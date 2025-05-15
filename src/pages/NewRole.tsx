
import { PageLayout } from "@/components/common/PageLayout";
import { RolePermissionMatrix } from "@/components/roles/RolePermissionMatrix";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewRole() {
  return (
    <PageLayout title="Create New Role">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Role Details</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" placeholder="Enter role name" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe this role's purpose and responsibilities"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <RolePermissionMatrix />
      </div>
    </PageLayout>
  );
}
