import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Edit3 } from "lucide-react";
import initSqlJs, { Database } from "sql.js";
import { PageLayout } from "../common/PageLayout";

export function ServiceConfigurationWizard() {
  const [connections, setConnections] = useState({
    item_locator: { string: "", isLocal: false, connected: false, loading: false, editing: true, file: null },
    easy_checkout: { string: "", isLocal: false, connected: false, loading: false, editing: true, file: null },
    catalog: { string: "", isLocal: false, connected: false, loading: false, editing: true, file: null },
    recruitment: { string: "", isLocal: false, connected: false, loading: false, editing: true, file: null }
  });
  
  const [databases, setDatabases] = useState({
    item_locator: null,
    easy_checkout: null,
    catalog: null,
    recruitment: null
  });
  
  const [tables, setTables] = useState({
    item_locator: [],
    easy_checkout: [],
    catalog: [],
    recruitment: []
  });
  
  const [columns, setColumns] = useState({
    item_locator: [],
    easy_checkout: [],
    catalog: [],
    recruitment: []
  });
  
  const [selectedTables, setSelectedTables] = useState({
    item_locator: { products: "" },
    easy_checkout: { products: "", cart_items: "", bills: "", bill_items: "" },
    catalog: { products: "", cart_items: "", bills: "", bill_items: "" },
    recruitment: { jobs: "" }
  });
  
  const [fieldMappings, setFieldMappings] = useState({
    item_locator: { products: {} },
    easy_checkout: { products: {}, cart_items: {}, bills: {}, bill_items: {} },
    catalog: { products: {}, cart_items: {}, bills: {}, bill_items: {} },
    recruitment: { jobs: {} }
  });
  
  const [expandedSections, setExpandedSections] = useState({
    item_locator: true,
    easy_checkout: false,
    catalog: false,
    recruitment: false
  });
  
  const [notifications, setNotifications] = useState([]);
  
  const showNotification = (title, description, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  
  const serviceConfigs = {
    item_locator: {
      title: "Item Locator",
      tables: {
        products: {
          fields: ["item_id", "item_name", "categories", "description", "price", "quantity", "image_path", "location"]
        }
      }
    },
    easy_checkout: {
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
    },
    catalog: {
      title: "Catalog",
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
    },
    recruitment: {
      title: "Recruitment",
      tables: {
        jobs: {
          fields: ["job_id", "job_title", "job_description"]
        }
      }
    }
  };
  
  // Load SQLite file and initialize database connection
  const loadSQLiteFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Initialize SQL.js
      const SQL = await initSqlJs({
        // Specify the path to the sql-wasm.wasm file
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
  const testConnection = async (serviceName) => {
    const connection = connections[serviceName];
    
    if (!connection.string && !connection.file) {
      showNotification(
        "Error",
        `Please enter a file path or select a local file for ${serviceConfigs[serviceName].title}`,
        "error"
      );
      return;
    }
    
    setConnections(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], loading: true }
    }));
    
    showNotification(
      "Testing connection...",
      `Please wait while we test the connection for ${serviceConfigs[serviceName].title}`,
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
          const fileData = await window.fs.readFile(connection.string);
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
      setDatabases(prev => ({ ...prev, [serviceName]: dbResult.db }));
      setTables(prev => ({ ...prev, [serviceName]: dbResult.tables }));
      
      setConnections(prev => ({
        ...prev,
        [serviceName]: { ...prev[serviceName], connected: true, loading: false }
      }));
      
      showNotification(
        "Connection successful",
        `Connected to SQLite file for ${serviceConfigs[serviceName].title} with ${dbResult.tables.length} tables`,
        "success"
      );
    } catch (error) {
      console.error('Connection test failed:', error);
      showNotification(
        "Connection failed",
        error.message || `Failed to connect to the database for ${serviceConfigs[serviceName].title}`,
        "error"
      );
      setTables(prev => ({ ...prev, [serviceName]: [] }));
      setDatabases(prev => ({ ...prev, [serviceName]: null }));
      setConnections(prev => ({
        ...prev,
        [serviceName]: { ...prev[serviceName], connected: false, loading: false }
      }));
    }
  };
  
  // Get columns for a specific table
  const getTableColumns = async (serviceName, tableName) => {
    try {
      const db = databases[serviceName];
      if (!db) {
        throw new Error("Database not connected");
      }
      
      // Get table info using PRAGMA table_info
      const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
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
  const handleTableSelection = async (serviceName, tableType, tableValue) => {
    setSelectedTables(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], [tableType]: tableValue }
    }));
    
    if (!tableValue) {
      setColumns(prev => ({ ...prev, [serviceName]: [] }));
      return;
    }
    
    try {
      showNotification(
        "Loading columns...",
        `Fetching columns for table: ${tableValue}`,
        "info"
      );
      
      const tableColumns = await getTableColumns(serviceName, tableValue);
      setColumns(prev => ({ ...prev, [serviceName]: tableColumns }));
      
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
      setColumns(prev => ({ ...prev, [serviceName]: [] }));
    }
  };
  
  const handleFieldMapping = (serviceName, tableType, fieldName, columnName) => {
    setFieldMappings(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        [tableType]: {
          ...prev[serviceName][tableType],
          [fieldName]: columnName
        }
      }
    }));
  };
  
  const updateConnectionState = (serviceName, field, value) => {
    setConnections(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], [field]: value }
    }));
  };
  
  const handleFileSelection = (serviceName, event) => {
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
      
      setConnections(prev => ({
        ...prev,
        [serviceName]: { ...prev[serviceName], file: file }
      }));
    }
  };
  
  const toggleSection = (serviceName) => {
    setExpandedSections(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };
  
  const toggleEdit = (serviceName) => {
    setConnections(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], editing: !prev[serviceName].editing }
    }));
  };
  
  const submitServiceConfiguration = (serviceName) => {
    // Validate that all required fields are mapped
    const requiredTables = Object.keys(serviceConfigs[serviceName].tables);
    const configuredTables = Object.keys(selectedTables[serviceName]).filter(
      tableType => selectedTables[serviceName][tableType]
    );
    
    if (configuredTables.length === 0) {
      showNotification(
        "Error",
        `Please configure at least one table for ${serviceConfigs[serviceName].title}`,
        "error"
      );
      return;
    }
    
    // Check if all required fields for configured tables are mapped
    let allFieldsMapped = true;
    configuredTables.forEach(tableType => {
      const requiredFields = serviceConfigs[serviceName].tables[tableType].fields;
      const mappedFields = Object.keys(fieldMappings[serviceName][tableType]).filter(
        field => fieldMappings[serviceName][tableType][field]
      );
      
      if (mappedFields.length !== requiredFields.length) {
        allFieldsMapped = false;
      }
    });
    
    if (!allFieldsMapped) {
      showNotification(
        "Warning",
        `Some fields are not mapped for ${serviceConfigs[serviceName].title}. Please complete all field mappings.`,
        "error"
      );
      return;
    }
    
    // Generate configuration for this service
    const serviceConfig = {
      DB_CONNECTION: connections[serviceName].isLocal 
        ? `local_file:${connections[serviceName].file?.name || 'uploaded_file'}`
        : connections[serviceName].string,
      TABLE_MAPPING: {}
    };
    
    configuredTables.forEach(tableType => {
      const tableName = selectedTables[serviceName][tableType];
      serviceConfig.TABLE_MAPPING[`${tableType}_table`] = {
        name: tableName,
        fields: fieldMappings[serviceName][tableType]
      };
    });
    
    console.log(`${serviceName} Configuration:`, serviceConfig);
    
    // Set editing to false for this service
    setConnections(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], editing: false }
    }));
    
    showNotification(
      "Configuration saved",
      `${serviceConfigs[serviceName].title} configuration has been saved successfully`,
      "success"
    );
  };

  const renderServiceSection = (serviceName) => {
    const service = serviceConfigs[serviceName];
    const connection = connections[serviceName];
    const serviceExpanded = expandedSections[serviceName];
    
    return (
      <div key={serviceName} className="border rounded-md mb-4">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection(serviceName)}
        >
          <h3 className="text-lg font-medium">{service.title}</h3>
          <div className="flex items-center space-x-2">
            {connection.connected && !connection.editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEdit(serviceName);
                }}
                className="p-1 h-8 w-8"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            <span>{serviceExpanded ? '▼' : '►'}</span>
          </div>
        </div>
        
        {serviceExpanded && (
          <div className="p-4 border-t">
            <div className="space-y-4">
              {/* Connection Section */}
              <div className={!connection.editing ? "opacity-50" : ""}>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`useLocalFile_${serviceName}`}
                    checked={connection.isLocal}
                    onChange={(e) => updateConnectionState(serviceName, 'isLocal', e.target.checked)}
                    disabled={!connection.editing}
                    aria-label={`Use local SQLite file for ${service.title}`}
                  />
                  <Label htmlFor={`useLocalFile_${serviceName}`}>Upload local SQLite file</Label>
                </div>
                
                {connection.isLocal ? (
                  <div>
                    <Label htmlFor={`sqliteFile_${serviceName}`}>Select SQLite File</Label>
                    <Input 
                      id={`sqliteFile_${serviceName}`}
                      type="file"
                      accept=".sqlite,.db,.sqlite3"
                      disabled={!connection.editing}
                      onChange={(e) => handleFileSelection(serviceName, e)}
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
                    <Label htmlFor={`connectionString_${serviceName}`}>SQLite File Path</Label>
                    <div className="flex space-x-2 mt-1.5">
                      <Input 
                        id={`connectionString_${serviceName}`}
                        placeholder={`Enter path to SQLite file (e.g., /path/to/database.db)`}
                        value={connection.string}
                        onChange={(e) => updateConnectionState(serviceName, 'string', e.target.value)}
                        disabled={!connection.editing}
                      />
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => testConnection(serviceName)} 
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
                    <span className="text-green-600 font-medium">Connected - {tables[serviceName].length} tables found</span>
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
                  <h4 className="font-medium mb-3">{service.title} Table Configuration</h4>
                  <div className="space-y-4">
                    {Object.keys(service.tables).map(tableType => (
                      <div key={tableType} className="space-y-3">
                        <h5 className="font-medium capitalize text-sm">{tableType.replace('_', ' ')} Table</h5>
                        <div>
                          <Label htmlFor={`${serviceName}_${tableType}_table`}>Select {tableType.replace('_', ' ')} Table</Label>
                          <Select 
                            disabled={!connection.connected || !connection.editing}
                            onValueChange={(value) => handleTableSelection(serviceName, tableType, value)}
                            value={selectedTables[serviceName][tableType] || ""}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder={`Select ${tableType} table`} />
                            </SelectTrigger>
                            <SelectContent>
                              {tables[serviceName].map((table) => (
                                <SelectItem key={table} value={table}>{table}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedTables[serviceName][tableType] && (
                          <div>
                            <Label>Field Mapping for {tableType}</Label>
                            <div className="grid grid-cols-2 gap-3 mt-1.5">
                              {service.tables[tableType].fields.map((field) => (
                                <div key={field}>
                                  <Label htmlFor={`${serviceName}_${tableType}_${field}`} className="text-xs">
                                    {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Label>
                                  <Select 
                                    disabled={!connection.connected || !selectedTables[serviceName][tableType] || !connection.editing}
                                    onValueChange={(value) => handleFieldMapping(serviceName, tableType, field, value)}
                                    value={fieldMappings[serviceName][tableType][field] || ""}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {columns[serviceName].map((column) => (
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
              
              {/* Submit Button - Bottom Right */}
              {connection.connected && connection.editing && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => submitServiceConfiguration(serviceName)}
                    className="bg-primary text-white"
                  >
                    Submit Configuration
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
          </div>
        )}
      </div>
    );
  };

  return (
    <PageLayout title="Add New Service">
    <div className="relative">
      <Card>
        <CardHeader>
          <CardTitle>Service Configuration</CardTitle>
          <CardDescription>Configure your AALAI services by connecting to your SQLite database</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {Object.keys(serviceConfigs).map(serviceName => renderServiceSection(serviceName))}
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