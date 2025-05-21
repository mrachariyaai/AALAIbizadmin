import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Edit3, ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { PageLayout } from "../common/PageLayout";
import { getBaseUrlByCategory, TestConnection_URL } from "@/config";
import { useNavigate } from "react-router-dom";

interface TableMapping {
  name: string;
  fields: Record<string, string>;
}

interface RecruitmentConfig {
  DB_CONNECTION: string;
  TABLE_MAPPING: Record<string, TableMapping>;
}

interface Config {
  recruitment?: RecruitmentConfig;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
}

function ConfigurationPreview({ config, onEdit }: { config: Config; onEdit: () => void }) {
  const navigate = useNavigate();
  
  if (!config.recruitment) return null;

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Recruitment Configuration</CardTitle>
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
              {config.recruitment.DB_CONNECTION.startsWith('local_file:') 
                ? 'Local Database File' 
                : config.recruitment.DB_CONNECTION}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Table Mappings</h4>
            {Object.entries(config.recruitment.TABLE_MAPPING).map(([tableKey, mapping]: [string, TableMapping]) => (
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

export function RecruitmentServiceConfigurationWizard() {
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
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({
    jobs: []
  });
  const [selectedTable, setSelectedTable] = useState<Record<string, string>>({
    jobs: ""
  });
  const [fieldMappings, setFieldMappings] = useState<Record<string, Record<string, string>>>({
    jobs: {}
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<Config>();
  const [loading, setLoading] = useState(false);
  const [showConfigUI, setShowConfigUI] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [BaseURL, setBaseURL] = useState(getBaseUrlByCategory())
  
  const serviceConfig = {
    title: "Recruitment",
    tables: {
      jobs: {
        fields: ["job_id", "job_title", "job_description"]
      }
    }
  };

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
        if (data?.recruitment) {
          setConfig(data);
          if (data.recruitment.DB_CONNECTION) {
            const isLocal = data.recruitment.DB_CONNECTION.startsWith('local_file:');
            setConnection(prev => ({
              ...prev,
              string: isLocal ? '' : data.recruitment.DB_CONNECTION,
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
      const response = await fetch(`${TestConnection_URL}/get_table_columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_string: connection.string,
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
      const newConfig = {
        recruitment: {
          DB_CONNECTION: connection.isLocal 
            ? `${connection.file?.name || 'uploaded_file'}`
            : connection.string,
          TABLE_MAPPING: {}
        }
      };

      Object.keys(selectedTable).forEach(tableType => {
        if (selectedTable[tableType]) {
          newConfig.recruitment.TABLE_MAPPING[`${tableType}_table`] = {
            name: selectedTable[tableType],
            fields: fieldMappings[tableType]
          };
        }
      });

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
    setSelectedTable({
      jobs: ""
    });
    setFieldMappings({
      jobs: {}
    });
    setTables([]);
    setTableColumns({
      jobs: []
    });
    setDatabase(null);
    setShowConfigUI(true);
  };

  const handleEditMode = async () => {
    setIsEditing(true);
    
    if (config?.recruitment) {
      const isLocal = config.recruitment.DB_CONNECTION.startsWith('local_file:');
      setConnection(prev => ({
        ...prev,
        string: isLocal ? '' : config.recruitment.DB_CONNECTION,
        isLocal,
        connected: false,
        editing: true,
        loading: true
      }));

      try {
        await testConnection();
        
        const newSelectedTable = {};
        const newFieldMappings = {};

        Object.entries(config.recruitment.TABLE_MAPPING).forEach(([key, value]) => {
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

  return (
    <PageLayout title="Recruitment Service Configuration">
      <div className="relative mx-auto">
        {!config?.recruitment && !showConfigUI ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Recruitment Service</CardTitle>
                  <CardDescription>
                    Connect your database to enable job posting and recruitment management.
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
                    Configure your Recruitment service to start managing job postings.
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
        ) : config?.recruitment && !isEditing ? (
          <ConfigurationPreview 
            config={config} 
            onEdit={handleEditMode} 
          />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Recruitment Configuration</CardTitle>
                  <CardDescription>Configure your Recruitment service by connecting to your database</CardDescription>
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
                  {config?.recruitment && (
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
                      <span className="text-green-600 font-medium">Connected - {tables.length} tables found</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
                
                {connection.connected && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h4 className="font-medium">Table Configuration</h4>
                    {Object.keys(serviceConfig.tables).map(tableType => (
                      <div key={tableType} className="space-y-4">
                        <div>
                          <Label htmlFor={`${tableType}_table`}>Select {tableType.replace('_', ' ')} Table</Label>
                          <Select 
                            disabled={!connection.connected}
                            onValueChange={(value) => handleTableSelection(tableType, value)}
                            value={selectedTable[tableType] || ""}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder={`Select ${tableType} table`} />
                            </SelectTrigger>
                            <SelectContent>
                              {tables.map((table) => (
                                <SelectItem key={table} value={table}>{table}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedTable[tableType] && (
                          <div className="space-y-2">
                            <Label>Field Mapping</Label>
                            <div className="grid grid-cols-2 gap-4">
                              {serviceConfig.tables[tableType].fields.map((field) => (
                                <div key={field} className="space-y-1">
                                  <Label htmlFor={`${tableType}_${field}`} className="text-xs">
                                    {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Label>
                                  <Select 
                                    disabled={!connection.connected || !selectedTable[tableType]}
                                    onValueChange={(value) => handleFieldMapping(tableType, field, value)}
                                    value={fieldMappings[tableType][field] || ""}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {tableColumns[tableType].map((column) => (
                                        <SelectItem key={column} value={column}>{column}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
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