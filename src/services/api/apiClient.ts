import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

// Base URL for the backend API
export const BASE_URL = 'http://10.96.195.22:4000/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Custom Error Class
export class ApiError extends Error {
    public statusCode?: number;
    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const { token } = useAuthStore.getState();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized & Normalize Errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            if (error.response.status === 401) {
                const { logout } = useAuthStore.getState();
                logout();
            }
            // Extract error message
            const data = error.response.data as any;
            const message = data?.message || error.message || 'An error occurred';
            return Promise.reject(new ApiError(message, error.response.status));
        }
        return Promise.reject(new ApiError(error.message || 'Network Error'));
    }
);

export default apiClient;
