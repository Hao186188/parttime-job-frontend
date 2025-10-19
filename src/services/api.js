const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // Convert body to JSON if it exists and is an object
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (result.data && result.data.token) {
      this.setToken(result.data.token);
    }
    
    return result;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Job methods
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/jobs?${queryString}`);
  }

  async getJob(id) {
    return this.request(`/jobs/${id}`);
  }

  async getFeaturedJobs() {
    return this.request('/jobs/featured');
  }

  // Application methods
  async applyForJob(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: applicationData,
    });
  }

  async getMyApplications() {
    return this.request('/applications/student/my-applications');
  }

  // User methods
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async getSavedJobs() {
    return this.request('/users/saved-jobs');
  }

  async saveJob(jobId) {
    return this.request(`/users/saved-jobs/${jobId}`, {
      method: 'POST',
    });
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;