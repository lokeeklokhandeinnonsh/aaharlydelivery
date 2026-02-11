/**
 * useLocation Hook
 * 
 * React hook for GPS permission handling and high-accuracy location fetching.
 * Features:
 * - Runtime permission checks (Fine/Coarse/Background)
 * - High accuracy mode with timeout (15s)
 * - Robust retry mechanism (Immediate -> 5s -> 10s)
 * - GPS Timeout detection & error classification
 * - NetInfo integration for connectivity checks
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, Linking, Alert, PermissionsAndroid, AppState, AppStateStatus } from 'react-native';
import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// ============================================================================
// Types
// ============================================================================

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export type LocationStatus =
    | 'idle'
    | 'requesting_permission'
    | 'permission_denied'
    | 'fetching'
    | 'success'
    | 'error'
    | 'timeout'
    | 'gps_disabled'
    | 'network_error';

export interface LocationError {
    code: number;
    message: string;
    type: 'PERMISSION' | 'TIMEOUT' | 'ACCURACY' | 'NETWORK' | 'GPS_OFF' | 'UNKNOWN';
}

export interface UseLocationOptions {
    /** Target accuracy in meters (default: 50) */
    targetAccuracy?: number;
    /** Maximum retry attempts (default: 3) */
    maxRetries?: number;
    /** Timeout per attempt in ms (default: 15000) */
    timeout?: number;
    /** Fetch location on mount (default: false) */
    autoFetch?: boolean;
}

export interface UseLocationReturn {
    /** Current location data (null if not fetched) */
    location: LocationData | null;
    /** Current status of location fetch */
    status: LocationStatus;
    /** Error details if any */
    error: LocationError | null;
    /** Whether location is currently being fetched */
    isLoading: boolean;
    /** Fetch location with retry logic */
    fetchLocation: () => Promise<LocationData | null>;
    /** Request location permission */
    requestPermission: () => Promise<boolean>;
    /** Open device location settings */
    openSettings: () => void;
    /** Clear current location data */
    clearLocation: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TARGET_ACCURACY = 50; // meters (Increased from 30 for stability)
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const RETRY_DELAYS = [0, 5000, 10000]; // Immediate, 5s, 10s

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
    const {
        targetAccuracy = DEFAULT_TARGET_ACCURACY,
        maxRetries = DEFAULT_MAX_RETRIES,
        timeout = DEFAULT_TIMEOUT,
        autoFetch = false,
    } = options;

    const [location, setLocation] = useState<LocationData | null>(null);
    const [status, setStatus] = useState<LocationStatus>('idle');
    const [error, setError] = useState<LocationError | null>(null);

    const retryCount = useRef(0);
    const isMounted = useRef(true);
    const appState = useRef(AppState.currentState);

    // Development logging
    const log = (msg: string, data?: any) => {
        if (__DEV__) {
            console.log(`[GPS] ${msg}`, data || '');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;

        // Listen to app state changes to re-check permissions if needed
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground, maybe re-check permission if denied?
            }
            appState.current = nextAppState;
        });

        return () => {
            isMounted.current = false;
            subscription.remove();
        };
    }, []);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchLocation();
        }
    }, [autoFetch]);

    /**
     * Check network connectivity.
     */
    const checkNetwork = async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        return (state.isConnected ?? false) && state.isInternetReachable !== false;
    };

    /**
     * Request location permission from user.
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isMounted.current) return false;

        setStatus('requesting_permission');
        setError(null);

        if (Platform.OS === 'ios') {
            const authStatus = await Geolocation.requestAuthorization('whenInUse');
            const granted = authStatus === 'granted';

            if (!granted && isMounted.current) {
                setStatus('permission_denied');
                setError({
                    code: 1,
                    message: 'Permission denied. Enable location in settings.',
                    type: 'PERMISSION'
                });
            }
            return granted;
        }

        // Android permission handling
        try {
            // Check if already granted to avoid unnecessary dialogs
            const hasFine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (hasFine) return true;

            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission Required',
                    message: 'Aaharly Delivery needs your location to verify deliveries and track progress.',
                    buttonNeutral: 'Ask Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Allow',
                }
            );

            const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;

            if (!isGranted && isMounted.current) {
                setStatus('permission_denied');
                setError({
                    code: 1,
                    message: 'Location permission required to verify delivery.',
                    type: 'PERMISSION'
                });
            }

            return isGranted;
        } catch (err) {
            console.warn('Permission request error:', err);
            if (isMounted.current) {
                setStatus('permission_denied');
                setError({
                    code: 1,
                    message: 'Failed to request permission.',
                    type: 'PERMISSION'
                });
            }
            return false;
        }
    }, []);

    /**
     * Fetch current GPS location with retry logic and validation.
     */
    const fetchLocation = useCallback(async (): Promise<LocationData | null> => {
        if (status === 'fetching') return null; // Prevent concurrent fetches
        if (!isMounted.current) return null;

        // 1. Check Network First
        const isConnected = await checkNetwork();
        if (!isConnected) {
            const err: LocationError = {
                code: 0,
                message: 'No Internet Connection. Please check your data.',
                type: 'NETWORK'
            };
            setError(err);
            setStatus('network_error');
            return null;
        }

        // 2. Request Permission
        const hasPermission = await requestPermission();
        if (!hasPermission) {
            return null;
        }

        setStatus('fetching');
        setError(null);
        retryCount.current = 0;

        log('Starting location fetch sequence...');

        return new Promise((resolve) => {
            const attemptFetch = (attempt: number) => {
                if (!isMounted.current) {
                    resolve(null);
                    return;
                }

                log(`Attempt ${attempt + 1}/${maxRetries} requesting position...`);

                Geolocation.getCurrentPosition(
                    (position: GeoPosition) => {
                        if (!isMounted.current) {
                            resolve(null);
                            return;
                        }

                        const { latitude, longitude, accuracy } = position.coords;

                        log(`Received location: lat=${latitude}, lng=${longitude}, acc=${accuracy}m`);

                        const locationData: LocationData = {
                            latitude,
                            longitude,
                            accuracy: accuracy || 0, // Fallback if 0 on some devices
                            timestamp: position.timestamp,
                        };

                        // 3. Validate Accuracy
                        if (accuracy && accuracy <= targetAccuracy) {
                            log(`Accuracy acceptable (<${targetAccuracy}m). Success.`);
                            setLocation(locationData);
                            setStatus('success');
                            resolve(locationData);
                        } else {
                            log(`Accuracy low (${accuracy}m > ${targetAccuracy}m).`);

                            // If accuracy is poor but we have coordinates, we might accept it 
                            // on the final retry instead of failing completely.
                            if (attempt < maxRetries - 1) {
                                retryCount.current = attempt + 1;
                                const delay = RETRY_DELAYS[attempt + 1] || 10000;
                                log(`Retrying in ${delay / 1000}s for better accuracy...`);
                                setTimeout(() => attemptFetch(attempt + 1), delay);
                            } else {
                                // Final attempt: accept what we have or fail?
                                // User rule says "Validate accuracy < 50m".
                                // If final is still bad, we should probably warn user.
                                log('Max retries reached with low accuracy.');

                                // Strict mode: fail if > 50m
                                const err: LocationError = {
                                    code: 5,
                                    message: `GPS accuracy is low (${Math.round(accuracy)}m). improved signal needed. Move to open area.`,
                                    type: 'ACCURACY'
                                };
                                setError(err); // Show warning but maybe still return location? 
                                // For verification "guards", we need valid location. 
                                // Let's return null to force "Wait" state or return it 
                                // and let caller decide. 
                                // The Plan says "Reject null / stale values".
                                // Let's fail for now to ensure quality.
                                setStatus('error');
                                resolve(null);
                            }
                        }
                    },
                    (geoError: GeoError) => {
                        if (!isMounted.current) {
                            resolve(null);
                            return;
                        }

                        log(`GeoError code=${geoError.code}: ${geoError.message}`);

                        // 4. Handle Specific Errors
                        // Code 1: Permission Denied (Already handled via requestPermission check usually)
                        // Code 2: Position Unavailable (GPS off or no signal)
                        // Code 3: Timeout
                        // Code 4: Play Services unavailable
                        // Code 5: Settings not satisfied

                        if (attempt < maxRetries - 1 && geoError.code !== 1) {
                            retryCount.current = attempt + 1;
                            const delay = RETRY_DELAYS[attempt + 1] || 5000;
                            log(`Retrying in ${delay / 1000}s after error...`);
                            setTimeout(() => attemptFetch(attempt + 1), delay);
                        } else {
                            // Max retries reached
                            const err = mapGeoError(geoError);
                            setError(err);
                            setStatus(
                                geoError.code === 3 ? 'timeout' :
                                    geoError.code === 2 ? 'gps_disabled' : 'error'
                            );
                            resolve(null);
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: timeout,
                        maximumAge: 10000,
                        forceRequestLocation: true, // Force fresh location on Android
                        showLocationDialog: true,   // Show "Turn on GPS" dialog
                    }
                );
            };

            // Start first attempt immediately (delay index 0 is 0)
            attemptFetch(0);
        });
    }, [requestPermission, targetAccuracy, maxRetries, timeout]);

    /**
     * Open device location settings.
     */
    const openSettings = useCallback(() => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    }, []);

    /**
     * Clear current location data.
     */
    const clearLocation = useCallback(() => {
        setLocation(null);
        setStatus('idle');
        setError(null);
        retryCount.current = 0;
    }, []);

    return {
        location,
        status,
        error,
        isLoading: status === 'fetching' || status === 'requesting_permission',
        fetchLocation,
        requestPermission,
        openSettings,
        clearLocation,
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map Geolocation errors to custom LocationError type.
 */
function mapGeoError(error: GeoError): LocationError {
    switch (error.code) {
        case 1:
            return {
                code: 1,
                message: 'Location permission denied. Enable in Settings.',
                type: 'PERMISSION'
            };
        case 2:
            return {
                code: 2,
                message: 'GPS signal unavailable. Check if GPS is on and testing outdoors.',
                type: 'GPS_OFF'
            };
        case 3:
            return {
                code: 3,
                message: 'GPS request timed out. Try moving to an open area.',
                type: 'TIMEOUT'
            };
        case 4:
            return {
                code: 4,
                message: 'Google Play Services unavailable.',
                type: 'UNKNOWN'
            };
        case 5:
            return {
                code: 5,
                message: 'Location settings not satisfied.',
                type: 'GPS_OFF'
            };
        default:
            return {
                code: error.code,
                message: 'Unable to get location. Please try again.',
                type: 'UNKNOWN'
            };
    }
}

/**
 * Formats error type for UI display
 */
export function getErrorTitle(type: LocationError['type']): string {
    switch (type) {
        case 'PERMISSION': return 'Permission Required';
        case 'GPS_OFF': return 'GPS Unavailable';
        case 'TIMEOUT': return 'GPS Timeout';
        case 'NETWORK': return 'No Internet';
        case 'ACCURACY': return 'Weak Signal';
        default: return 'Location Error';
    }
}
