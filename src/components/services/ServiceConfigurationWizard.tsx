import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listAllServices } from "@/api/business";

export function ServiceConfigurationWizard() {
  const [step, setStep] = useState(1);
  const [connectionString, setConnectionString] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [services, setServices] = useState([]);

  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch all services
    listAllServices()
      .then(data => {
        console.log("Fetched services: ", data);
        setServices(data);
        // Auto-select first service if available
        if (data.length > 0) {
          setSelectedService(data[0].service_id);
        }
      })
      .catch(error => {
        console.error("Error fetching services: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch services. Please try again later.",
          variant: "destructive",
        });
      }); 
  }, []);

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

  const getSelectedServiceName = () => {
    const service = services.find(s => s.service_id === selectedService);
    return service ? service.service_name : "Service";
  };

  const renderServiceConfiguration = () => {
    const service = services.find(s => s.service_id === selectedService);
    if (!service) return null;

    return (
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
              <summary className="font-medium cursor-pointer">{service.service_name} Configuration</summary>
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
    );
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
            {/* Service Selection Grid */}
            <div className="mb-6">
              <Label className="text-base font-medium">Select a Service</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-3">
                {services.map((service) => (
                  <div
                    key={service.service_id}
                    onClick={() => setSelectedService(service.service_id)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedService === service.service_id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.service_name}
                          className="w-full h-full object-cover"                         
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center text-sm font-semibold text-gray-600 ${
                          service.image_url ? 'hidden' : 'flex'
                        }`}
                      >
                        {service.service_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-xs text-center font-medium leading-tight">
                      {service.service_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration Section */}
            {selectedService && (
              <div className="border-t pt-6">
                {renderServiceConfiguration()}
              </div>
            )}
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Field Mapping</h3>
            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">{getSelectedServiceName()}</h4>
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
                  <p className="font-medium">{getSelectedServiceName()}</p>
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