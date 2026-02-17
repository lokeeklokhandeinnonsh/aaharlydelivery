/**
 * VerifyScreen - Location Verification
 * 
 * Verifies if the rider is at the correct location.
 * Uses real API verification and GPS data.
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

const { width } = Dimensions.get('window');

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
        startWatching,
        stopWatching,
        status: locationStatus,
        error: locationError,
        openSettings
    } = useLocation({
        targetAccuracy: 50,
        autoFetch: false,
        timeout: 10000
    });

    // State
    const [isVerified, setIsVerified] = useState(false);
    const [distance, setDistance] = useState<number | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [lastError, setLastError] = useState<string>('');
    const [canShowRangeWarning, setCanShowRangeWarning] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            startWatching();
            setCanShowRangeWarning(false);

            // Allow some time before showing range warning
            const timer = setTimeout(() => {
                setCanShowRangeWarning(true);
            }, 5000);

            let interval: ReturnType<typeof setInterval>;

            const checkBackendVerification = async () => {
                if (isCompleting || !location) return;

                if (location.accuracy <= 100) { // Accept up to 100m accuracy for check
                    try {
                        const response = await verifyLocation({
                            deliveryId: params.orderId,
                            currentLatitude: location.latitude,
                            currentLongitude: location.longitude,
                            accuracy: location.accuracy,
                        });

                        setDistance(response.distance);
                        setIsVerified(response.verified);

                        if (response.verified) {
                            setLastError('');
                        }

                        // Animate Progress Bar
                        const maxDist = 200;
                        const dist = response.distance;
                        const progress = Math.max(0, Math.min(1, 1 - (dist / maxDist)));

                        Animated.timing(progressAnim, {
                            toValue: progress,
                            duration: 500,
                            useNativeDriver: false,
                        }).start();

                    } catch (err: any) {
                        console.log('Verify Error:', err);
                        // Don't show every network glitch
                    }
                } else if (locationError) {
                    setLastError(getErrorTitle(locationError.type));
                }
            };

            interval = setInterval(checkBackendVerification, 5000); // Check every 5s

            return () => {
                stopWatching();
                clearInterval(interval);
                clearTimeout(timer);
            };
        }, [startWatching, stopWatching, location, isCompleting, locationError, params.orderId])
    );

    const handleContinue = async () => {
        if (!isVerified || !location) return;

        setIsCompleting(true);
        try {
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

        let url = '';
        if (lat !== 0 && lng !== 0) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        } else {
            const label = encodeURIComponent(params.address || '');
            url = `https://www.google.com/maps/dir/?api=1&destination=${label}`;
        }
        Linking.openURL(url);
    };

    const renderNavigateSection = () => (
        <View style={styles.navigateSection}>
            <TouchableOpacity onPress={handleNavigate} style={{ width: '100%' }}>
                <LinearGradient
                    colors={['#FF791A', '#EA580C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.navigateButton}
                >
                    <Icon name="navigation" size={24} color={colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.navigateButtonText}>Navigate to Location</Text>
                </LinearGradient>
            </TouchableOpacity>

            {(lastError || (locationStatus === 'error')) && (
                <View style={[styles.warningBadge, { backgroundColor: 'rgba(239, 68, 68, 0.9)' }]}>
                    <Icon name="alert-circle" size={16} color="#fff" />
                    <View>
                        <Text style={styles.warningTitle}>
                            {lastError || "GPS Error"}
                        </Text>
                        <Text style={styles.warningSub}>
                            {locationError?.type === 'PERMISSION' ? "Tap to open settings" : "Check signal"}
                        </Text>
                    </View>
                </View>
            )}

            {!isVerified && !lastError && distance !== null && canShowRangeWarning && (
                <View style={[styles.warningBadge, { top: -80 }]}>
                    <Icon name="radius-outline" size={20} color="#EF4444" />
                    <View>
                        <Text style={styles.warningTitle}>Out of Range</Text>
                        <Text style={styles.warningSub}>Move closer to verify</Text>
                    </View>
                </View>
            )}
        </View>
    );

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

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

                {/* Main Icon */}
                <View style={styles.mainIconContainer}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.iconCore}>
                            <Icon name="map-marker" size={40} color="#fff" />
                        </View>
                    </Animated.View>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Location Check</Text>
                    <Text style={styles.cardSubtitle}>Verify delivery location</Text>

                    {/* Proximity Section */}
                    <View style={styles.proximityRow}>
                        <Text style={styles.proximityLabel}>Proximity</Text>
                        <Text style={styles.distanceValue}>
                            {distance !== null ? formatDistance(distance) : '--'} away
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                { width: progressWidth },
                                isVerified && { backgroundColor: '#22C55E' }
                            ]}
                        />
                    </View>
                    <View style={styles.rangeLabels}>
                        <Text style={styles.rangeText}>OUT OF RANGE</Text>
                        <Text style={[styles.rangeText, { color: '#22C55E' }]}>DESTINATION</Text>
                    </View>

                    {renderNavigateSection()}

                </View>
            </View>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.continueBtn,
                        (!isVerified || isCompleting) && styles.btnDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={!isVerified || isCompleting}
                >
                    {isCompleting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={[
                                styles.btnText,
                                (!isVerified) && { color: 'rgba(255,255,255,0.4)' }
                            ]}>
                                Continue Verification
                            </Text>
                            <Icon
                                name="arrow-right"
                                size={20}
                                color={!isVerified ? 'rgba(255,255,255,0.4)' : '#fff'}
                            />
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
        paddingBottom: 20,
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
        paddingTop: 20,
    },
    mainIconContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 121, 26, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCore: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF791A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#FF791A",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        width: width - 40,
        backgroundColor: '#1A1D21',
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginBottom: 30,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FF791A',
        borderRadius: 4,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    rangeText: {
        fontSize: 10,
        color: '#EF4444',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    navigateSection: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        width: '100%',
        position: 'relative',
    },
    navigateButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        width: '100%',
    },
    navigateButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    warningBadge: {
        marginTop: 16,
        backgroundColor: 'rgba(30, 10, 10, 0.9)',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        width: '100%'
    },
    warningTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 10,
    },
    warningSub: {
        color: '#EF4444',
        fontSize: 12,
        marginLeft: 10,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    continueBtn: {
        backgroundColor: '#4A3426',
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    btnDisabled: {
        backgroundColor: '#2A1E17',
        opacity: 0.8,
    },
    btnText: {
        color: '#fff',
        fontSize: 17,
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
