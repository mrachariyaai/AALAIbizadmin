import { PageLayout } from "@/components/common/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { BUSINESS_UPDATED_EVENT } from "@/components/common/BusinessSwitcher";
import { Pencil } from "lucide-react";
import { getUserData } from "@/config"; 

interface Business {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

const DEFAULT_BUSINESS_DATA = {
  name: "New Business",
  category: "Bank",
  description: ""
};

export default function Settings() {
  const [businessData, setBusinessData] = useState(DEFAULT_BUSINESS_DATA);

  const user = getUserData(); // Get user data

  // Helper functions to maintain compatibility with BusinessSwitcher
  const getBusinessesData = () => {
    try {
      const data = localStorage.getItem("aalaiBusinesses");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting businesses data:", error);
      return [];
    }
  };

  const setBusinessesData = (data) => {
    try {
      localStorage.setItem("aalaiBusinesses", JSON.stringify(data));
    } catch (error) {
      console.error("Error setting businesses data:", error);
    }
  };

  useEffect(() => {
    const loadBusinessData = () => {
      const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
      const businesses = getBusinessesData();
      
      if (!selectedBusinessId || !businesses || businesses.length === 0) {
        setBusinessData(DEFAULT_BUSINESS_DATA);
        return;
      }

      try {
        const currentBusiness = businesses.find((b) => b.id === selectedBusinessId);
        
        if (currentBusiness) {
          setBusinessData({
            name: currentBusiness.name || DEFAULT_BUSINESS_DATA.name,
            category: currentBusiness.category || DEFAULT_BUSINESS_DATA.category,
            description: currentBusiness.description || DEFAULT_BUSINESS_DATA.description
          });
        } else {
          setBusinessData(DEFAULT_BUSINESS_DATA);
        }
      } catch (error) {
        console.error("Error loading business data:", error);
        setBusinessData(DEFAULT_BUSINESS_DATA);
      }
    };

    // Load initial data
    loadBusinessData();

    // Listen for business changes
    window.addEventListener(BUSINESS_UPDATED_EVENT, loadBusinessData);

    return () => {
      window.removeEventListener(BUSINESS_UPDATED_EVENT, loadBusinessData);
    };
  }, []);

  const handleSaveChanges = () => {
    const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
    const businesses = getBusinessesData();
    
    if (!selectedBusinessId) {
      console.error("No business selected");
      return;
    }

    try {
      let updatedBusinesses = [...(businesses || [])];
      const existingIndex = updatedBusinesses.findIndex((b) => b.id === selectedBusinessId);
      
      if (existingIndex >= 0) {
        // Update existing business
        updatedBusinesses[existingIndex] = {
          ...updatedBusinesses[existingIndex],
          name: businessData.name || DEFAULT_BUSINESS_DATA.name,
          category: businessData.category || DEFAULT_BUSINESS_DATA.category,
          description: businessData.description || DEFAULT_BUSINESS_DATA.description
        };
      } else {
        // Add new business
        updatedBusinesses.push({
          id: selectedBusinessId,
          name: businessData.name || DEFAULT_BUSINESS_DATA.name,
          category: businessData.category || DEFAULT_BUSINESS_DATA.category,
          description: businessData.description || DEFAULT_BUSINESS_DATA.description
        });
      }
      
      setBusinessesData(updatedBusinesses);
      window.dispatchEvent(new Event(BUSINESS_UPDATED_EVENT));
    } catch (error) {
      console.error("Error saving business data:", error);
    }
  };

  return (
    <PageLayout title="Settings">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input 
                      id="businessName" 
                      value={businessData.name}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value || DEFAULT_BUSINESS_DATA.name }))}
                      placeholder={DEFAULT_BUSINESS_DATA.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={businessData.category} 
                      onValueChange={(value) => setBusinessData(prev => ({ ...prev, category: value || DEFAULT_BUSINESS_DATA.category }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank">Bank</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Salon">Salon</SelectItem>
                        <SelectItem value="Religious">Religious</SelectItem>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={businessData.description}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value || DEFAULT_BUSINESS_DATA.description }))}
                    placeholder="Enter business description"
                  />
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="text-sm">{user ? user.name : "-"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>User Name</Label>
                    <div className="text-sm">{user ? user.user_id : "-"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="text-sm">{user ? user.email : "-"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <div className="text-sm">{user ? user.gender : "-"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure authentication methods and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password Complexity</h4>
                    <p className="text-sm text-muted-foreground">
                      Require strong passwords (uppercase, lowercase, numbers, symbols)
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password Expiration</h4>
                    <p className="text-sm text-muted-foreground">
                      Force password reset every 90 days
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 mins</SelectItem>
                        <SelectItem value="30">30 mins</SelectItem>
                        <SelectItem value="60">60 mins</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="pt-2">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical system notifications and warnings
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">User Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        New user registrations and account changes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Service Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Changes to service configurations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Product updates and announcements
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="pt-6">
                  <h3 className="text-sm font-medium mb-4">Report Scheduling</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="report-frequency">Activity Report Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="report-email">Recipients</Label>
                      <Input id="report-email" placeholder="Enter email addresses" defaultValue="admin@aalai.com" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}