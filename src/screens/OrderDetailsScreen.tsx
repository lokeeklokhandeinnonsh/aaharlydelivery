/**
 * OrderDetailsScreen
 * 
 * Displays delivery details and allows navigation to verification.
 * Updated to use real data passed from Dashboard.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// GPS & API
import { useLocation, getErrorTitle } from '../hooks/useLocation';
import { formatDistance, NearbyDeliveryItem } from '../services/api/deliveryApi';

const OrderDetailsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();

    // Receive full delivery object from Dashboard
    const delivery: NearbyDeliveryItem = route.params?.delivery;

    // Fallback if accessed incorrectly (should not happen in prod flow)
    if (!delivery) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: '#fff' }}>No delivery data found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const {
        id: orderId,
        customerName,
        customerPhone,
        address,
        lat: deliveryLat, // Check if these exist in NearbyDeliveryItem or address object
        lng: deliveryLng,
        mealName,
        mealType,
        mealDate,
        status
    } = delivery as any;
    // Note: NearbyDeliveryItem has address: DeliveryAddress { street, lat, lng }

    const targetLat = delivery.address.lat || 0;
    const targetLng = delivery.address.lng || 0;

    // GPS Hooks
    const {
        location,
        distance: liveDistance,
        startWatching,
        stopWatching,
        status: locationStatus,
        error: locationError,
        isLoading: isGpsLoading
    } = useLocation({
        autoFetch: false,
        timeout: 10000,
        targetLat: targetLat,
        targetLng: targetLng
    });

    // State
    const [distance, setDistance] = useState<number | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const handleCall = () => {
        if (customerPhone) {
            Linking.openURL(`tel:${customerPhone}`);
        }
    };

    /**
     * Refresh location and check proximity on screen focus.
     */
    useFocusEffect(
        useCallback(() => {
            startWatching();
            return () => {
                stopWatching();
            };
        }, [startWatching, stopWatching])
    );

    // Live Distance Updates
    useEffect(() => {
        if (liveDistance !== null) {
            setDistance(liveDistance);
            setIsVerified(liveDistance <= 50); // 50m verification threshold
            setLastUpdated(new Date());
        }
    }, [liveDistance]);

    const handleNavigate = () => {
        let url = '';
        if (targetLat !== 0 && targetLng !== 0) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
        } else {
            const label = encodeURIComponent(delivery.address.street || '');
            url = `https://www.google.com/maps/dir/?api=1&destination=${label}`;
        }
        Linking.openURL(url);
    };

    const handleVerifyPress = () => {
        navigation.navigate('Verify', {
            orderId: delivery.id,
            customerName: delivery.customerName,
            address: delivery.address.street,
            latitude: targetLat,
            longitude: targetLng
        });
    };

    // Helper to render status bar content
    const renderStatus = () => {
        if (isGpsLoading) {
            return (
                <View style={styles.statusRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.statusText}>Checking proximity...</Text>
                </View>
            );
        }

        if (locationError) {
            return (
                <View style={styles.statusRow}>
                    <Icon name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.statusText, { color: colors.error }]}>
                        {getErrorTitle(locationError.type)}
                    </Text>
                </View>
            );
        }

        if (distance !== null) {
            return (
                <View style={styles.statusRow}>
                    <Icon
                        name={isVerified ? "check-circle" : "map-marker-distance"}
                        size={16}
                        color={isVerified ? "#22C55E" : "#F59E0B"}
                    />
                    <Text style={[
                        styles.statusText,
                        isVerified ? { color: "#22C55E" } : { color: "#F59E0B" }
                    ]}>
                        {isVerified ? "You are at the location" : `${formatDistance(distance)} away`}
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.statusRow}>
                <Icon name="map-marker-off" size={16} color={colors.textSecondary} />
                <Text style={styles.statusText}>Distance unavailable</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-left" size={28} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Customer Pill Card */}
                <View style={styles.customerCard}>
                    <View style={styles.customerInfo}>
                        <View style={styles.avatarLarge}>
                            <Icon name="account" size={40} color={colors.white} />
                        </View>
                        <View>
                            <Text style={styles.customerName}>{delivery.customerName}</Text>
                            <View style={styles.badgeRow}>
                                <Icon name="star-circle" size={14} color={colors.primary} />
                                <Text style={styles.badgeText}> {delivery.priority === 'URGENT' ? 'Urgent Order' : 'Standard Delivery'}</Text>
                            </View>
                        </View>
                    </View>
                    {customerPhone && (
                        <TouchableOpacity onPress={handleCall} style={styles.callButtonLarge}>
                            <Icon name="phone" size={24} color={colors.white} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Delivery Address Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>
                </View>

                <View style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                        <View style={styles.pinIcon}>
                            <Icon name="map-marker" size={20} color={colors.white} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.addressTitle}>Delivery Location</Text>
                            <Text style={styles.addressSubtitle}>{delivery.address.street}</Text>
                        </View>
                    </View>

                    {/* Live Distance Indicator */}
                    <View style={styles.distanceContainer}>
                        {renderStatus()}

                        {lastUpdated && !isGpsLoading && (
                            <Text style={styles.lastUpdatedText}>
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </Text>
                        )}
                    </View>

                    {/* Navigation Button */}
                    <TouchableOpacity onPress={handleNavigate}>
                        <LinearGradient
                            colors={['#FF791A', '#EA580C']} // Primary Orange Gradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.navigateButton}
                        >
                            <Icon name="navigation" size={24} color={colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.navigateButtonText}>Navigate</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Meal Details Section */}
                <Text style={styles.sectionLabel}>MEAL DETAILS</Text>
                <View style={styles.mealCard}>
                    <View style={styles.planHeader}>
                        <View>
                            <Text style={styles.planLabel}>MEAL</Text>
                            <Text style={styles.planName}>{delivery.mealName || delivery.mealType}</Text>
                        </View>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeText}>{delivery.status.replace(/_/g, ' ')}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.mealItem}>
                        <View style={styles.mealImage}>
                            <Icon name="food-variant" size={24} color={colors.warning} />
                        </View>
                        <View>
                            <Text style={styles.mealName}>{delivery.planName || 'Single Order'}</Text>
                            <Text style={styles.slotInfo}>
                                {new Date(delivery.mealDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        !isVerified && distance !== null && { backgroundColor: '#333', opacity: 0.8 }
                    ]}
                    onPress={isVerified ? handleVerifyPress : undefined}
                >
                    <Icon
                        name={isVerified ? "shield-check" : "shield-alert"}
                        size={24}
                        color={isVerified ? colors.white : 'rgba(255,255,255,0.5)'}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={[
                        styles.verifyButtonText,
                        !isVerified && distance !== null && { color: 'rgba(255,255,255,0.5)' }
                    ]}>
                        {!isVerified && distance !== null ? "Too Far to Verify" : "Verify Delivery"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    customerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 50, // Pill shape
        padding: 12,
        paddingLeft: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#7D9E97', // Muted sage green
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.primary,
        fontSize: 12,
        fontFamily: fonts.semiBold,
    },
    callButtonLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: fonts.bold,
        color: colors.textSecondary,
        marginBottom: 12,
        letterSpacing: 1,
        marginTop: 8,
    },
    addressCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    addressHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    pinIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#D97706', // Darker Orange
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addressTitle: {
        color: colors.white,
        fontSize: 14,
        fontFamily: fonts.bold,
        marginBottom: 2,
    },
    addressSubtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: fonts.regular,
    },
    distanceContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: 8,
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    lastUpdatedText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
    },
    mealCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planLabel: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    planName: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        width: 200,
    },
    activeBadge: {
        backgroundColor: 'rgba(234, 112, 11, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(234, 112, 11, 0.3)',
    },
    activeText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardBorder,
        marginVertical: 16,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2A2F35',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    mealName: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    slotInfo: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    verifyButton: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    verifyButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // New Styles
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
    },
    navigateButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    }
});
