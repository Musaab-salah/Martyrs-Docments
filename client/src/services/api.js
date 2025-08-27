const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // POST with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Martyrs API methods
export const martyrsApi = {
  // Get all martyrs with pagination and filters
  getAll: (params = {}) => {
    const api = new ApiService();
    return api.get('/martyrs', params);
  },

  // Get a specific martyr by ID
  getById: (id) => {
    const api = new ApiService();
    return api.get(`/martyrs/${id}`);
  },

  // Get statistics
  getStats: () => {
    const api = new ApiService();
    return api.get('/martyrs/stats/summary');
  },

  // Add a new martyr (public endpoint)
  addPublic: (formData) => {
    const api = new ApiService();
    return api.postFormData('/martyrs/public', formData);
  },

  // Add a new martyr (admin endpoint)
  add: (formData) => {
    const api = new ApiService();
    return api.postFormData('/martyrs', formData);
  },

  // Update a martyr
  update: (id, formData) => {
    const api = new ApiService();
    return api.postFormData(`/martyrs/${id}`, formData);
  },

  // Delete a martyr
  delete: (id) => {
    const api = new ApiService();
    return api.delete(`/martyrs/${id}`);
  },
};

// Health check
export const healthApi = {
  check: () => {
    const api = new ApiService();
    return api.get('/health');
  },
};

export default ApiService;
