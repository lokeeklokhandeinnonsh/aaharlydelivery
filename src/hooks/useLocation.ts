import { useState, useCallback, useMemo } from 'react';

export function useLocation(options: any = {}) {
    return useMemo(() => ({
        location: { latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() },
        status: 'success',
        error: null,
        isLoading: false,
        fetchLocation: async () => ({ latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() }),
        requestPermission: async () => true,
        openSettings: () => { },
        clearLocation: () => { },
        distance: null,
        startWatching: async () => { },
        stopWatching: () => { },
        isWatching: false
    }), []);
}

export function getErrorTitle(type: string): string {
    return 'Location Error';
}
