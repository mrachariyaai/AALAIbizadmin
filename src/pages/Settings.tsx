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

interface Business {
  id: string;
  name: string;
  industry?: string;
  address?: string;
  email?: string;
  phone?: string;
}

const DEFAULT_BUSINESS_DATA = {
  name: "New Business",
  industry: "other",
  address: "",
  email: "",
  phone: ""
};

export default function Settings() {
  const [businessData, setBusinessData] = useState(DEFAULT_BUSINESS_DATA);

  useEffect(() => {
    const loadBusinessData = () => {
      const selectedBusinessId = localStorage.getItem("aalaiSelectedBusiness");
      const savedBusinesses = localStorage.getItem("aalaiBusinesses");
      
      if (!selectedBusinessId || !savedBusinesses) {
        setBusinessData(DEFAULT_BUSINESS_DATA);
        return;
      }

      try {
        const businesses = JSON.parse(savedBusinesses) as Business[];
        const currentBusiness = businesses.find((b) => b.id === selectedBusinessId);
        
        if (currentBusiness) {
          setBusinessData({
            name: currentBusiness.name || DEFAULT_BUSINESS_DATA.name,
            industry: currentBusiness.industry || DEFAULT_BUSINESS_DATA.industry,
            address: currentBusiness.address || DEFAULT_BUSINESS_DATA.address,
            email: currentBusiness.email || DEFAULT_BUSINESS_DATA.email,
            phone: currentBusiness.phone || DEFAULT_BUSINESS_DATA.phone
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
    const savedBusinesses = localStorage.getItem("aalaiBusinesses");
    
    if (!selectedBusinessId || !savedBusinesses) {
      console.error("No business selected or no businesses found");
      return;
    }

    try {
      const businesses = JSON.parse(savedBusinesses) as Business[];
      const updatedBusinesses = businesses.map((b) => {
        if (b.id === selectedBusinessId) {
          return {
            ...b,
            name: businessData.name || DEFAULT_BUSINESS_DATA.name,
            industry: businessData.industry || DEFAULT_BUSINESS_DATA.industry,
            address: businessData.address || DEFAULT_BUSINESS_DATA.address,
            email: businessData.email || DEFAULT_BUSINESS_DATA.email,
            phone: businessData.phone || DEFAULT_BUSINESS_DATA.phone
          };
        }
        return b;
      });
      
      localStorage.setItem("aalaiBusinesses", JSON.stringify(updatedBusinesses));
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
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={businessData.industry} 
                      onValueChange={(value) => setBusinessData(prev => ({ ...prev, industry: value || DEFAULT_BUSINESS_DATA.industry }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value || DEFAULT_BUSINESS_DATA.address }))}
                    placeholder="Enter business address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={businessData.email}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value || DEFAULT_BUSINESS_DATA.email }))}
                      placeholder="Enter business email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Business Phone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={businessData.phone}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value || DEFAULT_BUSINESS_DATA.phone }))}
                      placeholder="Enter business phone"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Configure timezone and locale preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="pst">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PST/PDT)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST/MDT)</SelectItem>
                        <SelectItem value="cst">Central Time (CST/CDT)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST/EDT)</SelectItem>
                        <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Save Changes</Button>
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
