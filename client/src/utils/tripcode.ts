// Simple tripcode generation function
export const generateTripcode = (password: string): string => {
  if (!password) return "";
  
  // Simple hash function (not cryptographically secure, just for demo)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).slice(0, 8).toUpperCase();
};

// Parse name field for name and tripcode
export const parseNameField = (nameField: string): { name: string; tripcode: string | null } => {
  if (!nameField.includes('#')) {
    return { name: nameField || "Anonymous", tripcode: null };
  }
  
  const [name, password] = nameField.split('#', 2);
  return {
    name: name || "Anonymous",
    tripcode: password ? generateTripcode(password) : null
  };
};