import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, AlertCircle, ShoppingCart, MapPin, Briefcase, Package, Users, Heart, Info, MessageSquare, Video, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL_Retail, getSelectedBusinessData, getBaseUrlByCategory } from "@/config";
import { BUSINESS_UPDATED_EVENT } from "@/components/common/BusinessSwitcher";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Add interfaces for service definitions
export interface ServiceDefinition {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>; // Properly type the Lucide icon component
  category: string;
  features: string[];
  requiredTables: string[];
  optionalTables: string[];
  fields: Record<string, string[]>;
  isResourceService?: boolean;
}

export interface ServiceDefinitions {
  [key: string]: ServiceDefinition;
}

// Export serviceDefinitions
export const serviceDefinitions: ServiceDefinitions = {
  item_locator: {
    title: "Item Locator",
    description: "Smart inventory location tracking system for retail environments",
    icon: MapPin,
    category: "Core Service",
    features: ["Real-time inventory tracking", "Location mapping", "Smart search algorithms"],
    requiredTables: ["products_table"],
    optionalTables: [],
    fields: {
      products_table: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"]
    }
  },
  easy_checkout: {
    title: "Easy Checkout",
    description: "Streamlined checkout process with cart management and billing",
    icon: ShoppingCart,
    category: "Core Service",
    features: ["Cart management", "Quick billing", "Discount calculations", "Payment processing"],
    requiredTables: ["products_table", "cart_items_table", "bills_table"],
    optionalTables: ["bill_items_table"],
    fields: {
      products_table: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"],
      cart_items_table: ["user_id", "product_id", "quantity"],
      bills_table: ["bill_number", "user_id", "total_price", "discounted_total", "bill_date"],
      bill_items_table: ["bill_number", "product_id", "quantity", "total_price", "discounted_price"]
    }
  },
  catalog: {
    title: "Catalog",
    description: "Comprehensive product catalog management system",
    icon: Package,
    category: "Core Service",
    features: ["Product management", "Category organization", "Inventory tracking", "Pricing management"],
    requiredTables: ["products_table"],
    optionalTables: ["cart_items_table", "bills_table", "bill_items_table"],
    fields: {
      products_table: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"],
      cart_items_table: ["user_id", "product_id", "quantity"],
      bills_table: ["bill_number", "user_id", "total_price", "discounted_total", "bill_date"],
      bill_items_table: ["bill_number", "product_id", "quantity", "total_price", "discounted_price"]
    }
  },
  recruitment: {
    title: "Recruitment",
    description: "Job posting and candidate management platform",
    icon: Briefcase,
    category: "Core Service",
    features: ["Job posting", "Candidate tracking", "Application management", "Interview scheduling"],
    requiredTables: ["jobs_table"],
    optionalTables: [],
    fields: {
      jobs_table: ["job_id", "job_title", "job_description"]
    }
  },
  queue_manager: {
    title: "Queue",
    description: "Efficient customer queue management system",
    icon: Users,
    category: "Core Service",
    features: ["Queue management", "Customer tracking", "Service scheduling", "Wait time estimation"],
    requiredTables: ["queue_table"],
    optionalTables: [],
    fields: {
      queue_table: ["queue_id", "customer_name", "service_type", "status", "wait_time", "priority"]
    }
  },
  donation: {
    title: "Donation",
    description: "Donation management and tracking system",
    icon: Heart,
    category: "Core Service",
    features: ["Donation tracking", "Donor management", "Campaign management", "Payment processing"],
    requiredTables: ["donations_table"],
    optionalTables: ["donors_table"],
    fields: {
      donations_table: ["donation_id", "donor_id", "amount", "date", "campaign_id", "status"],
      donors_table: ["donor_id", "name", "email", "phone", "address"]
    }
  },
  about_us: {
    title: "About Us",
    description: "Business information and profile management system",
    icon: Info,
    category: "Core Service",
    features: ["Business profile", "Team management", "Content management", "Contact information"],
    requiredTables: ["business_profile_table"],
    optionalTables: ["team_members_table"],
    fields: {
      business_profile_table: ["profile_id", "business_name", "description", "mission", "vision", "contact_info"],
      team_members_table: ["member_id", "name", "position", "bio", "image_path"]
    }
  },
  zensevagpt: {
    title: "Zensevagpt",
    description: "AI-powered assistant for business operations",
    icon: MessageSquare,
    category: "Core Service",
    features: ["AI chat", "Task automation", "Customer support", "Data analysis"],
    requiredTables: ["chat_history_table"],
    optionalTables: ["ai_config_table"],
    fields: {
      chat_history_table: ["chat_id", "user_id", "message", "timestamp", "response"],
      ai_config_table: ["config_id", "model_settings", "customization"]
    }
  },
  live_streaming: {
    title: "Live Streaming",
    description: "Content streaming and broadcasting platform",
    icon: Video,
    category: "Core Service",
    features: ["Live streaming", "Content management", "Viewer analytics", "Stream scheduling"],
    requiredTables: ["streams_table"],
    optionalTables: ["stream_analytics_table"],
    fields: {
      streams_table: ["stream_id", "title", "description", "scheduled_time", "status", "viewer_count"],
      stream_analytics_table: ["analytics_id", "stream_id", "viewer_metrics", "engagement_data"]
    }
  },
  adaptive_learning: {
    title: "Adaptive Learning",
    description: "A personalized education system that dynamically adjusts learning content and pace based on individual learner performance and progress analytics",
    icon: GraduationCap,
    category: "Core Service",
    features: ["Personalized learning paths", "Progress tracking", "Content adaptation", "Performance analytics"],
    requiredTables: ["courses_table", "learner_progress_table"],
    optionalTables: ["learning_materials_table"],
    fields: {
      courses_table: ["course_id", "title", "description", "difficulty_level", "prerequisites"],
      learner_progress_table: ["progress_id", "learner_id", "course_id", "completion_status", "performance_metrics"],
      learning_materials_table: ["material_id", "course_id", "content_type", "content_url", "difficulty_level"]
    }
  }
};

// Available services configuration per category
const availableServicesByCategory = {
  retail: [
    { name: "Item Locator", icon: MapPin, description: "Location tracking system" },
    { name: "Easy Checkout", icon: ShoppingCart, description: "Checkout management" },
    { name: "Catalog", icon: Package, description: "Product/service catalog" },
    { name: "Recruitment", icon: Briefcase, description: "Staff recruitment platform" },
    { name: "Queue", icon: Users, description: "Queue management system" },
    { name: "Donation", icon: Heart, description: "Donation management" },
    { name: "About Us", icon: Info, description: "Business information" },
    { name: "Zensevagpt", icon: MessageSquare, description: "AI assistant" },
    { name: "Live Streaming", icon: Video, description: "Content streaming" },
    { name: "Adaptive Learning", icon: GraduationCap, description: "Learning platform" }
  ],
  healthcare: [
    { name: "Item Locator", icon: MapPin, description: "Location tracking system" },
    { name: "Easy Checkout", icon: ShoppingCart, description: "Checkout management" },
    { name: "Catalog", icon: Package, description: "Product/service catalog" },
    { name: "Recruitment", icon: Briefcase, description: "Staff recruitment platform" },
    { name: "Queue", icon: Users, description: "Queue management system" },
    { name: "Donation", icon: Heart, description: "Donation management" },
    { name: "About Us", icon: Info, description: "Business information" },
    { name: "Zensevagpt", icon: MessageSquare, description: "AI assistant" },
    { name: "Live Streaming", icon: Video, description: "Content streaming" },
    { name: "Adaptive Learning", icon: GraduationCap, description: "Learning platform" }
  ],
  education: [
    { name: "Item Locator", icon: MapPin, description: "Location tracking system" },
    { name: "Easy Checkout", icon: ShoppingCart, description: "Checkout management" },
    { name: "Catalog", icon: Package, description: "Product/service catalog" },
    { name: "Recruitment", icon: Briefcase, description: "Staff recruitment platform" },
    { name: "Queue", icon: Users, description: "Queue management system" },
    { name: "Donation", icon: Heart, description: "Donation management" },
    { name: "About Us", icon: Info, description: "Business information" },
    { name: "Zensevagpt", icon: MessageSquare, description: "AI assistant" },
    { name: "Live Streaming", icon: Video, description: "Content streaming" },
    { name: "Adaptive Learning", icon: GraduationCap, description: "Learning platform" }
  ],
  default: [
    { name: "Item Locator", icon: MapPin, description: "Location tracking system" },
    { name: "Easy Checkout", icon: ShoppingCart, description: "Checkout management" },
    { name: "Catalog", icon: Package, description: "Product/service catalog" },
    { name: "Recruitment", icon: Briefcase, description: "Staff recruitment platform" },
    { name: "Queue", icon: Users, description: "Queue management system" },
    { name: "Donation", icon: Heart, description: "Donation management" },
    { name: "About Us", icon: Info, description: "Business information" },
    { name: "Zensevagpt", icon: MessageSquare, description: "AI assistant" },
    { name: "Live Streaming", icon: Video, description: "Content streaming" },
    { name: "Adaptive Learning", icon: GraduationCap, description: "Learning platform" }
  ]
};

// Storage keys for localStorage
const STORAGE_KEYS = {
  SELECTED_SERVICES: 'selectedServicesByCategory',
  BUSINESS_CATEGORY: 'businessCategory'
};

// Add Service Dialog Component
interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddServices: (selectedServices: string[]) => void;
  currentCategory: string;
  selectedServices: string[];
}

function AddServiceDialog({ open, onOpenChange, onAddServices, currentCategory, selectedServices }: AddServiceDialogProps) {
  const [tempSelectedServices, setTempSelectedServices] = useState<string[]>([]);

  // Get available services for current category
  const availableServices = availableServicesByCategory[currentCategory] || availableServicesByCategory.default;

  // Initialize temp selection when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelectedServices([...selectedServices]);
    }
  }, [open, selectedServices]);

  const handleServiceToggle = (serviceName: string) => {
    setTempSelectedServices(prev => 
      prev.includes(serviceName)
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleSubmit = () => {
    onAddServices(tempSelectedServices);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelectedServices([...selectedServices]); // Reset to original state
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Services - {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}</DialogTitle>
          <DialogDescription>
            Select the services you want to add to your {currentCategory} business.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
          {availableServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={`service-${index}`}
                  checked={tempSelectedServices.includes(service.name)}
                  onCheckedChange={() => handleServiceToggle(service.name)}
                />
                <div className="flex items-start space-x-2 flex-1">
                  <IconComponent className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <Label
                      htmlFor={`service-${index}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {service.name}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update Services ({tempSelectedServices.length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServicesTable() {
  const [config, setConfig] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(getSelectedBusinessData());
  const [selectedServicesByCategory, setSelectedServicesByCategory] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  // Get current business category
  const getCurrentCategory = () => {
    return selectedBusiness?.category?.toLowerCase() || 'default';
  };

  // Load persisted data from localStorage
  const loadPersistedData = () => {
    try {
      const savedServices = localStorage.getItem(STORAGE_KEYS.SELECTED_SERVICES);
      if (savedServices) {
        setSelectedServicesByCategory(JSON.parse(savedServices));
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  };

  // Save data to localStorage
  const saveToLocalStorage = (services: Record<string, string[]>) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_SERVICES, JSON.stringify(services));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Get selected services for current category
  const getSelectedServicesForCurrentCategory = () => {
    const currentCategory = getCurrentCategory();
    return selectedServicesByCategory[currentCategory] || [];
  };

  // Get available services for current category that are also selected
  const getAvailableSelectedServices = () => {
    const currentCategory = getCurrentCategory();
    const availableServices = availableServicesByCategory[currentCategory] || availableServicesByCategory.default;
    const selectedServices = getSelectedServicesForCurrentCategory();
    
    return availableServices.filter(service => 
      selectedServices.includes(service.name)
    );
  };

  useEffect(() => {
    loadConfig();
    loadPersistedData();
  }, []);

  useEffect(() => {
    const loadBusinessData = () => {
      const businessData = getSelectedBusinessData();
      setSelectedBusiness(businessData);
    };

    // Load initial data
    loadBusinessData();

    // Listen for business changes
    window.addEventListener(BUSINESS_UPDATED_EVENT, loadBusinessData);

    return () => {
      window.removeEventListener(BUSINESS_UPDATED_EVENT, loadBusinessData);
    };
  }, []);

  // Notification system
  const showNotification = (title, description, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Load config from API
  const loadConfig = async () => {
    try {
      const response = await fetch(`${BASE_URL_Retail}/get_config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      showNotification("Error", "Failed to load configuration: " + error.message, "error");
    } 
  };

  // Get service status
  const getServiceStatus = (serviceKey) => {
    const service = config[serviceKey];
    if (!service) return 'inactive';
    
    if (serviceDefinitions[serviceKey]?.isResourceService) {
      return service.DIRS ? 'active' : 'error';
    }
    
    if (!service.DB_CONNECTION) return 'error';
    if (!service.TABLE_MAPPING) return 'pending';
    
    const definition = serviceDefinitions[serviceKey];
    if (definition) {
      const hasRequiredTables = definition.requiredTables.every(
        table => service.TABLE_MAPPING[table]
      );
      return hasRequiredTables ? 'active' : 'pending';
    }
    
    return 'active';
  };

  
  // Filter services based on selected services for current category and search term
  const filteredServices = Object.keys(serviceDefinitions).filter(serviceKey => {
    const service = serviceDefinitions[serviceKey];
    const selectedServices = getSelectedServicesForCurrentCategory();
    
    // Check if this service is selected for the current category
    const isSelected = selectedServices.some(
      selectedService => selectedService.toLowerCase() === service.title.toLowerCase()
    );
    
    if (!isSelected) return false;

    return service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           service.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Add handler for adding/updating services
  const handleAddServices = (selectedServices: string[]) => {
    const currentCategory = getCurrentCategory();
    const updatedServices = {
      ...selectedServicesByCategory,
      [currentCategory]: selectedServices
    };
    
    setSelectedServicesByCategory(updatedServices);
    saveToLocalStorage(updatedServices);
    
    showNotification(
      "Success", 
      `Services updated for ${currentCategory} category (${selectedServices.length} services selected)`, 
      "success"
    );
  };

  const currentCategory = getCurrentCategory();
  const currentSelectedServices = getSelectedServicesForCurrentCategory();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header with category info */}
          {/* <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Services for {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Business
            </h1>
            <p className="text-gray-600 mt-2">
              {currentSelectedServices.length} services selected for this category
            </p>
          </div> */}

          {/* Search Bar and Add Service Button */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddServiceDialogOpen(true)}>
              Manage Services ({currentSelectedServices.length})
            </Button>
          </div>

          {/* No services message */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentSelectedServices.length === 0 ? 'No services selected' : 'No services match your search'}
              </h3>
              <p className="text-gray-600 mb-4">
                {currentSelectedServices.length === 0 
                  ? `Add services for your ${currentCategory} business to get started.`
                  : 'Try adjusting your search term to find the services you\'re looking for.'
                }
              </p>
              {currentSelectedServices.length === 0 && (
                <Button onClick={() => setIsAddServiceDialogOpen(true)}>
                  Add Your First Service
                </Button>
              )}
            </div>
          )}

          {/* Services Grid */}
          {filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(serviceKey => {
                const service = serviceDefinitions[serviceKey];
                const status = getServiceStatus(serviceKey);
                const isConfigured = Object.prototype.hasOwnProperty.call(config, serviceKey);
                const IconComponent = service.icon;

                return (
                  <Card key={serviceKey} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{service.title}</CardTitle>
                            <CardDescription className="text-xs">{service.category}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {status === 'active' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                          {status === 'pending' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={isConfigured ? "outline" : "default"}
                            onClick={() => {
                              if (serviceKey === 'item_locator') {
                                navigate('/services/itemLocator');
                              }  
                              else if (serviceKey === 'easy_checkout') {
                                navigate('/services/easyCheckout');
                              }
                              else if (serviceKey === 'catalog') {
                                navigate('/services/catalog');
                              }
                              else if (serviceKey === 'recruitment') {
                                navigate('/services/recruitment');
                              }
                              else if (serviceKey === 'queue_manager') {
                                navigate('/services/queue');
                              }
                              else if (serviceKey === 'adaptive_learning') {
                                navigate('/services/ClassTable');
                              }
                              else {
                                navigate('/services/configure', { state: { serviceKey } });
                              }
                            }}
                            className="flex-1"
                          >
                            {isConfigured ? 'Update Service' : '+ Add Service'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={isAddServiceDialogOpen}
        onOpenChange={setIsAddServiceDialogOpen}
        onAddServices={handleAddServices}
        currentCategory={currentCategory}
        selectedServices={currentSelectedServices}
      />

      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center p-4 rounded-md shadow-md max-w-sm ${
              notification.type === 'success' ? 'bg-green-100 border border-green-300' :
              notification.type === 'error' ? 'bg-red-100 border border-red-300' :
              'bg-blue-100 border border-blue-300'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-600 mr-2" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />}
            <div>
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-xs text-gray-600">{notification.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}