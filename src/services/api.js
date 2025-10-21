const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  removeToken() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
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

  // ========== AUTH METHODS ==========
  async register(userData) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    
    if (result.data && result.data.token) {
      this.setToken(result.data.token);
      this.setCurrentUser(result.data.user);
    }
    
    return result;
  }

  async login(credentials) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (result.data && result.data.token) {
      this.setToken(result.data.token);
      this.setCurrentUser(result.data.user);
    }
    
    return result;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: passwordData,
    });
  }

  // ========== JOB METHODS ==========
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

  async getEmployerJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/jobs/employer/my-jobs?${queryString}`);
  }

  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: jobData,
    });
  }

  async updateJob(id, jobData) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: jobData,
    });
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== APPLICATION METHODS ==========
  async applyForJob(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: applicationData,
    });
  }

  async getMyApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/applications/student/my-applications?${queryString}`);
  }

  async getEmployerApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/applications/employer/job-applications?${queryString}`);
  }

  async updateApplicationStatus(applicationId, statusData) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: statusData,
    });
  }

  async getApplicationStatistics() {
    return this.request('/applications/employer/statistics');
  }

  async withdrawApplication(applicationId) {
    return this.request(`/applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  // ========== USER METHODS ==========
  async getUserProfile(userId = null) {
    const endpoint = userId ? `/users/profile/${userId}` : '/users/profile';
    return this.request(endpoint);
  }

  async uploadAvatar(formData) {
    // Note: This requires special handling for file upload
    const url = `${API_BASE_URL}/users/upload-avatar`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    };

    const response = await fetch(url, config);
    return response.json();
  }

  async uploadResume(formData) {
    const url = `${API_BASE_URL}/users/upload-resume`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    };

    const response = await fetch(url, config);
    return response.json();
  }

  async getSavedJobs() {
    return this.request('/users/saved-jobs');
  }

  async saveJob(jobId) {
    return this.request(`/users/saved-jobs/${jobId}`, {
      method: 'POST',
    });
  }

  async removeSavedJob(jobId) {
    return this.request(`/users/saved-jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  async getRecommendedJobs() {
    return this.request('/users/recommended-jobs');
  }

  // ========== COMPANY METHODS ==========
  async getCompanyProfile(companyId) {
    return this.request(`/companies/${companyId}`);
  }

  async updateCompanyProfile(companyId, companyData) {
    return this.request(`/companies/${companyId}`, {
      method: 'PUT',
      body: companyData,
    });
  }

  // ========== UTILITY METHODS ==========
  async healthCheck() {
    return this.request('/health');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Check if user is employer
  isEmployer() {
    return this.currentUser?.userType === 'employer';
  }

  // Check if user is student
  isStudent() {
    return this.currentUser?.userType === 'student';
  }

  // Get current user data
  getCurrentUserData() {
    return this.currentUser;
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;