// API Configuration
export const BASE_URL = 'http://127.0.0.1:8087';
export const TestConnection_URL = 'http://127.0.0.1:5000';
export const BASE_URL_Retail = 'http://127.0.0.1:8091';
export const BASE_URL_Bank = 'http://127.0.0.1:8093';
export const BASE_URL_Salon = 'http://127.0.0.1:8094';
export const BASE_URL_Religious = 'http://127.0.0.1:8092';
export const BASE_URL_Hospital = 'http://127.0.0.1:8095';


// Function to get user data from localStorage
export const getUserData = () => {
  const userString = localStorage.getItem("aalaiUser");
  return userString ? JSON.parse(userString) : null;
};

// Function to get businesses data from localStorage
export const getBusinessesData = () => {
  const savedBusinesses = localStorage.getItem("aalaiBusinesses");
  return savedBusinesses ? JSON.parse(savedBusinesses) : [];
};

// Function to set businesses data to localStorage
export const setBusinessesData = (businesses) => {
  localStorage.setItem("aalaiBusinesses", JSON.stringify(businesses));
};

// Function to set businesses id to localStorage
export const setSelectedBusinesses = (id) => {
  localStorage.setItem("aalaiSelectedBusiness", id);
};

// Function to get businesses data from localStorage
export const getSelectedBusinesses = () => {
  const savedBusiness = localStorage.getItem("aalaiSelectedBusiness");
  return savedBusiness || null;
};

// Function to get complete selected business data
export const getSelectedBusinessData = () => {
  const selectedBusinessId = getSelectedBusinesses();
  const businesses = getBusinessesData();
  
  if (!selectedBusinessId || !businesses || businesses.length === 0) {
    return null;
  }

  return businesses.find(business => business.id === selectedBusinessId) || null;
};

// Function to get base URL based on business category
export const getBaseUrlByCategory = (): string => {
  const selectedBusiness = getSelectedBusinessData();
  const businessCategory = selectedBusiness?.category?.toLowerCase();

  switch (businessCategory) {
    case 'bank':
      return BASE_URL_Bank;
    case 'retail':
      return BASE_URL_Retail;
    case 'salon':
      return BASE_URL_Salon;
    case 'religious':
      return BASE_URL_Religious;
    case 'hospital':
      return BASE_URL_Hospital;
    default:
      return BASE_URL; // Return default base URL if category doesn't match
  }
};