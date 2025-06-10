

// Function to validate a phobe number. 
// Phone nummber should be 10 digits long
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phoneNumber);
};
