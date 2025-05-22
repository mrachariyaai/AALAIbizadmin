import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, Clock, ArrowLeft } from "lucide-react";
import { PageLayout } from "../common/PageLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ServiceConfigurationWizard() {
  const navigate = useNavigate();

  return (
    <PageLayout title="Add New Service">
      <div className="min-h-screen bg-gray-50">
        <div className="relative mx-auto">
          <Card>
            <CardHeader className="pb-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-center mb-4">
                    <Construction className="h-16 w-16 text-orange-500" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800">Service Configuration</CardTitle>
                  <CardDescription className="text-lg">This feature is currently under development</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/services')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Services</span>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}