
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function ServiceConfigurationWizard() {
  const [step, setStep] = useState(1);
  const [connectionString, setConnectionString] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const { toast } = useToast();
  
  // Mock data for demo
  const tables = ["products", "users", "cart", "orders", "categories"];
  const columns = ["id", "name", "description", "price", "quantity", "category_id", "image_path", "location"];
  
  const testConnection = () => {
    if (!connectionString) {
      toast({
        title: "Error",
        description: "Please enter a connection string",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate API call
    toast({
      title: "Testing connection...",
      description: "Please wait while we test the connection",
    });
    
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Connection successful",
        description: "Database connection established successfully",
      });
    }, 1500);
  };
  
  const nextStep = () => {
    if (step === 1 && !isConnected) {
      toast({
        title: "Error",
        description: "Please test the connection first",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !selectedTable) {
      toast({
        title: "Error",
        description: "Please select at least one table",
        variant: "destructive",
      });
      return;
    }
    
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const saveConfiguration = () => {
    toast({
      title: "Configuration saved",
      description: "Your service configuration has been saved successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Configuration</CardTitle>
        <CardDescription>Configure your AALAI services by connecting to your database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className={`flex items-center ${step === 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${step === 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
              <span>Connection Setup</span>
            </div>
            <div className="h-0.5 w-10 bg-gray-200"></div>
            <div className={`flex items-center ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${step === 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
              <span>Field Mapping</span>
            </div>
            <div className="h-0.5 w-10 bg-gray-200"></div>
            <div className={`flex items-center ${step === 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${step === 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
              <span>Preview & Confirm</span>
            </div>
          </div>
        </div>
        
        {step === 1 && (
          <div>
            <Tabs defaultValue="item-locator">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="item-locator">Item Locator</TabsTrigger>
                <TabsTrigger value="easy-checkout">Easy Checkout</TabsTrigger>
              </TabsList>
              <TabsContent value="item-locator" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="connectionString">Connection String</Label>
                    <div className="flex space-x-2 mt-1.5">
                      <Input 
                        id="connectionString"
                        placeholder="Enter connection string..."
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                      />
                      <Button onClick={testConnection} variant="secondary">Test Connection</Button>
                    </div>
                  </div>
                  
                  <div className={!isConnected ? "opacity-50 pointer-events-none" : ""}>
                    <Label>Service Details</Label>
                    <div className="border rounded-md p-4 mt-1.5">
                      <details>
                        <summary className="font-medium cursor-pointer">Item Locator Configuration</summary>
                        <div className="pt-2 space-y-3">
                          <div>
                            <Label htmlFor="product-table">Select Product Table</Label>
                            <Select 
                              disabled={!isConnected}
                              onValueChange={setSelectedTable}
                              value={selectedTable}
                            >
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select a table" />
                              </SelectTrigger>
                              <SelectContent>
                                {tables.map((table) => (
                                  <SelectItem key={table} value={table}>{table}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Field Mapping</Label>
                            <div className="grid grid-cols-2 gap-3 mt-1.5">
                              <div>
                                <Label htmlFor="categories">Categories</Label>
                                <Select disabled={!isConnected || !selectedTable}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {columns.map((column) => (
                                      <SelectItem key={column} value={column}>{column}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="description">Description</Label>
                                <Select disabled={!isConnected || !selectedTable}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {columns.map((column) => (
                                      <SelectItem key={column} value={column}>{column}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="itemId">Item ID</Label>
                                <Select disabled={!isConnected || !selectedTable}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {columns.map((column) => (
                                      <SelectItem key={column} value={column}>{column}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="itemName">Item Name</Label>
                                <Select disabled={!isConnected || !selectedTable}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {columns.map((column) => (
                                      <SelectItem key={column} value={column}>{column}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="easy-checkout" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="connectionStringEC">Connection String</Label>
                    <div className="flex space-x-2 mt-1.5">
                      <Input 
                        id="connectionStringEC"
                        placeholder="Enter connection string..."
                      />
                      <Button variant="secondary">Test Connection</Button>
                    </div>
                  </div>
                  
                  <div className="opacity-50 pointer-events-none">
                    <Label>Service Details</Label>
                    <div className="border rounded-md p-4 mt-1.5">
                      <details>
                        <summary className="font-medium cursor-pointer">Easy Checkout Configuration</summary>
                        <div className="pt-2 space-y-3">
                          <p className="text-sm text-muted-foreground">Test the connection first to enable configuration options</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Field Mapping</h3>
            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">Item Locator</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Product Table</Label>
                  <p className="font-medium">{selectedTable}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Category Field</Label>
                  <p className="font-medium">category_id</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Item ID Field</Label>
                  <p className="font-medium">id</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Name Field</Label>
                  <p className="font-medium">name</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Price Field</Label>
                  <p className="font-medium">price</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Quantity Field</Label>
                  <p className="font-medium">quantity</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Preview & Confirm</h3>
            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">Configuration Summary</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Service</Label>
                  <p className="font-medium">Item Locator</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Database Connection</Label>
                  <p className="font-medium">✓ Connected</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Product Table</Label>
                  <p className="font-medium">{selectedTable}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Fields Mapped</Label>
                  <p className="font-medium">8</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium mb-2 text-yellow-800">Important Note</h4>
              <p className="text-sm text-yellow-700">
                Once confirmed, this service configuration will be active and your AI agents will begin using this data source.
                You can modify these settings later from the Services dashboard.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>Previous</Button>
          )}
          {step < 3 ? (
            <Button onClick={nextStep} className="ml-auto">Next</Button>
          ) : (
            <Button onClick={saveConfiguration} className="ml-auto">Save Configuration</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
