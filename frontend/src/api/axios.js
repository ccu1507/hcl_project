import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tbbd2kigze.ap-south-1.awsapprunner.com/api',
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    // If we have token in localStorage, we can use it or use Zustand authStore
    // Using localStorage directly here avoids circular dependency with zustand
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const { token } = state;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing token from localStorage', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
