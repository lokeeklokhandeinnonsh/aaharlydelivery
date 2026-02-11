import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { ApiError } from './apiClient';

// ============================================================================
// Types
// ============================================================================

export interface VendorLoginRequest {
    email?: string;
    password?: string;
    phone?: string;
    otp?: string;
}

export interface VendorInfo {
    id: string;
    name: string;
    email: string;
    kitchenId: string;
    status: 'active' | 'inactive';
}

export interface VendorLoginResponse {
    success: boolean;
    accessToken: string;
    vendor: VendorInfo;
}

// ============================================================================
// Keys
// ============================================================================

const TOKEN_KEY = '@aaharly_vendor_token';
const VENDOR_KEY = '@aaharly_vendor_info';

// ============================================================================
// Service
// ============================================================================

export const authApi = {
    /**
     * Login vendor and save token
     */
    login: async (credentials: VendorLoginRequest): Promise<VendorLoginResponse> => {
        try {
            const response = await apiClient.post<VendorLoginResponse>('/vendor/auth/login', credentials);

            if (response.data.success && response.data.accessToken) {
                await authApi.saveSession(response.data.accessToken, response.data.vendor);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logout and clear token
     */
    logout: async (): Promise<void> => {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, VENDOR_KEY]);
            // Also clear from apiClient in memory if we exposed a clear method, 
            // but apiClient.ts reads from variable. 
            // Ideally apiClient should have a clearAuthToken method we call here.
        } catch (error) {
            console.error('Logout error', error);
        }
    },

    /**
     * Save session data
     */
    saveSession: async (token: string, vendor: VendorInfo): Promise<void> => {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(VENDOR_KEY, JSON.stringify(vendor));
        } catch (error) {
            console.error('Session save error', error);
        }
    },

    /**
     * Get stored session token
     */
    getToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    },

    /**
     * Get stored vendor info
     */
    getVendor: async (): Promise<VendorInfo | null> => {
        try {
            const json = await AsyncStorage.getItem(VENDOR_KEY);
            return json ? JSON.parse(json) : null;
        } catch {
            return null;
        }
    }
};
