const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Check if we should use mock API (when no backend URL is set)
const USE_MOCK_API = false; // Disable mock API for production

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
  async get(endpoint, params = {}, customHeaders = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
      headers: customHeaders,
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

// Import mock API if needed
let mockMartyrsApi, mockAuthApi, mockAdminApi;
if (USE_MOCK_API) {
  const mockApi = require('./mockApi');
  mockMartyrsApi = mockApi.mockMartyrsApi;
  mockAuthApi = mockApi.mockAuthApi;
  mockAdminApi = mockApi.mockAdminApi;
}

// Martyrs API methods
export const martyrsApi = {
  // Get all martyrs with pagination and filters
  getAll: (params = {}) => {
    if (USE_MOCK_API) return mockMartyrsApi.getAll(params);
    const api = new ApiService();
    return api.get('/martyrs', params);
  },

  // Get a specific martyr by ID
  getById: (id) => {
    if (USE_MOCK_API) return mockMartyrsApi.getById(id);
    const api = new ApiService();
    return api.get(`/martyrs/${id}`);
  },

  // Get statistics
  getStats: () => {
    if (USE_MOCK_API) return mockMartyrsApi.getStats();
    const api = new ApiService();
    return api.get('/martyrs/stats/summary');
  },

  // Add a new martyr (public endpoint)
  addPublic: (formData) => {
    if (USE_MOCK_API) return mockMartyrsApi.addPublic(formData);
    const api = new ApiService();
    return api.postFormData('/martyrs/public', formData);
  },

  // Add a new martyr (admin endpoint)
  add: (formData) => {
    if (USE_MOCK_API) return mockMartyrsApi.add(formData);
    const api = new ApiService();
    return api.postFormData('/martyrs', formData);
  },

  // Update a martyr
  update: (id, formData) => {
    if (USE_MOCK_API) return mockMartyrsApi.update(id, formData);
    const api = new ApiService();
    return api.postFormData(`/martyrs/${id}`, formData);
  },

  // Delete a martyr
  delete: (id) => {
    if (USE_MOCK_API) return mockMartyrsApi.delete(id);
    const api = new ApiService();
    return api.delete(`/martyrs/${id}`);
  },

  // Get all martyrs for admin (including unapproved)
  getAllForAdmin: (params = {}) => {
    if (USE_MOCK_API) return mockMartyrsApi.getAllForAdmin(params);
    const api = new ApiService();
    return api.get('/martyrs/admin/all', params);
  },

  // Approve/unapprove a martyr
  approve: (id, approved) => {
    if (USE_MOCK_API) return mockMartyrsApi.approve(id, approved);
    const api = new ApiService();
    return api.request(`/martyrs/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved })
    });
  },
};

// Auth API methods
export const authApi = {
  login: (credentials) => {
    if (USE_MOCK_API) return mockAuthApi.login(credentials);
    const api = new ApiService();
    return api.post('/auth/login', credentials);
  },
};

// Admin API methods
export const adminApi = {
  getAllMartyrs: (params = {}, token) => {
    if (USE_MOCK_API) return mockAdminApi.getAllMartyrs(params, token);
    const api = new ApiService();
    return api.get('/martyrs/admin/all', params, { 'Authorization': `Bearer ${token}` });
  },
  
  approveMartyr: (id, approved, token) => {
    if (USE_MOCK_API) return mockAdminApi.approveMartyr(id, approved, token);
    const api = new ApiService();
    return api.request(`/martyrs/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ approved })
    });
  },
  
  deleteMartyr: (id, token) => {
    if (USE_MOCK_API) return mockAdminApi.deleteMartyr(id, token);
    const api = new ApiService();
    return api.request(`/martyrs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  
  getMartyrById: (id, token) => {
    if (USE_MOCK_API) return mockAdminApi.getMartyrById(id, token);
    const api = new ApiService();
    return api.get(`/martyrs/${id}`, {}, { 'Authorization': `Bearer ${token}` });
  },
  
  updateMartyr: (id, formData, token) => {
    if (USE_MOCK_API) return mockAdminApi.updateMartyr(id, formData, token);
    const api = new ApiService();
    return api.request(`/martyrs/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  }
};

// Health check
export const healthApi = {
  check: () => {
    const api = new ApiService();
    return api.get('/health');
  },
};

export default ApiService;
