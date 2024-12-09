import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:3000';

// Add request interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
