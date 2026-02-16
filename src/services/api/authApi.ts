import apiClient from './apiClient';

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
// Service
// ============================================================================

export const authApi = {
    /**
     * Login vendor
     */
    login: async (credentials: VendorLoginRequest): Promise<VendorLoginResponse> => {
        const response = await apiClient.post<VendorLoginResponse>('/vendor/auth/login', credentials);
        return response.data;
    }
};

export default authApi;
