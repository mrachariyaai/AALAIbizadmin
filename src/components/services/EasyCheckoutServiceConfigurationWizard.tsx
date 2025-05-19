import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Edit3 } from "lucide-react";
import initSqlJs, { Database } from "sql.js";
import { PageLayout } from "../common/PageLayout";
import { BASE_URL_Retail } from "@/config";

export function EasyCheckoutServiceConfigurationWizard() {
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
  const [selectedTable, setSelectedTable] = useState({
    products: "",
    cart_items: "",
    bills: "",
    bill_items: ""
  });
  const [fieldMappings, setFieldMappings] = useState({
    products: {},
    cart_items: {},
    bills: {},
    bill_items: {}
  });
  const [notifications, setNotifications] = useState([]);
  
  const serviceConfig = {
    title: "Easy Checkout",
    tables: {
      products: {
        fields: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"]
      },
      cart_items: {
        fields: ["user_id", "product_id", "quantity"]
      },
      bills: {
        fields: ["bill_number", "user_id", "total_price", "discounted_total", "bill_date"]
      },
      bill_items: {
        fields: ["bill_number", "product_id", "quantity", "total_price", "discounted_price"]
      }
    }
  };
  
  const showNotification = (title, description, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  
  // Load SQLite file and initialize database connection
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
        throw new Error("No tables found in the SQLite file");
      }
      
      return { db, tables };
    } catch (error) {
      console.error('Error loading SQLite file:', error);
      throw new Error(`Invalid SQLite file: ${error.message}`);
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
        // Handle file path - try to read using window.fs.readFile
        try {
          // Use window.FS instead of window.fs
          const fileData = await window.FS.readFile(connection.string);
          const blob = new Blob([fileData]);
          const file = new File([blob], connection.string.split('/').pop() || 'database.db');
          dbResult = await loadSQLiteFile(file);
        } catch (fsError) {
          throw new Error(`Cannot read file from path: ${connection.string}. Please ensure the file exists and is accessible.`);
        }
      } else {
        throw new Error("Invalid connection configuration");
      }
      
      // Store database instance and tables
      setDatabase(dbResult.db);
      setTables(dbResult.tables);
      
      setConnection(prev => ({
        ...prev,
        connected: true,
        loading: false
      }));
      
      showNotification(
        "Connection successful",
        `Connected to SQLite file with ${dbResult.tables.length} tables`,
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
      
      // Get table info using PRAGMA table_info
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
  
  const submitServiceConfiguration = () => {
    // Validate that all required fields are mapped
    const requiredTables = Object.keys(serviceConfig.tables);
    const configuredTables = Object.keys(selectedTable).filter(
      tableType => selectedTable[tableType]
    );
    
    if (configuredTables.length === 0) {
      showNotification(
        "Error",
        "Please configure at least one table",
        "error"
      );
      return;
    }
    
    // Check if all required fields for configured tables are mapped
    let allFieldsMapped = true;
    configuredTables.forEach(tableType => {
      const requiredFields = serviceConfig.tables[tableType].fields;
      const mappedFields = Object.keys(fieldMappings[tableType]).filter(
        field => fieldMappings[tableType][field]
      );
      
      if (mappedFields.length !== requiredFields.length) {
        allFieldsMapped = false;
      }
    });
    
    if (!allFieldsMapped) {
      showNotification(
        "Warning",
        "Some fields are not mapped. Please complete all field mappings.",
        "error"
      );
      return;
    }
    
    // Generate configuration
    const config = {
      DB_CONNECTION: connection.isLocal 
        ? `local_file:${connection.file?.name || 'uploaded_file'}`
        : connection.string,
      TABLE_MAPPING: {}
    };
    
    configuredTables.forEach(tableType => {
      const tableName = selectedTable[tableType];
      config.TABLE_MAPPING[`${tableType}_table`] = {
        name: tableName,
        fields: fieldMappings[tableType]
      };
    });
    
    console.log("Easy Checkout Configuration:", config);
    
    // Set editing to false
    setConnection(prev => ({
      ...prev,
      editing: false
    }));
    
    showNotification(
      "Configuration saved",
      "Easy Checkout configuration has been saved successfully",
      "success"
    );
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
        easy_checkout: {
          DB_CONNECTION: connection.isLocal 
            ? `local_file:${connection.file?.name || 'uploaded_file'}`
            : connection.string,
          TABLE_MAPPING: {}
        }
      };

      // Add table mappings
      Object.keys(selectedTable).forEach(tableType => {
        if (selectedTable[tableType]) {
          config.easy_checkout.TABLE_MAPPING[`${tableType}_table`] = {
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

  return (
    <PageLayout title="Easy Checkout Service Configuration">
      <div className="relative">
        <Card>
          <CardHeader>
            <CardTitle>Easy Checkout Configuration</CardTitle>
            <CardDescription>Configure your Easy Checkout service by connecting to your SQLite database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Connection Section */}
              <div className={!connection.editing ? "opacity-50" : ""}>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useLocalFile"
                    checked={connection.isLocal}
                    onChange={(e) => updateConnectionState('isLocal', e.target.checked)}
                    disabled={!connection.editing}
                    aria-label="Use local SQLite file"
                  />
                  <Label htmlFor="useLocalFile">Upload local SQLite file</Label>
                </div>
                
                {connection.isLocal ? (
                  <div>
                    <Label htmlFor="sqliteFile">Select SQLite File</Label>
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
                    <Label htmlFor="connectionString">SQLite File Path</Label>
                    <div className="flex space-x-2 mt-1.5">
                      <Input 
                        id="connectionString"
                        placeholder="Enter path to SQLite file (e.g., /path/to/database.db)"
                        value={connection.string}
                        onChange={(e) => updateConnectionState('string', e.target.value)}
                        disabled={!connection.editing}
                      />
                    </div>
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
              <div className={!connection.connected || !connection.editing ? "opacity-50 pointer-events-none" : ""}>
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-3">Table Configuration</h4>
                  <div className="space-y-4">
                    {Object.keys(serviceConfig.tables).map(tableType => (
                      <div key={tableType} className="space-y-3">
                        <h5 className="font-medium capitalize text-sm">{tableType.replace('_', ' ')} Table</h5>
                        <div>
                          <Label htmlFor={`${tableType}_table`}>Select {tableType.replace('_', ' ')} Table</Label>
                          <Select 
                            disabled={!connection.connected || !connection.editing}
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
                                    disabled={!connection.connected || !selectedTable[tableType] || !connection.editing}
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
              
              {/* Submit and Save Buttons - Bottom Right */}
              {connection.connected && connection.editing && (
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={submitServiceConfiguration}
                    className="bg-primary text-white"
                  >
                    Submit Configuration
                  </Button>
                  <Button 
                    onClick={saveConfiguration}
                    className="bg-green-600 text-white"
                    disabled={connection.saving}
                  >
                    {connection.saving ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              )}
              
              {connection.connected && !connection.editing && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Configuration Saved</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This service is configured and ready to use. Click the edit button to modify settings.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
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