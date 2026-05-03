// api/client.ts
import axios from 'axios';

// Gunakan import.meta.env untuk Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

// Request interceptor untuk menambahkan token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request di development (gunakan import.meta.env)
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params);
        }
        
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor
client.interceptors.response.use(
    (response) => {
        // Log response di development
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.url}`, response.status);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Handle refresh token logic
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken: refreshToken
                    });
                    
                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);
                    
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }
        
        // Log error
        if (error.response) {
            console.error('[API Error]', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        } else if (error.request) {
            console.error('[API Error] No response received:', error.request);
        } else {
            console.error('[API Error]', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default client;