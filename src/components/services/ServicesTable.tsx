import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Edit, 
  Settings, 
  Trash2, 
  Plus, 
  Search,
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart,
  MapPin,
  Briefcase,
  BarChart3,
  Users,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL_Retail } from "@/config";

// Sample configuration data
const initialConfig = {
  // "item_locator": {
  //   "DB_CONNECTION": "shop_products.db",
  //   "TABLE_MAPPING": {
  //     "products_table": {
  //       "name": "products",
  //       "fields": {
  //         "item_id": "item_id",
  //         "item_name": "item_name",
  //         "categories": "categories",
  //         "description": "description",
  //         "price": "price",
  //         "quantity": "quantity",
  //         "image_path": "image_path",
  //         "location": "location"
  //       }
  //     }
  //   }
  // },
  // "easy_checkout": {
  //   "DB_CONNECTION": "fashion_shop.db",
  //   "TABLE_MAPPING": {
  //     "products_table": {
  //       "name": "products",
  //       "fields": {
  //         "item_id": "item_id",
  //         "item_name": "item_name",
  //         "categories": "categories",
  //         "description": "description",
  //         "price": "price",
  //         "quantity": "quantity",
  //         "image_path": "image_path",
  //         "location": "location"
  //       }
  //     },
  //     "cart_items_table": {
  //       "name": "cart_items",
  //       "fields": {
  //         "user_id": "user_id",
  //         "product_id": "product_id",
  //         "quantity": "quantity"
  //       }
  //     },
  //     "bills_table": {
  //       "name": "bills",
  //       "fields": {
  //         "bill_number": "bill_number",
  //         "user_id": "user_id",
  //         "total_price": "total_price",
  //         "discounted_total": "discounted_total",
  //         "bill_date": "bill_date"
  //       }
  //     }
  //   }
  // },
  // "resources": {
  //   "DIRS": {
  //     "product": "product_images",
  //     "offer": "offer_banners"
  //   },
  //   "UPLOADS_DIR": "uploads",
  //   "OFFER_IMAGE_DIR": "offer_banners",
  //   "SHOP_LOGO_PATH": "shop_logos/shop_logo.png"
  // }
};

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
  // catalog: {
  //   title: "Catelogue",
  //   description: "Comprehensive product catalog management system",
  //   icon: Package,
  //   category: "Core Service",
  //   features: ["Product management", "Category organization", "Inventory tracking", "Pricing management"],
  //   requiredTables: ["products_table"],
  //   optionalTables: ["cart_items_table", "bills_table", "bill_items_table"],
  //   fields: {
  //     products_table: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"],
  //     cart_items_table: ["user_id", "product_id", "quantity"],
  //     bills_table: ["bill_number", "user_id", "total_price", "discounted_total", "bill_date"],
  //     bill_items_table: ["bill_number", "product_id", "quantity", "total_price", "discounted_price"]
  //   }
  // },
  // recruitment: {
  //   title: "Recruitment System",
  //   description: "Job posting and candidate management platform",
  //   icon: Briefcase,
  //   category: "Core Service",
  //   features: ["Job posting", "Candidate tracking", "Application management", "Interview scheduling"],
  //   requiredTables: ["jobs_table"],
  //   optionalTables: [],
  //   fields: {
  //     jobs_table: ["job_id", "job_title", "job_description"]
  //   }
  // },
  // user_service: {
  //   title: "User Management",
  //   description: "User authentication and profile management system",
  //   icon: Users,
  //   category: "Core Service",
  //   features: ["User authentication", "Profile management", "Access control", "Security management"],
  //   requiredTables: ["users_table"],
  //   optionalTables: [],
  //   fields: {
  //     users_table: ["user_id", "password", "name", "email", "gender"]
  //   }
  // },
  // resources: {
  //   title: "Resource Management",
  //   description: "File and asset management system",
  //   icon: Database,
  //   category: "Core Service",
  //   features: ["File storage", "Asset management", "Directory organization", "Media handling"],
  //   requiredTables: [],
  //   optionalTables: [],
  //   fields: {},
  //   isResourceService: true
  // }
};

export function ServicesTable() {
  const [config, setConfig] = useState(initialConfig);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load config when component mounts
  useEffect(() => {
    loadConfig();
  }, []); // Empty dependency array means this runs once on mount

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
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL_Retail}/get_config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        // showNotification("Success", "Configuration loaded successfully", "success");
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      showNotification("Error", "Failed to load configuration: " + error.message, "error");
    } finally {
      setLoading(false);
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

  // Filter services
  const filteredServices = Object.keys(serviceDefinitions).filter(serviceKey => {
    const service = serviceDefinitions[serviceKey];
    return service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           service.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Search Bar */}
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
          </div>

          {/* Services Grid */}
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
                            else {
                              navigate('/services/configure', { state: { serviceKey } });
                            }
                          }}
                          className="flex-1"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          {isConfigured ? 'Edit' : 'Add Service'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

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