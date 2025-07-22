import { BASE_URL, getHeaders } from "@/config/api-config";
import { Service } from "./types";

// API to load domains
export const loadDomains = async () => {
    const headers = await getHeaders();
    try {
        const response = await fetch(`${BASE_URL}/domains`, {
            method: 'GET',
            headers,
        });

        console.log("Response from loadDomains: ", response);

        if (!response.ok) {
            throw new Error(`Error fetching domains: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Domains fetched successfully: ", data);
        return data;
    } catch (error) {
        console.error("Error fetching domains:", error);
        throw error; // Re-throw to handle it in the calling function
    }
}

// API to list all businesses
export const listBusinesses = async () => {

    const headers = await getHeaders();
    try {
        const response = await fetch(`${BASE_URL}/my-businesses`, {
            method: 'GET',
            headers,
        });

        console.log("Response from listBusinesses: ", response);

        if (!response.ok) {
            throw new Error(`Error fetching businesses: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Businesses fetched successfully: ", data);
        return data;
    } catch (error) {
        console.error("Error fetching businesses:", error);
        throw error; // Re-throw to handle it in the calling function
    }
}

// API to create a new business
export const createBusiness = async (business: {
    business_name: string;
    domain_id: string;
    domain_name: string;
    address: string;
    email: string;
    phone: string;
}) => {
    const headers = await getHeaders();

    try {
        const response = await fetch(`${BASE_URL}/businesses`, {
            method: 'POST',
            headers,
            body: JSON.stringify(business),
        });

        console.log("Response from createBusiness: ", response);

        if (!response.ok) {
            throw new Error(`Error creating business: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Business created successfully: ", data);
        return data;
    } catch (error) {
        console.error("Error creating business:", error);
    }
}

// List all services
export const listAllServices = async () => {
    const headers = await getHeaders(); 

    try {
        const response = await fetch(`${BASE_URL}/services`, {
            method: 'GET',
            headers,
        });

        console.log("Response from listAllServices: ", response);

        if (!response.ok) {
            throw new Error(`Error fetching all services: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("All services fetched successfully: ", data);
        return data;
    } catch (error) {
        console.error("Error fetching all services:", error);
        throw error; // Re-throw to handle it in the calling function
    }
}

// List all services for a business
export const listServices = async (businessId: string) => {
    const headers = await getHeaders();

    try {
        const response = await fetch(`${BASE_URL}/businesses/${businessId}/services`, {
            method: 'GET',
            headers,
        });

        console.log("Response from listServices: ", response);

        if (!response.ok) {
            throw new Error(`Error fetching services: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Services fetched successfully: ", data);
        return data;
    } catch (error) {
        console.error("Error fetching services:", error);
        throw error; // Re-throw to handle it in the calling function
    }
}

// Add a new service for a business
export const addService = async (businessId: string, service: Service) => {
    const headers = await getHeaders();
    console.log("Business ID: ", businessId);
    try {
        const response = await fetch(`${BASE_URL}/businesses/${businessId}/services`, {
            method: 'POST',
            headers,
            body: JSON.stringify(service),
        });

        console.log("Response from createService: ", response);

        if (!response.ok) {
            throw new Error(`Error creating service: ${response.statusText}`);
        }

        return true
    } catch (error) {
        console.error("Error creating service:", error);
    }
}