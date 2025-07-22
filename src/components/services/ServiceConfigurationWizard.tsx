import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addService, listAllServices } from "@/api/business";
import { useSelectedBusinessId } from "@/contexts/BusinessContext";

export function ServiceConfigurationWizard() {
  const [step, setStep] = useState(1);
  const [connectionString, setConnectionString] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedService, setSelectedService] = useState<any|null>();
  const [services, setServices] = useState([]);
  const [serviceSteps, setServiceSteps] = useState([]);

  const businessId = useSelectedBusinessId();

  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch all services
    listAllServices()
      .then(data => {
        console.log("Fetched services: ", data);
        setServices(data);
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

  // Update service steps when a service is selected
  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s.service_id === selectedService.service_id);
      console.log("Selected service: ", service);
      if (service && service.configuration && service.configuration.steps) {
        setServiceSteps(service.configuration.steps);
      } else {
        setServiceSteps([]);
      }
    }
  }, [selectedService, services]);

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

  // Get step configuration for current step
  const getCurrentStepConfig = () => {
    if (step === 1) return null; // Step 1 is always service selection
    const stepIndex = step - 2; // Convert to 0-based index for service steps
    return stepIndex < serviceSteps.length ? serviceSteps[stepIndex] : null;
  };

  // Get step name for display
  const getStepName = (stepNumber) => {
    if (stepNumber === 1) return "Select Service";
    
    const stepIndex = stepNumber - 2;
    if (stepIndex < serviceSteps.length) {
      const stepConfig = serviceSteps[stepIndex];
      if (stepConfig.configure) return "Configure Service";
      if (stepConfig.field_mapping) return "Field Mapping";
      if (stepConfig.preview) return "Preview & Confirm";
    }
    return `Step ${stepNumber}`;
  };

  // Calculate total steps
  const getTotalSteps = () => {
    return 1 + serviceSteps.length; // 1 for service selection + configured steps
  };
  
  const nextStep = () => {
    const totalSteps = getTotalSteps();
    
    if (step === 1 && !selectedService) {
      toast({
        title: "Error",
        description: "Please select a service first",
        variant: "destructive",
      });
      return;
    }
    
    // Validate configure step
    const currentStepConfig = getCurrentStepConfig();
    if (currentStepConfig && currentStepConfig.configure && !isConnected) {
      toast({
        title: "Error",
        description: "Please test the connection first",
        variant: "destructive",
      });
      return;
    }
    
    // Validate field mapping step
    if (currentStepConfig && currentStepConfig.field_mapping && !selectedTable) {
      toast({
        title: "Error",
        description: "Please select at least one table",
        variant: "destructive",
      });
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const saveConfiguration = async () => {
    
    // Service configuration object
    const serviceConfig = {
      ...selectedService,
      operation: 'add'
    }
    
    // Call API to add service configuration
    const res = await addService(businessId, serviceConfig)
    console.log("Service added successfully: ", res);

    if (!res) {
      toast({
        title: "Error",
        description: "Failed to add service configuration",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Service Added",
      description: "Your service configuration has been saved successfully",
    });
  };

  const getSelectedServiceName = () => {
    const service = services.find(s => s.service_id === selectedService.service_id);
    return service ? service.service_name : "Service";
  };

  const renderServiceConfiguration = () => {
    const service = services.find(s => s.service_id === selectedService.service_id);
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

  const renderFieldMapping = () => {
    return (
      <div>
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
    );
  };

  const renderPreview = () => {
    return (
      <div>
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
    );
  };

  const renderStepContent = () => {
    if (step === 1) {
      // Always show service selection for step 1
      return (
        <div>
          <h3 className="text-lg font-medium mb-4">Select a Service</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <div
                key={service.service_id}
                onClick={() => setSelectedService(service)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedService && selectedService.service_id === service.service_id
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
          {selectedService && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-800 mb-1">Selected Service</h4>
              <p className="text-sm text-blue-700">{getSelectedServiceName()}</p>
            </div>
          )}
        </div>
      );
    }

    // Render dynamic steps based on service configuration
    const currentStepConfig = getCurrentStepConfig();
    if (!currentStepConfig) {
      return <div>No configuration available for this step.</div>;
    }

    if (currentStepConfig.configure) {
      return (
        <div>
          <h3 className="text-lg font-medium mb-4">Configure {getSelectedServiceName()}</h3>
          {renderServiceConfiguration()}
        </div>
      );
    }

    if (currentStepConfig.field_mapping) {
      return (
        <div>
          <h3 className="text-lg font-medium mb-4">Field Mapping</h3>
          {renderFieldMapping()}
        </div>
      );
    }

    if (currentStepConfig.preview) {
      return (
        <div>
          <h3 className="text-lg font-medium mb-4">Preview & Confirm</h3>
          {renderPreview()}
        </div>
      );
    }

    return <div>Unknown step configuration.</div>;
  };

  const totalSteps = getTotalSteps();
  const isLastStep = step === totalSteps;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Configuration</CardTitle>
        <CardDescription>Configure your AALAI services by connecting to your database</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Dynamic Step Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
                      isActive ? 'bg-primary text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <span className="text-sm">{getStepName(stepNumber)}</span>
                  </div>
                  {index < totalSteps - 1 && (
                    <div className="h-0.5 w-8 bg-gray-200 ml-2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Dynamic Step Content */}
        {renderStepContent()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            Previous
          </Button>
          {!isLastStep ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={saveConfiguration}>Save and Add</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}