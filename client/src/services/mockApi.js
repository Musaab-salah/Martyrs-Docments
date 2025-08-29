// Mock API service for development and testing
// This provides a working backend simulation until you deploy a real backend

const mockMartyrs = [
  {
    id: 1,
    name_ar: "أحمد محمد علي",
    name_en: "Ahmed Mohamed Ali",
    date_of_martyrdom: "2024-01-15",
    place_of_martyrdom: JSON.stringify({ state: "غزة", area: "مدينة غزة" }),
    education_level: "university",
    university_name: "جامعة الأزهر",
    faculty: "كلية الطب",
    department: "طب عام",
    occupation: "طالب طب",
    bio: "شهيد من غزة، كان طالباً في كلية الطب بجامعة الأزهر. كان يحلم بمساعدة الناس وعلاج المرضى.",
    image_url: "/default.png",
    approved: true
  },
  {
    id: 2,
    name_ar: "فاطمة أحمد",
    name_en: "Fatima Ahmed",
    date_of_martyrdom: "2024-02-20",
    place_of_martyrdom: JSON.stringify({ state: "الخرطوم", area: "أم درمان" }),
    education_level: "secondary",
    occupation: "معلمة",
    bio: "معلمة في مدرسة ابتدائية، كانت تحب الأطفال وتسعى لتعليمهم.",
    image_url: "/default.png",
    approved: true
  },
  {
    id: 3,
    name_ar: "محمد حسن",
    name_en: "Mohamed Hassan",
    date_of_martyrdom: "2024-03-10",
    place_of_martyrdom: JSON.stringify({ state: "الجزيرة", area: "ود مدني" }),
    education_level: "primary",
    occupation: "فلاح",
    bio: "فلاح بسيط كان يعمل في الأرض ليربي أسرته.",
    image_url: "/default.png",
    approved: false
  }
];

class MockApiService {
  constructor() {
    this.baseURL = '';
    this.martyrs = [...mockMartyrs];
    this.nextId = 4;
  }

  // Simulate network delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method
  async request(endpoint, options = {}) {
    await this.delay();
    
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    
    console.log(`Mock API: ${method} ${url}`, options.body ? JSON.parse(options.body) : '');

    // Handle different endpoints
    switch (endpoint) {
      case '/api/martyrs':
        if (method === 'GET') {
          return {
            martyrs: this.martyrs.filter(m => m.approved),
            pagination: {
              totalPages: 1,
              currentPage: 1,
              totalItems: this.martyrs.filter(m => m.approved).length
            }
          };
        }
        break;

      case '/api/martyrs/public':
        if (method === 'POST') {
          const formData = options.body;
          const newMartyr = {
            id: this.nextId++,
            name_ar: formData.get('name_ar') || '',
            name_en: formData.get('name_en') || '',
            date_of_martyrdom: formData.get('date_of_martyrdom') || '',
            place_of_martyrdom: formData.get('place_of_martyrdom') || '',
            education_level: formData.get('education_level') || '',
            university_name: formData.get('university_name') || '',
            faculty: formData.get('faculty') || '',
            department: formData.get('department') || '',
            school_state: formData.get('school_state') || '',
            school_locality: formData.get('school_locality') || '',
            spouse: formData.get('spouse') || '',
            children: formData.get('children') || '',
            occupation: formData.get('occupation') || '',
            bio: formData.get('bio') || '',
            image_url: '/default.png',
            approved: false
          };
          this.martyrs.push(newMartyr);
          return { message: 'تم إضافة الشهيد بنجاح' };
        }
        break;

      case '/api/auth/login':
        if (method === 'POST') {
          const credentials = JSON.parse(options.body);
          if (credentials.username === 'sudansust' && credentials.password === 'sust@1989') {
            return {
              token: 'mock-jwt-token-12345',
              message: 'Login successful'
            };
          } else {
            throw new Error('Invalid credentials');
          }
        }
        break;

      case '/api/martyrs/admin/all':
        if (method === 'GET') {
          return {
            martyrs: this.martyrs,
            pagination: {
              totalPages: 1,
              currentPage: 1,
              totalItems: this.martyrs.length
            }
          };
        }
        break;

      default:
        // Handle individual martyr endpoints
        if (endpoint.match(/^\/api\/martyrs\/\d+$/)) {
          const id = parseInt(endpoint.split('/').pop());
          const martyr = this.martyrs.find(m => m.id === id);
          
          if (method === 'GET') {
            if (!martyr) throw new Error('Martyr not found');
            return { martyr };
          } else if (method === 'PUT') {
            if (!martyr) throw new Error('Martyr not found');
            // Update martyr logic here
            return { message: 'تم تحديث الشهيد بنجاح' };
          } else if (method === 'DELETE') {
            if (!martyr) throw new Error('Martyr not found');
            this.martyrs = this.martyrs.filter(m => m.id !== id);
            return { message: 'تم حذف الشهيد بنجاح' };
          }
        }

        // Handle approve endpoint
        if (endpoint.match(/^\/api\/martyrs\/\d+\/approve$/)) {
          const id = parseInt(endpoint.split('/')[3]);
          const martyr = this.martyrs.find(m => m.id === id);
          if (!martyr) throw new Error('Martyr not found');
          
          const { approved } = JSON.parse(options.body);
          martyr.approved = approved;
          return { message: 'تم تحديث حالة الموافقة' };
        }
        break;
    }

    throw new Error('Endpoint not found');
  }

  // GET request
  async get(endpoint, params = {}, customHeaders = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
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
    return this.request(endpoint, { method: 'DELETE' });
  }

  // POST with FormData
  async postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// Export mock API methods
export const mockMartyrsApi = {
  getAll: (params = {}) => {
    const api = new MockApiService();
    return api.get('/api/martyrs', params);
  },

  getById: (id) => {
    const api = new MockApiService();
    return api.get(`/api/martyrs/${id}`);
  },

  getStats: () => {
    const api = new MockApiService();
    return api.get('/api/martyrs/stats/summary');
  },

  addPublic: (formData) => {
    const api = new MockApiService();
    return api.postFormData('/api/martyrs/public', formData);
  },

  add: (formData) => {
    const api = new MockApiService();
    return api.postFormData('/api/martyrs', formData);
  },

  update: (id, formData) => {
    const api = new MockApiService();
    return api.postFormData(`/api/martyrs/${id}`, formData);
  },

  delete: (id) => {
    const api = new MockApiService();
    return api.delete(`/api/martyrs/${id}`);
  },

  getAllForAdmin: (params = {}) => {
    const api = new MockApiService();
    return api.get('/api/martyrs/admin/all', params);
  },

  approve: (id, approved) => {
    const api = new MockApiService();
    return api.request(`/api/martyrs/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved })
    });
  },
};

export const mockAuthApi = {
  login: (credentials) => {
    const api = new MockApiService();
    return api.post('/api/auth/login', credentials);
  },
};

export const mockAdminApi = {
  getAllMartyrs: (params = {}, token) => {
    const api = new MockApiService();
    return api.get('/api/martyrs/admin/all', params);
  },
  
  approveMartyr: (id, approved, token) => {
    const api = new MockApiService();
    return api.request(`/api/martyrs/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved })
    });
  },
  
  deleteMartyr: (id, token) => {
    const api = new MockApiService();
    return api.delete(`/api/martyrs/${id}`);
  },
  
  getMartyrById: (id, token) => {
    const api = new MockApiService();
    return api.get(`/api/martyrs/${id}`);
  },
  
  updateMartyr: (id, formData, token) => {
    const api = new MockApiService();
    return api.request(`/api/martyrs/${id}`, {
      method: 'PUT',
      body: formData
    });
  }
};

export default MockApiService;
