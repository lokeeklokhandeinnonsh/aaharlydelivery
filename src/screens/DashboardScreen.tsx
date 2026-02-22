import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Platform } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getNearbyDeliveries, NearbyDeliveryItem, formatDistance } from '../services/api/deliveryApi';
import { useLocation } from '../hooks/useLocation';
import { useAuthStore } from '../store/authStore';

const DashboardScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { user } = useAuthStore();

    // State
    const [deliveries, setDeliveries] = useState<NearbyDeliveryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Location Hook
    const locationOptions = React.useMemo(() => ({
        targetAccuracy: 100, // Slightly looser for dashboard listing
        timeout: 10000,
    }), []);

    const {
        location: userLocation,
        fetchLocation,
        error: locationError,
    } = useLocation(locationOptions);

    const isMounted = useRef(true);

    // Fetch Logic
    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        setError(null);

        try {
            // 1. Get Location
            let loc = userLocation;
            if (!loc) {
                loc = await fetchLocation();
            }

            if (!loc) {
                if (locationError) {
                    throw new Error(locationError.message || 'Location access required');
                }
                throw new Error('Unable to get current location');
            }

            // 2. Call API
            const response = await getNearbyDeliveries({
                latitude: loc.latitude,
                longitude: loc.longitude,
                maxDistance: 10000, // 10km radius
                limit: 20
            });

            if (isMounted.current) {
                setDeliveries(response.deliveries);
                setError(null);
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            if (isMounted.current) {
                setError(err.message || 'Failed to load deliveries');
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [userLocation, fetchLocation, locationError]);

    // Stable Fetch Reference to prevent loops
    const fetchDataRef = useRef(fetchData);
    fetchDataRef.current = fetchData;

    // Cleanup on unmount
    React.useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Lifecycle: Focus & Interval
    useFocusEffect(
        useCallback(() => {
            // Initial fetch
            fetchDataRef.current();

            // Auto refresh every 20s
            const interval = setInterval(() => {
                fetchDataRef.current(true);
            }, 20000);

            return () => {
                clearInterval(interval);
            };
        }, []) // Stable callback
    );

    /* ---------------- Handlers ---------------- */
    const handleStartDelivery = (order: NearbyDeliveryItem) => {
        navigation.navigate('DeliveryExecution', {
            delivery: order,
        });
    };

    /* ---------------- Stats Calculation ---------------- */
    const stats = {
        pendingCount: deliveries.filter(d => d.status === 'PENDING' || d.status === 'READY_TO_DISPATCH').length,
        completedCount: deliveries.filter(d => d.status === 'DELIVERED').length
    };

    /* ---------------- Stats Card ---------------- */
    const renderStat = (
        title: string,
        value: string,
        borderColor: string,
    ) => (
        <View style={[styles.statCard, { borderLeftColor: borderColor }]}>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );

    /* ---------------- Order Card ---------------- */
    const renderOrder = ({ item }: { item: NearbyDeliveryItem }) => (
        <View style={styles.orderCard}>

            {/* Glass Effect */}
            {Platform.OS === 'ios' ? (
                <View style={styles.iosBlur} />
            ) : (
                <View style={styles.androidGlass} />
            )}

            <View style={styles.cardContent}>

                {/* Header */}
                <View style={styles.orderHeader}>

                    <View style={styles.userRow}>
                        <View style={styles.avatarBox}>
                            <Icon name="account" size={26} color={colors.primary} />
                        </View>

                        <View>
                            <Text style={styles.userName}>{item.customerName}</Text>

                            <View style={styles.statusRow}>
                                <View style={[
                                    styles.pulseDot,
                                    { backgroundColor: item.priority === 'URGENT' ? colors.error : '#f59e0b' }
                                ]} />
                                <Text style={[
                                    styles.pendingText,
                                    { color: item.priority === 'URGENT' ? colors.error : '#f59e0b' }
                                ]}>
                                    {item.status === 'HANDED_OVER' ? 'Out for Delivery' :
                                        item.status === 'DELIVERED' ? 'Completed' :
                                            (item.status === 'PENDING' || item.status === 'PREPARING') ? 'Pending Delivery' :
                                                item.status.replace(/_/g, ' ')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>
                            #{item.id.slice(-4)}
                        </Text>
                    </View>

                </View>

                {/* Details */}
                <View style={styles.details}>

                    <View style={styles.detailRow}>
                        <Icon name="silverware-fork-knife" size={16} color="#999" />
                        <Text style={styles.detailText}>
                            {item.mealName || item.mealType}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="map-marker" size={16} color="#999" />
                        <Text style={styles.detailText} numberOfLines={1}>
                            {item.address.street}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="navigation" size={16} color={colors.primary} />
                        <Text style={[styles.detailText, { color: colors.primary, fontFamily: fonts.bold }]}>
                            {formatDistance(item.distance)} away
                        </Text>
                    </View>

                </View>

                {/* Actions */}
                <View style={styles.actions}>

                    <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() => handleStartDelivery(item)}
                    >
                        <Text style={styles.verifyText}>Start Delivery</Text>
                        <Icon name="arrow-right" size={20} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.callBtn}>
                        <Icon name="phone" size={20} color="#ddd" />
                    </TouchableOpacity>

                </View>

            </View>
        </View>
    );

    /* ---------------- Main UI ---------------- */
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.date}>{user?.name || 'Partner'}</Text>
                </View>

                {/* Profile */}
                <LinearGradient
                    colors={[colors.primary, '#FFB36B']}
                    style={styles.profileRing}
                >
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/200' }}
                        style={styles.profilePic}
                    />
                </LinearGradient>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                {renderStat('PENDING', stats.pendingCount.toString(), '#f59e0b')}
                {renderStat('COMPLETED', stats.completedCount.toString(), '#22c55e')}
            </View>

            {/* Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nearby Deliveries</Text>
                <Icon name="tune" size={22} color="#888" />
            </View>

            {/* Content Body */}
            {isLoading && !isRefreshing ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Finding nearby orders...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerBox}>
                    <Icon name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={styles.errorText}>Unable to load deliveries. Please try again.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : deliveries.length === 0 ? (
                <View style={styles.centerBox}>
                    <Icon name="map-marker-outline" size={32} color="#555" />
                    <Text style={styles.emptyText}>No active deliveries nearby</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
                        <Text style={styles.retryText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={deliveries}
                    renderItem={renderOrder}
                    keyExtractor={i => i.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 160 }}
                    refreshing={isRefreshing}
                    onRefresh={() => fetchData(true)}
                />
            )}
        </View>
    );
};

export default DashboardScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0F1115',
        paddingHorizontal: 24,
    },

    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 24,
    },

    title: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: '#fff',
    },

    date: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        fontFamily: fonts.medium,
    },

    profileRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        padding: 2,
    },

    profilePic: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#0F1115',
    },

    /* Stats */
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
        justifyContent: 'center',
    },

    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 18,
        padding: 14,
        borderLeftWidth: 4,
    },

    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: fonts.semiBold,
    },

    statValue: {
        fontSize: 22,
        fontFamily: fonts.bold,
        color: '#fff',
        marginTop: 4,
    },

    /* Section */
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },

    iosBlur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    androidGlass: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    /* Orders */
    orderCard: {
        borderRadius: 28,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    cardContent: {
        padding: 20,
    },

    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    userRow: {
        flexDirection: 'row',
        gap: 12,
    },

    avatarBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },

    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    pendingText: {
        fontSize: 12,
        fontWeight: '600',
    },

    idBadge: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    idText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: fonts.bold,
    },

    details: {
        gap: 6,
        marginBottom: 16,
    },

    detailRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },

    detailText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: fonts.regular,
    },

    boldText: {
        color: '#fff',
        fontFamily: fonts.semiBold,
    },

    /* Actions */
    actions: {
        flexDirection: 'row',
        gap: 12,
    },

    verifyBtn: {
        flex: 1,
        height: 48,
        backgroundColor: colors.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,

        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },

    verifyText: {
        color: '#000',
        fontWeight: '700',
    },

    callBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* States */
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        paddingBottom: 40,
    },

    loadingText: {
        color: '#888',
        marginTop: 16,
        fontFamily: fonts.medium,
    },

    errorText: {
        color: colors.error,
        marginTop: 12,
        fontFamily: fonts.medium,
        textAlign: 'center',
        maxWidth: 250,
    },

    emptyText: {
        color: '#666',
        marginTop: 12,
        fontFamily: fonts.medium,
    },

    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },

    retryText: {
        color: '#fff',
        fontFamily: fonts.semiBold,
    },

});
