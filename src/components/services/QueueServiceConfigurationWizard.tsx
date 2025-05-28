import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle, Edit3, ArrowLeft, Database as DatabaseIcon, Check, ArrowRight } from "lucide-react";
import { PageLayout } from "../common/PageLayout";
import { getBaseUrlByCategory, TestConnection_URL } from "@/config";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QueueConfig {
  DB_CONNECTION: string;
}

interface Config {
  queue_manager?: QueueConfig;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
}

function ConfigurationPreview({ config, onEdit }: { config: Config; onEdit: () => void }) {
  const navigate = useNavigate();
  if (!config.queue_manager) return null;
  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Queue Configuration</CardTitle>
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
              {config.queue_manager.DB_CONNECTION.startsWith('local_file:') 
                ? 'Local Database File' 
                : config.queue_manager.DB_CONNECTION}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QueueServiceConfigurationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceName: "Queue Service",
    maxQueueSize: "100",
    processingInterval: "5",
    enablePriorityQueue: true,
    enableAutoScaling: true,
    enableNotifications: true,
    enableRetry: true,
    maxRetries: "3",
    retryDelay: "60",
  });
  const [connection, setConnection] = useState({
    string: "",
    isLocal: false,
    connected: false,
    loading: false,
    editing: true,
    file: null,
    saving: false
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<Config>();
  const [loading, setLoading] = useState(false);
  const [showConfigUI, setShowConfigUI] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [BaseURL, setBaseURL] = useState(getBaseUrlByCategory())

  useEffect(() => {
    loadConfig();
  }, []);

  const showNotification = (title: string, description: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BaseURL}/get_config`);
      if (response.ok) {
        const data = await response.json();
        if (data?.queue_manager) {
          setConfig(data);
          if (data.queue_manager.DB_CONNECTION) {
            const isLocal = data.queue_manager.DB_CONNECTION.startsWith('local_file:');
            setConnection(prev => ({
              ...prev,
              string: isLocal ? '' : data.queue_manager.DB_CONNECTION,
              isLocal,
              connected: false,
              editing: true
            }));
          }
        }
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      showNotification("Error", "Failed to load configuration: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!connection.string && !connection.file) {
      showNotification("Error", "Please enter a file path or select a local file", "error");
      return;
    }
    setConnection(prev => ({ ...prev, loading: true }));
    showNotification("Testing connection...", "Please wait while we test the connection", "info");
    try {
      const response = await fetch(`${TestConnection_URL}/test_connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_string: connection.string,
          connection_type: 'sqlite'
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to connect to database');
      }
      setConnection(prev => ({
        ...prev,
        connected: true,
        loading: false
      }));
      showNotification(
        "Connection successful",
        `Connected to database!`,
        "success"
      );
    } catch (error) {
      showNotification(
        "Connection failed",
        error.message || "Failed to connect to the database",
        "error"
      );
      setConnection(prev => ({
        ...prev,
        connected: false,
        loading: false
      }));
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ['.sqlite', '.db', '.sqlite3'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!validExtensions.includes(fileExtension)) {
        showNotification(
          "Invalid file type",
          "Please select a valid SQLite file (.sqlite, .db, or .sqlite3)",
          "error"
        );
        event.target.value = '';
        return;
      }
      setConnection(prev => ({ ...prev, file }));
    }
  };

  const saveConfiguration = async () => {
    if (!connection.connected) {
      showNotification("Error", "Please connect to the database first", "error");
      return;
    }
    setConnection(prev => ({ ...prev, saving: true }));
    try {
      const newConfig = {
        queue_manager: {
          DB_CONNECTION: connection.isLocal 
            ? `${connection.file?.name || 'uploaded_file'}`
            : connection.string
        }
      };
      const response = await fetch(`${BaseURL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      const data = await response.json();
      showNotification("Success", data.message || "Configuration saved successfully", "success");
      setConfig(newConfig);
      setIsEditing(false);
      setConnection(prev => ({
        ...prev,
        editing: false,
        saving: false
      }));
    } catch (error) {
      showNotification("Error", error.message || "Failed to save configuration", "error");
      setConnection(prev => ({ ...prev, saving: false }));
    }
  };

  const handleAddConfiguration = () => {
    setConnection({
      string: "",
      isLocal: false,
      connected: false,
      loading: false,
      editing: true,
      file: null,
      saving: false
    });
    setShowConfigUI(true);
  };

  const handleEditMode = async () => {
    setIsEditing(true);
    if (config?.queue_manager) {
      const isLocal = config.queue_manager.DB_CONNECTION.startsWith('local_file:');
      setConnection(prev => ({
        ...prev,
        string: isLocal ? '' : config.queue_manager.DB_CONNECTION,
        isLocal,
        connected: false,
        editing: true,
        loading: false
      }));
    }
  };

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
              <Label htmlFor="maxQueueSize" className="text-sm font-medium text-gray-700">Maximum Queue Size</Label>
              <Select
                value={formData.maxQueueSize}
                onValueChange={(value) => handleInputChange("maxQueueSize", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select queue size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 items</SelectItem>
                  <SelectItem value="100">100 items</SelectItem>
                  <SelectItem value="200">200 items</SelectItem>
                  <SelectItem value="500">500 items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingInterval" className="text-sm font-medium text-gray-700">Processing Interval (seconds)</Label>
              <Select
                value={formData.processingInterval}
                onValueChange={(value) => handleInputChange("processingInterval", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 second</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
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
                <Label className="text-sm font-medium text-gray-700">Priority Queue</Label>
                <p className="text-sm text-gray-500">Enable priority-based processing</p>
              </div>
              <Switch
                checked={formData.enablePriorityQueue}
                onCheckedChange={(checked) => handleInputChange("enablePriorityQueue", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Auto Scaling</Label>
                <p className="text-sm text-gray-500">Automatically scale processing capacity</p>
              </div>
              <Switch
                checked={formData.enableAutoScaling}
                onCheckedChange={(checked) => handleInputChange("enableAutoScaling", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Notifications</Label>
                <p className="text-sm text-gray-500">Send alerts for queue events</p>
              </div>
              <Switch
                checked={formData.enableNotifications}
                onCheckedChange={(checked) => handleInputChange("enableNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Retry Failed Items</Label>
                <p className="text-sm text-gray-500">Automatically retry failed queue items</p>
              </div>
              <Switch
                checked={formData.enableRetry}
                onCheckedChange={(checked) => handleInputChange("enableRetry", checked)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="maxRetries" className="text-sm font-medium text-gray-700">Maximum Retries</Label>
              <Select
                value={formData.maxRetries}
                onValueChange={(value) => handleInputChange("maxRetries", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select max retries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 retry</SelectItem>
                  <SelectItem value="2">2 retries</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retryDelay" className="text-sm font-medium text-gray-700">Retry Delay (seconds)</Label>
              <Select
                value={formData.retryDelay}
                onValueChange={(value) => handleInputChange("retryDelay", value)}
              >
                <SelectTrigger className="border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select retry delay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                </SelectContent>
              </Select>
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
                  <span>Max Queue Size: {formData.maxQueueSize} items</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Processing Interval: {formData.processingInterval} seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Priority Queue: {formData.enablePriorityQueue ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Auto Scaling: {formData.enableAutoScaling ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Notifications: {formData.enableNotifications ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Retry Failed Items: {formData.enableRetry ? "Enabled" : "Disabled"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Max Retries: {formData.maxRetries}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Retry Delay: {formData.retryDelay} seconds</span>
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
    <PageLayout title="Queue Service Configuration">
      <div className="relative mx-auto">
        {!config?.queue_manager && !showConfigUI ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Queue Service</CardTitle>
                  <CardDescription>
                    Configure your queue management system to efficiently handle customer queues and service scheduling.
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
                    Configure your Queue service to start managing customer queues and service scheduling.
                  </p>
                </div>
                <Button 
                  onClick={handleAddConfiguration}
                  className="bg-primary text-white"
                >
                  + Add Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : config?.queue_manager && !isEditing ? (
          <ConfigurationPreview 
            config={config} 
            onEdit={handleEditMode} 
          />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Queue Configuration</CardTitle>
                  <CardDescription>Configure your Queue service by connecting to your database</CardDescription>
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
                  {config?.queue_manager && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel Edit</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <DatabaseIcon className="h-4 w-4" />
                    Database Connection
                  </h4>
                  {connection.isLocal ? (
                    <div className="space-y-2">
                      <Label htmlFor="sqliteFile">Select Database File</Label>
                      <Input 
                        id="sqliteFile"
                        type="file"
                        accept=".sqlite,.db,.sqlite3"
                        disabled={!connection.editing}
                        onChange={handleFileSelection}
                      />
                      {connection.file && (
                        <p className="text-sm text-gray-600">
                          Selected: {connection.file.name} ({(connection.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="connectionString">Database File Path</Label>
                      <Input 
                        id="connectionString"
                        placeholder="Enter path to database file (e.g., C:/Projects/database.db)"
                        value={connection.string}
                        onChange={(e) => setConnection(prev => ({ ...prev, string: e.target.value }))}
                        disabled={!connection.editing}
                      />
                    </div>
                  )}
                  <Button 
                    onClick={testConnection} 
                    variant="secondary" 
                    disabled={connection.loading || !connection.editing || (!connection.file && !connection.string)} 
                    className="mt-4"
                  >
                    {connection.loading ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  {connection.connected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
                {connection.connected && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveConfiguration}
                      className="bg-green-600 text-white hover:bg-green-700"
                      disabled={connection.saving}
                    >
                      {connection.saving ? "Saving..." : "Save Configuration"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
                notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                notification.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
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
    </PageLayout>
  );
} 