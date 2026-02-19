/**
 * VerifyScreen - Location Verification
 * 
 * Verifies if the rider is at the correct location.
 * Implements strict 50m validation and Zomato-style proximity animation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    Animated,
    Easing,
    Linking,
    Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

// GPS Hook & API
import { useLocation, getErrorTitle } from '../hooks/useLocation';
import {
    verifyLocation,
    completeDelivery,
    formatDistance
} from '../services/api/deliveryApi';
import { ApiError } from '../services/api/apiClient';
import { DELIVERY_RADIUS_METERS } from '../constants/delivery';

const { width } = Dimensions.get('window');

// Animation Constants
const MAX_ANIMATION_DISTANCE = 200; // Meters at which circle is max size
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.8;

interface RouteParams {
    orderId: string;
    customerName?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

const VerifyScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();
    const params: RouteParams = route.params || { orderId: '' };

    // GPS Hook
    const {
        location,
        distance: gpsDistance,
        startWatching,
        stopWatching,
        status: locationStatus,
        error: locationError,
        openSettings
    } = useLocation({
        targetAccuracy: DELIVERY_RADIUS_METERS,
        autoFetch: false,
        timeout: 10000,
        targetLat: params.latitude,
        targetLng: params.longitude
    });

    // State
    const [isVerified, setIsVerified] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [lastError, setLastError] = useState<string>('');
    const [canShowRangeWarning, setCanShowRangeWarning] = useState(false);

    // Animation Values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const distanceAnim = useRef(new Animated.Value(MAX_ANIMATION_DISTANCE)).current; // Start at max
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Derived State
    const currentDistance = gpsDistance ?? MAX_ANIMATION_DISTANCE;
    const isWithinRange = currentDistance <= DELIVERY_RADIUS_METERS;
    const isVeryClose = currentDistance <= 25;
    const isAtSpot = currentDistance <= 10;

    // Pulse Animation Loop
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Distance Animation Update
    useEffect(() => {
        // Animate visual circle radius based on distance
        Animated.timing(distanceAnim, {
            toValue: Math.min(Math.max(currentDistance, 0), MAX_ANIMATION_DISTANCE),
            duration: 500,
            useNativeDriver: false, // Changed to false to support color/shadow interpolation
        }).start();

        // Animate Progress Bar
        // 0m => 100%, 50m => 0%
        const progress = Math.max(0, Math.min(1, (DELIVERY_RADIUS_METERS - currentDistance) / DELIVERY_RADIUS_METERS));
        // If within range, snap to full or high? No, 50m is 0%. 0m is 100%.
        // Wait, normally progress bar shows "Completion".
        // If I am at 50m, I have "arrived" at the zone? Or I need to be at 0m?
        // User says: 0m -> 100%, 50m -> 0%.

        // Actually, let's make it:
        // Range 0-50m maps to 100%-0% (inverted)?
        // "Progress bar should represent approach progress: progress = (DELIVERY_RADIUS_METERS - distance) / DELIVERY_RADIUS_METERS"
        // At 50m: (50-50)/50 = 0.
        // At 0m: (50-0)/50 = 1 (100%).
        // At 100m: (50-100)/50 = -1 -> clamped to 0.

        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 500,
            useNativeDriver: false, // width doesn't support native driver
        }).start();

    }, [currentDistance]);

    // Backend Verification Loop (Keep for syncing)
    useFocusEffect(
        useCallback(() => {
            startWatching();
            setCanShowRangeWarning(false);

            const timer = setTimeout(() => {
                setCanShowRangeWarning(true);
            }, 5000);

            let interval: ReturnType<typeof setInterval>;

            const checkBackendVerification = async () => {
                if (isCompleting || !location) return;

                // Only verify if accurate enough
                if (location.accuracy <= 100) {
                    try {
                        const response = await verifyLocation({
                            deliveryId: params.orderId,
                            currentLatitude: location.latitude,
                            currentLongitude: location.longitude,
                            accuracy: location.accuracy,
                        });

                        // We rely on local `gpsDistance` for UI speed, but sync verification status
                        setIsVerified(response.verified);

                        // If backend says verified, clear error
                        if (response.verified) setLastError('');

                    } catch (err: any) {
                        console.log('Verify Error:', err);
                    }
                } else if (locationError) {
                    setLastError(getErrorTitle(locationError.type));
                }
            };

            interval = setInterval(checkBackendVerification, 5000);

            return () => {
                stopWatching();
                clearInterval(interval);
                clearTimeout(timer);
            };
        }, [startWatching, stopWatching, location, isCompleting, locationError, params.orderId])
    );

    const handleContinue = async () => {
        if (!isWithinRange) {
            setLastError(`Move within ${DELIVERY_RADIUS_METERS}m to verify.`);
            return;
        }

        setIsCompleting(true);
        try {
            // Final check
            if (!location) throw new Error("Location unavailable");

            const response = await completeDelivery(params.orderId, {
                completionLatitude: location.latitude,
                completionLongitude: location.longitude,
                completedAt: new Date().toISOString()
            });

            if (response.success) {
                navigation.replace('DeliverySuccess', {
                    orderId: params.orderId,
                    customerName: params.customerName || 'Customer',
                    gpsVerified: true
                });
            }
        } catch (error: any) {
            setIsCompleting(false);
            if (error instanceof ApiError) {
                setLastError(error.message);
            } else {
                setLastError('Failed to complete. Try again.');
            }
        }
    };

    const handleNavigate = () => {
        const lat = params.latitude || 0;
        const lng = params.longitude || 0;
        const label = encodeURIComponent(params.address || '');

        let url = '';
        if (lat !== 0 && lng !== 0) {
            url = Platform.select({
                ios: `maps:0,0?q=${label}@${lat},${lng}`,
                android: `geo:0,0?q=${lat},${lng}(${label})`
            }) || '';
        } else {
            url = Platform.select({
                ios: `maps:0,0?q=${label}`,
                android: `geo:0,0?q=${label}`
            }) || '';
        }
        Linking.openURL(url);
    };

    // Interpolations
    const circleScale = distanceAnim.interpolate({
        inputRange: [0, DELIVERY_RADIUS_METERS, MAX_ANIMATION_DISTANCE],
        outputRange: [MIN_SCALE, 1, MAX_SCALE],
        extrapolate: 'clamp'
    });

    const circleOpacity = distanceAnim.interpolate({
        inputRange: [0, DELIVERY_RADIUS_METERS, MAX_ANIMATION_DISTANCE],
        outputRange: [1, 0.8, 0.2],
        extrapolate: 'clamp'
    });

    const circleColor = distanceAnim.interpolate({
        inputRange: [0, 25, DELIVERY_RADIUS_METERS, 100],
        outputRange: ['#22C55E', '#22C55E', '#FF791A', 'rgba(255,255,255,0.1)'],
        extrapolate: 'clamp' // Keep green if < 0?
    });

    const glowIntensity = distanceAnim.interpolate({
        inputRange: [0, DELIVERY_RADIUS_METERS],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    // Dynamic Helper Text
    const getHelperText = () => {
        if (currentDistance > DELIVERY_RADIUS_METERS) return `Move within ${DELIVERY_RADIUS_METERS} meters to verify delivery`;
        if (currentDistance <= DELIVERY_RADIUS_METERS && currentDistance > 10) return "You are at delivery location";
        return "Ready to complete delivery";
    };

    const canProceed = isWithinRange && !isCompleting;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d0805" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DELIVERY VERIFICATION</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                {/* Main Dynamic Proximity Indicator */}
                <View style={styles.mainIconContainer}>
                    {/* Outer scaling circle */}
                    <Animated.View style={[
                        styles.proximityCircle,
                        {
                            transform: [{ scale: circleScale }],
                            opacity: circleOpacity,
                            borderColor: circleColor,
                            backgroundColor: isWithinRange ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 121, 26, 0.05)'
                        }
                    ]} />

                    {/* Inner Pulse (Location Pin) */}
                    <Animated.View style={[
                        styles.pulseCore,
                        {
                            transform: [{ scale: pulseAnim }],
                            shadowOpacity: glowIntensity,
                        }
                    ]}>
                        <View style={[styles.iconCore, isWithinRange && styles.iconCoreSuccess]}>
                            <Icon name={isWithinRange ? "check" : "map-marker"} size={32} color="#fff" />
                        </View>
                    </Animated.View>
                </View>

                {/* Status Text */}
                <Text style={styles.statusTitle}>
                    {isWithinRange ? "You're Here!" : "Approaching..."}
                </Text>
                <Text style={styles.statusSubtitle}>
                    {getHelperText()}
                </Text>

                {/* Card */}
                <View style={styles.card}>
                    {/* Proximity Section */}
                    <View style={styles.proximityRow}>
                        <Text style={styles.proximityLabel}>Distance to Drop</Text>
                        <Text style={[styles.distanceValue, isWithinRange && { color: '#22C55E' }]}>
                            {formatDistance(currentDistance)}
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                { width: progressWidth },
                                isWithinRange && { backgroundColor: '#22C55E' }
                            ]}
                        />
                    </View>
                    <View style={styles.rangeLabels}>
                        <Text style={styles.rangeText}>{DELIVERY_RADIUS_METERS}m ZONE</Text>
                        <Text style={[styles.rangeText, { color: '#22C55E' }]}>ARRIVED</Text>
                    </View>

                    {/* Navigation Button */}
                    <TouchableOpacity onPress={handleNavigate} style={{ marginTop: 10 }}>
                        <LinearGradient
                            colors={['#2A2F35', '#1F2429']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.navigateButton}
                        >
                            <Icon name="navigation" size={20} color={colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.navigateButtonText}>Open Maps</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </View>

            {/* Error / Warning Overlays */}
            {(lastError || (locationStatus === 'error')) && (
                <View style={styles.errorBanner}>
                    <Icon name="alert-circle" size={20} color="#fff" />
                    <Text style={styles.errorText}>
                        {lastError || "GPS Signal Weak"}
                    </Text>
                </View>
            )}

            {/* Footer Button - Only active when in range */}
            <View style={styles.footer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.continueBtn,
                        (!canProceed) && styles.btnDisabled,
                        isWithinRange && styles.btnSuccess
                    ]}
                    onPress={handleContinue}
                    disabled={!canProceed}
                >
                    {isCompleting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon
                                name={isWithinRange ? "check-circle" : "walk"}
                                size={24}
                                color={!canProceed ? 'rgba(255,255,255,0.4)' : '#fff'}
                            />
                            <Text style={[
                                styles.btnText,
                                (!canProceed) && { color: 'rgba(255,255,255,0.4)' }
                            ]}>
                                {isWithinRange ? "Complete Delivery" : "Get Closer to Verify"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {locationError?.type === 'PERMISSION' && (
                <TouchableOpacity style={styles.permOverlay} onPress={openSettings}>
                    <Text style={styles.permText}>Tap to Enable Location</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default VerifyScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0805',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    mainIconContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    proximityCircle: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: '#FF791A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseCore: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#FF791A",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 10,
    },
    iconCore: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF791A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCoreSuccess: {
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    statusSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 30,
        textAlign: 'center',
    },
    card: {
        width: width - 40,
        backgroundColor: '#1A1D21',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    proximityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    proximityLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    distanceValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FF791A',
        borderRadius: 3,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    rangeText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    navigateButton: {
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    navigateButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    errorBanner: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    continueBtn: {
        backgroundColor: '#2A1E17',
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    btnSuccess: {
        backgroundColor: '#22C55E', // Green when ready
        shadowColor: '#22C55E',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    permOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    permText: {
        display: 'none',
    }
});
