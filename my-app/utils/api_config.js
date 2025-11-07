// API Configuration
export const API_CONFIG = {
  // Render hosted backend URL
  BASE_URL: 'https://super30-backendnew.onrender.com',
  
  // API endpoints
  ENDPOINTS: {
    PROCESS_TEXT: '/process-text'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default request headers
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Helper function to make API calls with better error handling
export const apiCall = async (endpoint, data = {}, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers
      },
      body: JSON.stringify(data),
      signal: controller.signal,
      ...options
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return { success: true, data: result };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Request timed out. Please check your network connection.' 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
};