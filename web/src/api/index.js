import axios from 'axios';

// Get API URL from env or default to something reasonable (can be overridden by proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://prepedo.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors (like 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear storage and redirect to login if token expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; // Optional: Force redirect
        }
        return Promise.reject(error);
    }
);

export default api;
