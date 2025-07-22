
export interface Service {
    service_id: string;
    service_name: string;
    service_type: string;
    configuration: any; // Adjust type as needed
    operation?: 'add' | 'update' | 'delete';
}
