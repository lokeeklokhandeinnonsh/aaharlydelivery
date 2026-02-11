/**
 * Delivery API Service
 * 
 * API functions for GPS-based delivery verification.
 */

import apiClient from './apiClient';

// ============================================================================
// Types
// ============================================================================

/** GPS verification status */
export type VerificationStatus = 'GPS_VERIFIED' | 'MANUAL_OVERRIDE' | 'PENDING';

/** Delivery status enum */
export type DeliveryStatus =
    | 'PENDING'
    | 'PREPARING'
    | 'READY_TO_DISPATCH'
    | 'HANDED_OVER'
    | 'DELIVERED'
    | 'CANCELLED';

// ============================================================================
// Request Types
// ============================================================================

export interface VerifyLocationRequest {
    deliveryId: string;
    currentLatitude: number;
    currentLongitude: number;
    accuracy?: number;
}

export interface CompleteDeliveryRequest {
    completionLatitude: number;
    completionLongitude: number;
    completedAt?: string;
    notes?: string;
}

export interface NearbyDeliveriesQuery {
    latitude: number;
    longitude: number;
    maxDistance?: number;
    status?: DeliveryStatus;
    limit?: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface VerifyLocationResponse {
    verified: boolean;
    distance: number;
    threshold: number;
    message: string;
    canComplete: boolean;
}

export interface CompleteDeliveryResponse {
    success: boolean;
    deliveryId: string;
    completedAt: string;
    verificationStatus: VerificationStatus;
    notificationSent: boolean;
}

export interface DeliveryAddress {
    street: string;
    details?: string;
    lat?: number;
    lng?: number;
    pincode?: string;
}

export interface NearbyDeliveryItem {
    id: string;
    customerName: string;
    customerPhone: string;
    address: DeliveryAddress;
    distance: number;
    estimatedTime: number;
    mealType: string;
    mealName: string;
    planName: string;
    priority: 'NORMAL' | 'URGENT';
    status: DeliveryStatus;
    mealDate: string;
}

export interface NearbyDeliveriesResponse {
    deliveries: NearbyDeliveryItem[];
    totalCount: number;
    searchRadius: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Verify that delivery partner is within acceptable distance of delivery address.
 * 
 * @param data - Location verification request with GPS coordinates
 * @returns Verification result with distance info
 */
export async function verifyLocation(data: VerifyLocationRequest): Promise<VerifyLocationResponse> {
    const response = await apiClient.post<VerifyLocationResponse>(
        '/vendor/delivery/verify-location',
        data
    );
    return response.data;
}

/**
 * Complete a delivery with GPS proof.
 * 
 * @param deliveryId - Delivery ID to complete
 * @param data - Completion request with GPS coordinates
 * @returns Completion confirmation
 */
export async function completeDelivery(
    deliveryId: string,
    data: CompleteDeliveryRequest
): Promise<CompleteDeliveryResponse> {
    const response = await apiClient.post<CompleteDeliveryResponse>(
        `/vendor/delivery/${deliveryId}/complete`,
        data
    );
    return response.data;
}

/**
 * Fetch deliveries sorted by distance from partner's location.
 * 
 * @param query - Query params including GPS coordinates
 * @returns List of nearby deliveries sorted by distance
 */
export async function getNearbyDeliveries(
    query: NearbyDeliveriesQuery
): Promise<NearbyDeliveriesResponse> {
    const params = new URLSearchParams();
    params.append('latitude', query.latitude.toString());
    params.append('longitude', query.longitude.toString());

    if (query.maxDistance) {
        params.append('maxDistance', query.maxDistance.toString());
    }
    if (query.status) {
        params.append('status', query.status);
    }
    if (query.limit) {
        params.append('limit', query.limit.toString());
    }

    const response = await apiClient.get<NearbyDeliveriesResponse>(
        `/vendor/delivery/nearby?${params.toString()}`
    );
    return response.data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format distance for display.
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get user-friendly message for verification status.
 */
export function getVerificationMessage(response: VerifyLocationResponse): string {
    if (response.verified) {
        return 'Location verified! You can complete the delivery.';
    }
    return `You are ${formatDistance(response.distance)} away. Get closer to verify.`;
}
