// API Configuration
export const BASE_URL = 'http://127.0.0.1:8087';
export const BASE_URL_Retail = 'http://127.0.0.1:8091';

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