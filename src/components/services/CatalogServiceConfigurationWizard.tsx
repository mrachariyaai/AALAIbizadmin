import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Edit3, ArrowLeft, Database as DatabaseIcon, ArrowRight, Check } from "lucide-react";
import { PageLayout } from "../common/PageLayout";
import { getBaseUrlByCategory, TestConnection_URL } from "@/config";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

interface TableMapping {
  name: string;
  fields: Record<string, string>;
}

interface CatalogConfig {
  DB_CONNECTION: string;
  TABLE_MAPPING: Record<string, TableMapping>;
}

interface Config {
  catalog?: CatalogConfig;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
}

function ConfigurationPreview({ config, onEdit }: { config: Config; onEdit: () => void }) {
  const navigate = useNavigate();
  
  if (!config.catalog) return null;

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Catalog Configuration</CardTitle>
            <CardDescription>Current configuration settings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/services')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Services</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Configuration</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <DatabaseIcon className="h-4 w-4" />
              Database Connection
            </h4>
            <p className="text-sm text-gray-600">
              {config.catalog.DB_CONNECTION.startsWith('local_file:') 
                ? 'Local Database File' 
                : config.catalog.DB_CONNECTION}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Table Mappings</h4>
            {Object.entries(config.catalog.TABLE_MAPPING).map(([tableKey, mapping]: [string, TableMapping]) => (
              <div key={tableKey} className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium mb-3 capitalize">
                  {tableKey.replace('_table', '')} Table: {mapping.name}
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(mapping.fields).map(([field, column]: [string, string]) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="text-sm font-medium min-w-[120px]">{field.replace('_', ' ')}:</span>
                      <span className="text-sm text-gray-600">{column}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CatalogServiceConfigurationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceName: "Catalog Service",
    enableImageOptimization: true,
    imageQuality: "high",
    enableAutoCategorization: true,
    enableSearch: true,
    enableFilters: true,
    maxItemsPerPage: "50",
    enablePagination: true,
    enableSorting: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Handle form submission
      console.log("Form submitted:", formData);
      navigate('/services');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/services');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm font-medium text-gray-700">Service Name</Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) => handleInputChange("serviceName", e.target.value)}
                className="border-2 border-gray-200 rounded-lg"
                placeholder="Enter service name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageQuality" className="text-sm font-medium text-gray-700">Image Quality</Label>
              <Select
                value={formData.imageQuality}
                onValueChange={(value) => handleInputChange("imageQuality", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select image quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxItemsPerPage" className="text-sm font-medium text-gray-700">Items Per Page</Label>
              <Select
                value={formData.maxItemsPerPage}
                onValueChange={(value) => handleInputChange("maxItemsPerPage", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="25">25 items</SelectItem>
                  <SelectItem value="50">50 items</SelectItem>
                  <SelectItem value="100">100 items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Image Optimization</Label>
                <p className="text-sm text-gray-500">Automatically optimize product images</p>
              </div>
              <Switch
                checked={formData.enableImageOptimization}
                onCheckedChange={(checked) => handleInputChange("enableImageOptimization", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Auto Categorization</Label>
                <p className="text-sm text-gray-500">Automatically categorize products</p>
              </div>
              <Switch
                checked={formData.enableAutoCategorization}
                onCheckedChange={(checked) => handleInputChange("enableAutoCategorization", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Search Functionality</Label>
                <p className="text-sm text-gray-500">Enable product search</p>
              </div>
              <Switch
                checked={formData.enableSearch}
                onCheckedChange={(checked) => handleInputChange("enableSearch", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Filtering</Label>
                <p className="text-sm text-gray-500">Enable product filtering</p>
              </div>
              <Switch
                checked={formData.enableFilters}
                onCheckedChange={(checked) => handleInputChange("enableFilters", checked)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Pagination</Label>
                <p className="text-sm text-gray-500">Enable paginated results</p>
              </div>
              <Switch
                checked={formData.enablePagination}
                onCheckedChange={(checked) => handleInputChange("enablePagination", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Sorting</Label>
                <p className="text-sm text-gray-500">Enable product sorting</p>
              </div>
              <Switch
                checked={formData.enableSorting}
                onCheckedChange={(checked) => handleInputChange("enableSorting", checked)}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Configuration Summary</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Service Name: {formData.serviceName}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Image Quality: {formData.imageQuality}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Items Per Page: {formData.maxItemsPerPage}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Image Optimization: {formData.enableImageOptimization ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Auto Categorization: {formData.enableAutoCategorization ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Search: {formData.enableSearch ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Filtering: {formData.enableFilters ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Pagination: {formData.enablePagination ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Sorting: {formData.enableSorting ? "Enabled" : "Disabled"}</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout title="Catalog Service Configuration">
      <div className="relative mx-auto">
        {!formData && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Catalog Service</CardTitle>
                  <CardDescription>
                    Configure your product catalog settings
                  </CardDescription>
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
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No Configuration Found</h3>
                  <p className="text-sm text-gray-500">
                    Configure your Catalog service to start managing products and inventory.
                  </p>
                </div>
                <Button 
                  onClick={() => setCurrentStep(1)}
                  className="bg-primary text-white"
                >
                  + Add Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {formData && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Catalog Configuration</CardTitle>
                  <CardDescription>Configure your Catalog service by connecting to your database</CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          step === currentStep
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : step < currentStep
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {step < currentStep ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span>{step}</span>
                        )}
                      </div>
                      {step < 3 && (
                        <div
                          className={`w-24 h-0.5 ${
                            step < currentStep ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  {renderStepContent()}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentStep === 1 ? "Back to Services" : "Previous Step"}
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    {currentStep === 3 ? "Complete Setup" : "Next Step"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
} 