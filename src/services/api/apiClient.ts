/**
 * API Client Configuration
 * 
 * Axios instance with JWT authentication and error handling
 * for the Aaharly Delivery Partner app.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Configuration
// ============================================================================

/** Backend API base URL - update for production */
// Using 10.0.2.2 for Android Emulator to access localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api/v1';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT = 15000;

// ============================================================================
// Token Management
// ============================================================================

const TOKEN_KEY = '@aaharly_vendor_token';

/**
 * Get the current authentication token from storage.
 */
export const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

// ============================================================================
// Axios Instance
// ============================================================================

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================================
// Request Interceptor - Add JWT token to requests
// ============================================================================

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ============================================================================
// Response Interceptor - Handle errors globally
// ============================================================================

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Handle specific error codes
        if (error.response) {
            const status = error.response.status;

            // Token expired or invalid
            if (status === 401) {
                await AsyncStorage.removeItem(TOKEN_KEY);
                // Navigation to login should be handled by the app state listener
            }

            // Extract error message from response
            const data = error.response.data as { message?: string };
            const message = data?.message || getDefaultErrorMessage(status);

            return Promise.reject(new ApiError(message, status));
        }

        // Network error (no response)
        if (error.request) {
            return Promise.reject(new ApiError('Network error. Please check your connection.', 0));
        }

        return Promise.reject(new ApiError('An unexpected error occurred.', -1));
    }
);

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Custom API error with status code and message.
 */
export class ApiError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }

    /** Check if error is due to authentication failure */
    isAuthError(): boolean {
        return this.statusCode === 401;
    }

    /** Check if error is due to network issues */
    isNetworkError(): boolean {
        return this.statusCode === 0;
    }

    /** Check if error is a server error */
    isServerError(): boolean {
        return this.statusCode >= 500;
    }
}

/**
 * Get default error message for HTTP status code.
 */
function getDefaultErrorMessage(status: number): string {
    switch (status) {
        case 400: return 'Invalid request. Please check your input.';
        case 401: return 'Session expired. Please login again.';
        case 403: return 'Access denied.';
        case 404: return 'Resource not found.';
        case 409: return 'Conflict. This action has already been completed.';
        case 500: return 'Server error. Please try again later.';
        default: return 'An error occurred. Please try again.';
    }
}

export default apiClient;
