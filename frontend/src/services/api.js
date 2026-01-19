import axios from 'axios';

// Get API URL from envir onment variable or use localhost as fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
export { API_URL };
