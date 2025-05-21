import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Edit3 } from "lucide-react";
import initSqlJs, { Database } from "sql.js";
import { PageLayout } from "../common/PageLayout";
import { BASE_URL_Retail } from "@/config";

interface TableMapping {
  name: string;
  fields: Record<string, string>;
}

interface ItemLocatorConfig {
  DB_CONNECTION: string;
  TABLE_MAPPING: Record<string, TableMapping>;
}

interface Config {
  item_locator?: ItemLocatorConfig;
}

export function ItemLocatorServiceConfigurationWizard() {
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
  const [columns, setColumns] = useState([]);
  const [selectedTable, setSelectedTable] = useState<Record<string, string>>({ products: "" });
  const [fieldMappings, setFieldMappings] = useState<Record<string, Record<string, string>>>({ products: {} });
  const [notifications, setNotifications] = useState([]);

  const [config, setConfig] = useState<Config>();
  const [loading, setLoading] = useState(false);
  const [showConfigUI, setShowConfigUI] = useState(false);
  
  const serviceConfig = {
    title: "Item Locator",
    tables: {
      products: {
        fields: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"]
      }
    }
  };
  
  // Load config when component mounts
  useEffect(() => {
    loadConfig();
  }, []); // Empty dependency array means this runs once on mount

  // Load config from API
  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL_Retail}/get_config`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if item_locator config exists
        if (data && data.item_locator) {
          setConfig(data);
          // Populate existing values
          if (data.item_locator.DB_CONNECTION) {
            const isLocal = data.item_locator.DB_CONNECTION.startsWith('local_file:');
            setConnection(prev => ({
              ...prev,
              string: isLocal ? '' : data.item_locator.DB_CONNECTION,
              isLocal,
              connected: false,
              editing: true
            }));
          }

          // // Populate table mappings if they exist
          // if (data.item_locator.TABLE_MAPPING) {
          //   const newSelectedTable = {};
          //   const newFieldMappings = {};

          //   Object.entries(data.item_locator.TABLE_MAPPING).forEach(([key, value]) => {
          //     const tableType = key.replace('_table', '');
          //     newSelectedTable[tableType] = (value as TableMapping).name;
          //     newFieldMappings[tableType] = (value as TableMapping).fields;
          //   });

          //   // setSelectedTable(newSelectedTable);
          //   // setFieldMappings(newFieldMappings);
          // }
        } else {
          // Show message about what the service is for
          // showNotification(
          //   "Item Locator Service",
          //   "The Item Locator service helps you locate items in your inventory by connecting to your database. It maps your database tables and fields to enable efficient item searching and tracking.",
          //   "info"
          // );
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

  const showNotification = (title, description, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  
  const loadSQLiteFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Initialize SQL.js
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      // Create database from file
      const db = new SQL.Database(uint8Array);
      
      // Verify it's a valid SQLite database by querying sqlite_master
      const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
      const tables = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        tables.push(row.name);
      }
      stmt.free();
      
      if (tables.length === 0) {
        throw new Error("No tables found in the database file");
      }
      
      return { db, tables };
    } catch (error) {
      console.error('Error loading database file:', error);
      throw new Error(`Invalid database file: ${error.message}`);
    }
  };
  
  // Test connection for file path or uploaded file
  const testConnection = async () => {
    if (!connection.string && !connection.file) {
      showNotification(
        "Error",
        "Please enter a file path or select a local file",
        "error"
      );
      return;
    }
    
    setConnection(prev => ({ ...prev, loading: true }));
    
    showNotification(
      "Testing connection...",
      "Please wait while we test the connection",
      "info"
    );
    
    try {
      let dbResult;
      
      if (connection.isLocal && connection.file) {
        // Handle uploaded file
        dbResult = await loadSQLiteFile(connection.file);
      } else if (!connection.isLocal && connection.string) {
        // Handle file path - use the Python API
        try {
          const response = await fetch(`http://127.0.0.1:5000/test_connection`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              connection_string: connection.string,
              connection_type: 'sqlite'
            })
          });

          const data = await response.json();
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to connect to database');
          }

          // Store the tables and set a flag for server-side connection
          setTables(data.tables);
          setDatabase({ serverConnection: true, connectionString: connection.string });
          
          dbResult = { tables: data.tables };
          setSelectedTable({ products: "" });
        } catch (error) {
          console.error('Connection error:', error);
          if (error.message.includes('fetch') || error.name === 'TypeError') {
            throw new Error(`Cannot connect to the API server. Please ensure the Python API server is running at ${BASE_URL_Retail}`);
          } else {
            throw new Error(error.message || `Cannot read file from path: ${connection.string}`);
          }
        }
      } else {
        throw new Error("Invalid connection configuration");
      }
      
      setConnection(prev => ({
        ...prev,
        connected: true,
        loading: false
      }));
      
      showNotification(
        "Connection successful",
        `Connected to database with ${dbResult.tables ? dbResult.tables.length : tables.length} tables`,
        "success"
      );
    } catch (error) {
      console.error('Connection test failed:', error);
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
  
  // Get columns for a specific table
  const getTableColumns = async (tableName) => {
    try {
      if (!database) {
        throw new Error("Database not connected");
      }
      
      // Check if this is a server-side connection
      if (database.serverConnection) {
        // For server-side connections, fetch columns from the API
        const response = await fetch(`http://127.0.0.1:5000/get_table_columns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection_string: database.connectionString,
            table_name: tableName
          })
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch table columns');
        }

        if (!data.columns || !Array.isArray(data.columns)) {
          throw new Error(`No columns found in table: ${tableName}`);
        }

        return data.columns;
      } else {
        // Handle local database (uploaded file)
        const stmt = database.prepare(`PRAGMA table_info(${tableName})`);
        const columns = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          columns.push(row.name);
        }
        stmt.free();
        
        if (columns.length === 0) {
          throw new Error(`No columns found in table: ${tableName}`);
        }
        
        return columns;
      }
    } catch (error) {
      console.error('Error getting table columns:', error);
      throw error;
    }
  };
  
  // Handle table selection and load its columns
  const handleTableSelection = async (tableType, tableValue) => {
    setSelectedTable(prev => ({
      ...prev,
      [tableType]: tableValue
    }));
    
    if (!tableValue) {
      setColumns([]);
      return;
    }
    
    try {
      showNotification(
        "Loading columns...",
        `Fetching columns for table: ${tableValue}`,
        "info"
      );
      
      const tableColumns = await getTableColumns(tableValue);
      setColumns(tableColumns);
      
      showNotification(
        "Columns loaded",
        `Successfully loaded ${tableColumns.length} columns for table: ${tableValue}`,
        "success"
      );
    } catch (error) {
      showNotification(
        "Error",
        error.message || "Failed to fetch table columns",
        "error"
      );
      setColumns([]);
    }
  };
  
  const handleFieldMapping = (tableType, fieldName, columnName) => {
    setFieldMappings(prev => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        [fieldName]: columnName
      }
    }));
  };
  
  const updateConnectionState = (field, value) => {
    setConnection(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file extension
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
      
      setConnection(prev => ({
        ...prev,
        file: file
      }));
    }
  };
 
  const saveConfiguration = async () => {
    if (!connection.connected) {
      showNotification(
        "Error",
        "Please connect to the database first",
        "error"
      );
      return;
    }

    setConnection(prev => ({ ...prev, saving: true }));

    try {
      const config = {
        item_locator: {
          DB_CONNECTION: connection.isLocal 
            ? `${connection.file?.name || 'uploaded_file'}`
            : connection.string,
          TABLE_MAPPING: {}
        }
      };

      // Add table mappings
      Object.keys(selectedTable).forEach(tableType => {
        if (selectedTable[tableType]) {
          config.item_locator.TABLE_MAPPING[`${tableType}_table`] = {
            name: selectedTable[tableType],
            fields: fieldMappings[tableType]
          };
        }
      });

      const response = await fetch(`${BASE_URL_Retail}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const data = await response.json();
      
      showNotification(
        "Success",
        data.message || "Configuration saved successfully",
        "success"
      );

      // Set editing to false after successful save
      setConnection(prev => ({
        ...prev,
        editing: false,
        saving: false
      }));
    } catch (error) {
      console.error('Error saving configuration:', error);
      showNotification(
        "Error",
        error.message || "Failed to save configuration",
        "error"
      );
      setConnection(prev => ({ ...prev, saving: false }));
    }
  };

  const handleAddConfiguration = () => {
    // Reset all states to initial values
    setConnection({
      string: "",
      isLocal: false,
      connected: false,
      loading: false,
      editing: true,
      file: null,
      saving: false
    });
    setSelectedTable({ products: "" });
    setFieldMappings({ products: {} });
    setTables([]);
    setColumns([]);
    setDatabase(null);
    setShowConfigUI(true);
  };

  return (
    <PageLayout title="Item Locator Service Configuration">
      <div className="relative">
        {!config?.item_locator && !showConfigUI ? (
          <Card>
            <CardHeader>
              <CardTitle>Item Locator Service</CardTitle>
              <CardDescription>
                The Item Locator service helps you locate items in your inventory by connecting to your database. 
                It maps your database tables and fields to enable efficient item searching and tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No Configuration Found</h3>
                  <p className="text-sm text-gray-500">
                    Configure your Item Locator service to start tracking and searching items in your inventory.
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Item Locator Configuration</CardTitle>
              <CardDescription>Configure your Item Locator service by connecting to your database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Connection Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useLocalFile"
                        checked={connection.isLocal}
                        onChange={(e) => updateConnectionState('isLocal', e.target.checked)}
                        disabled={!connection.editing}
                        aria-label="Use local database file"
                      />
                      <Label htmlFor="useLocalFile">Upload local database file</Label>
                    </div>
                    {!connection.editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConnection(prev => ({ ...prev, editing: true }))}
                        className="flex items-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Configuration</span>
                      </Button>
                    )}
                  </div>
                  
                  {connection.isLocal ? (
                    <div>
                      <Label htmlFor="sqliteFile">Select Database File</Label>
                      <Input 
                        id="sqliteFile"
                        type="file"
                        accept=".sqlite,.db,.sqlite3"
                        disabled={!connection.editing}
                        onChange={handleFileSelection}
                        className="mt-1.5"
                      />
                      {connection.file && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {connection.file.name} ({(connection.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="connectionString">Database File Path</Label>
                      <div className="flex space-x-2 mt-1.5">
                        <Input 
                          id="connectionString"
                          placeholder="Enter path to database file (e.g., C:/Projects/database.db)"
                          value={connection.string}
                          onChange={(e) => updateConnectionState('string', e.target.value)}
                          disabled={!connection.editing}
                        />
                      </div>
                      {/* <p className="text-sm text-gray-500 mt-1">
                        Example: C:/Projects/AALAI/retail/businesses/kirana_shop/kirana_shop.db
                      </p> */}
                    </div>
                  )}
                  
                  <Button 
                    onClick={testConnection} 
                    variant="secondary" 
                    disabled={connection.loading || !connection.editing || (!connection.file && !connection.string)} 
                    className="mt-2"
                  >
                    {connection.loading ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
                
                {/* Connection Status */}
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
                
                {/* Configuration Section - Only enabled after connection */}
                <div className={!connection.connected ? "opacity-50 pointer-events-none" : ""}>
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">Table Configuration</h4>
                    <div className="space-y-4">
                      {Object.keys(serviceConfig.tables).map(tableType => (
                        <div key={tableType} className="space-y-3">
                          <h5 className="font-medium capitalize text-sm">{tableType.replace('_', ' ')} Table</h5>
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
                            <div>
                              <Label>Field Mapping for {tableType}</Label>
                              <div className="grid grid-cols-2 gap-3 mt-1.5">
                                {serviceConfig.tables[tableType].fields.map((field) => (
                                  <div key={field}>
                                    <Label htmlFor={`${tableType}_${field}`} className="text-xs">
                                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Label>
                                    <Select 
                                      disabled={!connection.connected || !selectedTable[tableType]}
                                      onValueChange={(value) => handleFieldMapping(tableType, field, value)}
                                      value={fieldMappings[tableType][field] || ""}
                                    >
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
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Submit and Save Buttons */}
                {connection.connected && (
                  <div className="flex justify-end space-x-2">
                    <Button 
                      onClick={saveConfiguration}
                      className="bg-green-600 text-white"
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
    </PageLayout>
  );
} 