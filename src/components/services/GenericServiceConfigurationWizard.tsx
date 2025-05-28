import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Edit3, ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { PageLayout } from "../common/PageLayout";
import { getBaseUrlByCategory, TestConnection_URL, Config_URL } from "@/config";
import { useNavigate, useParams } from "react-router-dom";

interface TableMappingData {
  fields: Record<string, string>;
  name: string;
}

interface Config {
  DB_CONNECTION: string;
  DB_Type: string;
  SVD?: {
    latent_factors: string;
  };
  TABLE_MAPPING?: Record<string, TableMappingData>;
  loyalty_program?: {
    enabled: boolean;
    default_loyalty_score: number;
  };
  discount_rules?: {
    default_discount_percentage: number;
    max_discount_percentage: number;
  };
}

interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
}

interface ServiceConfig {
  title: string;
  tables?: {
    [key: string]: {
      fields: string[];
    };
  };
  DB_CONNECTION: string;
  DB_Type: string;
  SVD?: {
    latent_factors: string;
  };
  loyalty_program?: {
    enabled: boolean;
    default_loyalty_score: number;
  };
  discount_rules?: {
    default_discount_percentage: number;
    max_discount_percentage: number;
  };
}

interface ServiceConfiguration {
  DB_CONNECTION: string;
  DB_Type: string;
  TABLE_MAPPING?: Record<string, TableMappingData>;
  loyalty_and_discount?: {
    enabled: string;
    discount_rules_table: {
      name: string;
      fields: Record<string, string>;
    };
  };
}

function ConfigurationPreview({ config, onEdit, serviceConfig }: { 
  config: Config; 
  onEdit: () => void;
  serviceConfig: ServiceConfig;
}) {
  const navigate = useNavigate();
  
  if (!config) return null;

  return (
    <Card className="mx-auto shadow-lg border-2 border-gray-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">{serviceConfig.title} Configuration</CardTitle>
            <CardDescription className="text-gray-600 mt-1">Current configuration settings</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/services')}
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Services</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center space-x-2 bg-white hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Configuration</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
            <DatabaseIcon className="h-5 w-5 text-indigo-600" />
            Database Connection
          </h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            {config.DB_CONNECTION.startsWith('local_file:') 
              ? 'Local Database File' 
              : config.DB_CONNECTION}
          </p>
        </div>

        {config.TABLE_MAPPING && (
          <div className="space-y-6">
            <h4 className="font-semibold text-lg text-gray-800">Table Mappings</h4>
            {Object.entries(config.TABLE_MAPPING).map(([tableKey, mapping]: [string, TableMappingData]) => (
              <div key={tableKey} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h5 className="text-base font-semibold mb-4 text-indigo-600 capitalize">
                  {tableKey.replace('_table', '')} Table: {mapping.name}
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(mapping.fields).map(([field, column]: [string, string]) => (
                    <div key={field} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium min-w-[120px] text-gray-700">{field.replace('_', ' ')}:</span>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded border border-gray-200">{column}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render service-specific configurations */}
        {Object.entries(config).map(([key, value]) => {
          if (key !== 'DB_CONNECTION' && key !== 'DB_Type' && key !== 'TABLE_MAPPING' && key !== 'SVD') {
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-semibold text-lg mb-4 text-gray-800 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                {typeof value === 'object' && value !== null && (
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-medium min-w-[120px] text-gray-700">
                          {subKey.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded border border-gray-200">
                          {String(subValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </CardContent>
    </Card>
  );
}

export function GenericServiceConfigurationWizard() {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const [connection, setConnection] = useState({
    string: "",
    isLocal: false,
    connected: false,
    loading: false,
    editing: true,
    file: null,
    saving: false
  });
  
  const [database, setDatabase] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({});
  const [selectedTable, setSelectedTable] = useState<Record<string, string>>({});
  const [fieldMappings, setFieldMappings] = useState<Record<string, Record<string, string>>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<Config>();
  const [loading, setLoading] = useState(false);
  const [showConfigUI, setShowConfigUI] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [BaseURL, setBaseURL] = useState(getBaseUrlByCategory());
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig | null>(null);
  const [loyaltyConfig, setLoyaltyConfig] = useState({
    enabled: true,
    default_loyalty_score: 0
  });
  const [discountConfig, setDiscountConfig] = useState({
    default_discount_percentage: 5,
    max_discount_percentage: 50
  });

  useEffect(() => {
    loadServiceConfig();
  }, [serviceType]);

  const loadServiceConfig = async () => {
    try {
      // Convert URL-friendly name back to display name
      const displayName = serviceType?.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      const response = await fetch(`${Config_URL}/services/${displayName}`);
      if (response.ok) {
        const data = await response.json();
        
        // Create service config with dynamic fields
        const newServiceConfig = {
          title: displayName || '',
          tables: {},
          ...data // Include all other service-specific configurations
        };

        // Handle TABLE_MAPPING structure
        if (data.TABLE_MAPPING) {
          const tables: Record<string, { fields: string[] }> = {};
          Object.entries(data.TABLE_MAPPING).forEach(([tableKey, mapping]: [string, TableMappingData]) => {
            const tableType = tableKey.replace('_table', '');
            tables[tableType] = {
              fields: Object.keys(mapping.fields)
            };
          });
          newServiceConfig.tables = tables;
        }
        // Handle loyalty_and_discount specific structure
        else if (data.loyalty_and_discount) {
          if (data.loyalty_and_discount.discount_rules_table) {
            newServiceConfig.tables = {
              discount_rules: {
                fields: Object.keys(data.loyalty_and_discount.discount_rules_table.fields)
              }
            };
          }
        }
        
        setServiceConfig(newServiceConfig);
        
        // Initialize table columns and mappings based on the service config
        if (newServiceConfig.tables) {
          const initialTableColumns: Record<string, string[]> = {};
          const initialSelectedTable: Record<string, string> = {};
          const initialFieldMappings: Record<string, Record<string, string>> = {};
          
          Object.keys(newServiceConfig.tables).forEach(tableKey => {
            initialTableColumns[tableKey] = [];
            initialSelectedTable[tableKey] = "";
            initialFieldMappings[tableKey] = {};
          });
          
          setTableColumns(initialTableColumns);
          setSelectedTable(initialSelectedTable);
          setFieldMappings(initialFieldMappings);
        }

        // Initialize service-specific configurations if they exist
        if (data.loyalty_and_discount) {
          setLoyaltyConfig({
            enabled: data.loyalty_and_discount.enabled === "true",
            default_loyalty_score: 0
          });
        }
      } else {
        throw new Error('Failed to load service configuration');
      }
    } catch (error) {
      showNotification("Error", "Failed to load service configuration: " + error.message, "error");
    }
  };

  const showNotification = (title: string, description: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const testConnection = async () => {
    if (!connection.string && !connection.file) {
      showNotification("Error", "Please enter a file path or select a local file", "error");
      return;
    }
    
    setConnection(prev => ({ ...prev, loading: true }));
    showNotification("Testing connection...", "Please wait while we test the connection", "info");
    
    try {
      const response = await fetch(`${TestConnection_URL}/db/test_connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_string: connection.string,
          connection_type: 'mysql'
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to connect to database');
      }

      setTables(data.tables);
      setDatabase({ serverConnection: true, connectionString: connection.string });
      setConnection(prev => ({
        ...prev,
        connected: true,
        loading: false
      }));
      
      showNotification(
        "Connection successful",
        `Connected to database with ${data.tables.length} tables`,
        "success"
      );
    } catch (error) {
      showNotification(
        "Connection failed",
        error.message || "Failed to connect to the database",
        "error"
      );
      setTables([]);
      setDatabase(null);
      setConnection(prev => ({
        ...prev,
        connected: false,
        loading: false
      }));
    }
  };

  const handleTableSelection = async (tableType: string, tableValue: string) => {
    setSelectedTable(prev => ({ ...prev, [tableType]: tableValue }));
    
    if (!tableValue) {
      setTableColumns(prev => ({ ...prev, [tableType]: [] }));
      return;
    }
    
    try {
      const response = await fetch(`${TestConnection_URL}/db/get_table_columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_string: connection.string,
          connection_type: "mysql",
          table_name: tableValue
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch table columns');
      }

      setTableColumns(prev => ({ ...prev, [tableType]: data.columns }));
    } catch (error) {
      showNotification("Error", error.message || "Failed to fetch table columns", "error");
      setTableColumns(prev => ({ ...prev, [tableType]: [] }));
    }
  };

  const handleFieldMapping = (tableType: string, fieldName: string, columnName: string) => {
    setFieldMappings(prev => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        [fieldName]: columnName
      }
    }));
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
      const newConfig: ServiceConfiguration = {
        DB_CONNECTION: connection.isLocal 
          ? `${connection.file?.name || 'uploaded_file'}`
          : connection.string,
        DB_Type: "mysql"
      };

      // Handle loyalty and discount service specifically
      if (serviceConfig?.title === "Loyalty and discount") {
        newConfig.loyalty_and_discount = {
          enabled: loyaltyConfig.enabled.toString(),
          discount_rules_table: {
            name: selectedTable.discount_rules || "",
            fields: {}
          }
        };

        // Add field mappings for discount rules table
        if (selectedTable.discount_rules) {
          Object.entries(fieldMappings.discount_rules || {}).forEach(([field, column]) => {
            if (newConfig.loyalty_and_discount) {
              newConfig.loyalty_and_discount.discount_rules_table.fields[field] = column;
            }
          });
        }
      } else {
        // Handle other services
        newConfig.TABLE_MAPPING = {};
        Object.keys(selectedTable).forEach(tableType => {
          if (selectedTable[tableType]) {
            newConfig.TABLE_MAPPING![`${tableType}_table`] = {
              name: selectedTable[tableType],
              fields: fieldMappings[tableType]
            };
          }
        });
      }

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
    setSelectedTable({});
    setFieldMappings({});
    setTables([]);
    setTableColumns({});
    setDatabase(null);
    setShowConfigUI(true);
  };

  const handleEditMode = async () => {
    setIsEditing(true);
    
    if (config?.DB_CONNECTION) {
      const isLocal = config.DB_CONNECTION.startsWith('local_file:');
      setConnection(prev => ({
        ...prev,
        string: isLocal ? '' : config.DB_CONNECTION,
        isLocal,
        connected: false,
        editing: true,
        loading: true
      }));

      try {
        await testConnection();
        
        const newSelectedTable = {};
        const newFieldMappings = {};
        const newTableColumns = {};

        Object.entries(config.TABLE_MAPPING || {}).forEach(([key, value]) => {
          const tableType = key.replace('_table', '');
          newSelectedTable[tableType] = value.name;
          newFieldMappings[tableType] = value.fields;
        });

        setSelectedTable(newSelectedTable);
        setFieldMappings(newFieldMappings);

        for (const [tableType, tableName] of Object.entries(newSelectedTable)) {
          await handleTableSelection(tableType, tableName as string);
        }
      } catch (error) {
        console.error('Error in edit mode:', error);
        showNotification("Error", "Failed to load existing configuration", "error");
      }
    }
  };

  if (!serviceConfig) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${serviceConfig.title} Configuration`}>
      <div className="relative mx-auto max-w-7xl">
        {!config?.DB_CONNECTION && !showConfigUI ? (
          <Card className="shadow-lg border-2 border-gray-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{serviceConfig.title}</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Connect your database to enable {serviceConfig.title.toLowerCase()} functionality.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/services')}
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Services</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-semibold text-gray-800">No Configuration Found</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Configure your {serviceConfig.title} service to get started.
                  </p>
                </div>
                <Button 
                  onClick={handleAddConfiguration}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg transition-colors"
                >
                  + Add Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : config?.DB_CONNECTION && !isEditing ? (
          <ConfigurationPreview 
            config={config} 
            onEdit={handleEditMode}
            serviceConfig={serviceConfig}
          />
        ) : (
          <Card className="shadow-lg border-2 border-gray-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{serviceConfig.title} Configuration</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Configure your {serviceConfig.title} service by connecting to your database
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/services')}
                    className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Services</span>
                  </Button>
                  {config?.DB_CONNECTION && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 hover:bg-gray-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel Edit</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <DatabaseIcon className="h-5 w-5 text-indigo-600" />
                  Database Connection
                </h4>
                
                {connection.isLocal ? (
                  <div className="space-y-3">
                    <Label htmlFor="sqliteFile" className="text-sm font-medium text-gray-700">Select Database File</Label>
                    <Input 
                      id="sqliteFile"
                      type="file"
                      accept=".sqlite,.db,.sqlite3"
                      disabled={!connection.editing}
                      onChange={handleFileSelection}
                      className="border-2 border-gray-200 rounded-lg p-2"
                    />
                    {connection.file && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        Selected: {connection.file.name} ({(connection.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="connectionString" className="text-sm font-medium text-gray-700">Database File Path</Label>
                    <Input 
                      id="connectionString"
                      placeholder="Enter path to database file (e.g., C:/Projects/database.db)"
                      value={connection.string}
                      onChange={(e) => setConnection(prev => ({ ...prev, string: e.target.value }))}
                      disabled={!connection.editing}
                      className="border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                )}
                
                <Button 
                  onClick={testConnection} 
                  variant="secondary" 
                  disabled={connection.loading || !connection.editing || (!connection.file && !connection.string)} 
                  className="mt-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  {connection.loading ? "Testing..." : "Test Connection"}
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {connection.connected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Connected - {tables.length} tables found</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Not Connected</span>
                  </>
                )}
              </div>
              
              {connection.connected && serviceConfig?.tables && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                  <h4 className="font-semibold text-lg text-gray-800">Table Configuration</h4>
                  {Object.entries(serviceConfig.tables).map(([tableType, tableConfig], index, array) => (
                    <div key={tableType} className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <Label
                          htmlFor={`${tableType}`}
                          className="block text-base font-semibold text-indigo-600 mb-4 tracking-wider uppercase"
                        >
                          Select {tableType.replace('_', ' ')} Table
                        </Label>
                        <Select 
                          disabled={!connection.connected}
                          onValueChange={(value) => handleTableSelection(tableType, value)}
                          value={selectedTable[tableType] || ""}
                        >
                          <SelectTrigger className="mt-1.5 border-2 border-gray-200">
                            <SelectValue placeholder={`Select ${tableType.replace('_', ' ')} table`} />
                          </SelectTrigger>
                          <SelectContent>
                            {tables?.map((table) => (
                              <SelectItem key={table} value={table}>{table}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedTable[tableType] && tableConfig?.fields && (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                          <Label className="text-base font-semibold text-gray-800">Field Mapping</Label>
                          <div className="grid grid-cols-2 gap-6">
                            {Array.isArray(tableConfig.fields) ? (
                              // Handle array of fields
                              tableConfig.fields.map((field) => (
                                <div key={field} className="space-y-2">
                                  <Label htmlFor={`${tableType}_${field}`} className="text-sm font-medium text-gray-700">
                                    {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Label>
                                  <Select 
                                    disabled={!connection.connected || !selectedTable[tableType]}
                                    onValueChange={(value) => handleFieldMapping(tableType, field, value)}
                                    value={fieldMappings[tableType]?.[field] || ""}
                                  >
                                    <SelectTrigger className="border-2 border-gray-200">
                                      <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {tableColumns[tableType]?.map((column) => (
                                        <SelectItem key={column} value={column}>{column}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))
                            ) : (
                              // Handle object of fields
                              Object.entries(tableConfig.fields).map(([field, _]) => (
                                <div key={field} className="space-y-2">
                                  <Label htmlFor={`${tableType}_${field}`} className="text-sm font-medium text-gray-700">
                                    {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Label>
                                  <Select 
                                    disabled={!connection.connected || !selectedTable[tableType]}
                                    onValueChange={(value) => handleFieldMapping(tableType, field, value)}
                                    value={fieldMappings[tableType]?.[field] || ""}
                                  >
                                    <SelectTrigger className="border-2 border-gray-200">
                                      <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {tableColumns[tableType]?.map((column) => (
                                        <SelectItem key={column} value={column}>{column}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      {index < array.length - 1 && (
                        <div className="border-t border-gray-200 my-6" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {connection.connected && (
                <div className="flex justify-end">
                  <Button 
                    onClick={saveConfiguration}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg transition-colors"
                    disabled={connection.saving}
                  >
                    {connection.saving ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="fixed top-4 right-4 z-50 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
                notification.type === 'success' ? 'bg-green-50 border-2 border-green-200' :
                notification.type === 'error' ? 'bg-red-50 border-2 border-red-200' :
                'bg-blue-50 border-2 border-blue-200'
              }`}
            >
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mr-3" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-600 mr-3" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />}
              <div>
                <h4 className="font-medium text-sm text-gray-800">{notification.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 