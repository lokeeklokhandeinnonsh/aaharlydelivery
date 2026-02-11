/**
 * DeliverySuccessScreen - GPS-Verified Delivery Confirmation
 * 
 * Phase 1: GPS-only verification display (OTP and Photo removed).
 * Shows success animation with GPS verification badge.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    Platform,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const { width } = Dimensions.get('window');

// ============================================================================
// Types - Updated for GPS-only verification
// ============================================================================

interface DeliverySuccessParams {
    orderId: string;
    customerName: string;
    address: string;
    timestamp: string;
    gpsVerified: boolean;  // Only GPS verification in Phase 1
}

type RouteParams = RouteProp<{ params: DeliverySuccessParams }, 'params'>;

// ============================================================================
// Component
// ============================================================================

const DeliverySuccessScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<RouteParams>();
    const params = route.params || {
        orderId: "#0000",
        customerName: "Customer",
        address: "Delivery Address",
        timestamp: new Date().toLocaleString(),
        gpsVerified: true
    };

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Validation - GPS must be verified to reach this screen
        if (!params.gpsVerified) {
            // Redirect back to verify if somehow reached without verification
            navigation.replace('Verify');
            return;
        }

        // Pulse Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotation for halo (subtle)
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Fade In Content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

    }, []);

    const handleDashboard = () => {
        // Reset navigation stack to dashboard
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    const handleNextDelivery = () => {
        // Navigate to next pending delivery
        // In a real app, this would fetch the next order ID
        navigation.navigate('MainTabs', { screen: 'Dashboard' });
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#1a120b', '#0F1115']}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                style={styles.background}
            />

            {/* Floating Particles */}
            <View style={[styles.particle, { top: '10%', left: '10%', opacity: 0.3 }]} />
            <View style={[styles.particle, { top: '20%', right: '15%', opacity: 0.2 }]} />
            <View style={[styles.particle, { bottom: '30%', left: '20%', opacity: 0.2 }]} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleDashboard}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DELIVERY COMPLETE</Text>
                <View style={{ width: 44 }} />
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.content}
                style={{ opacity: fadeAnim }}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Halo */}
                <View style={styles.haloContainer}>
                    <Animated.View style={[styles.haloPulse, { transform: [{ scale: pulseAnim }] }]}>
                        <LinearGradient
                            colors={['rgba(34, 197, 94, 0.2)', 'rgba(249, 115, 22, 0.2)']}
                            style={styles.haloGradient}
                        />
                    </Animated.View>
                    <View style={styles.haloCircle}>
                        <LinearGradient
                            colors={['#22C55E', '#F97316']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.haloInner}
                        >
                            <Icon name="check" size={40} color="#fff" />
                        </LinearGradient>
                    </View>
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Delivery Successful!</Text>
                    <Text style={styles.subTitle}>Order verified and completed via GPS</Text>
                </View>

                {/* Glass Info Card */}
                <View style={styles.cardContainer}>
                    {Platform.OS === 'ios' ? (
                        <BlurView
                            style={styles.absoluteBlur}
                            blurType="dark"
                            blurAmount={15}
                        />
                    ) : (
                        <View style={styles.androidBlurFallback} />
                    )}

                    <View style={styles.cardContent}>
                        {/* Header Row */}
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardLabel}>CUSTOMER</Text>
                                <Text style={styles.cardValue}>{params.customerName}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.cardLabel}>ORDER ID</Text>
                                <Text style={[styles.cardValue, { color: '#F97316' }]}>{params.orderId}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Details */}
                        <View style={styles.detailRow}>
                            <View style={styles.iconBox}>
                                <Icon name="calendar-clock" size={18} color="rgba(255,255,255,0.7)" />
                            </View>
                            <Text style={styles.detailText}>{params.timestamp}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.iconBox}>
                                <Icon name="map-marker" size={18} color="rgba(255,255,255,0.7)" />
                            </View>
                            <Text style={styles.detailText}>{params.address}</Text>
                        </View>

                        {/* GPS Verification Badge - Only GPS in Phase 1 */}
                        <View style={styles.pillsRow}>
                            <View style={[styles.pill, params.gpsVerified && styles.pillVerified]}>
                                <Icon
                                    name="check-circle"
                                    size={14}
                                    color={params.gpsVerified ? "#22C55E" : "#666"}
                                />
                                <Text style={styles.pillText}>GPS Verified</Text>
                            </View>
                        </View>

                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleDashboard}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#F97316', '#EA580C']}
                            style={styles.btnGradient}
                        >
                            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={handleNextDelivery}
                        activeOpacity={0.8}
                    >
                        <View style={styles.secondaryBtnContent}>
                            <Text style={styles.secondaryBtnText}>Next Delivery</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>
                    Thank you for delivering with <Text style={{ color: '#F97316' }}>AAHARLY</Text>
                </Text>

            </Animated.ScrollView>
        </View>
    );
};

export default DeliverySuccessScreen;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1115',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    particle: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#F97316',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: fonts.bold,
        color: '#fff',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
        paddingBottom: 40,
    },
    /* Halo */
    haloContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        height: 120,
        width: 120,
    },
    haloPulse: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    haloGradient: {
        flex: 1,
        borderRadius: 70,
        opacity: 0.5,
    },
    haloCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    haloInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* Title */
    titleSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: fonts.bold,
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    /* Glass Card */
    cardContainer: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(21, 25, 30, 0.4)',
        marginBottom: 32,
    },
    absoluteBlur: {
        ...StyleSheet.absoluteFillObject,
    },
    androidBlurFallback: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(21, 25, 30, 0.9)',
    },
    cardContent: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cardLabel: {
        fontSize: 11,
        fontFamily: fonts.medium,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    cardValue: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailText: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: 'rgba(255,255,255,0.8)',
        flex: 1,
    },
    pillsRow: {
        flexDirection: 'row',
        marginTop: 8,
        justifyContent: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(100, 100, 100, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 100, 0.3)',
    },
    pillVerified: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    pillText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: '#fff',
        marginLeft: 8,
    },
    /* Actions */
    actionContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 32,
    },
    primaryBtn: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: '#fff',
    },
    secondaryBtn: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    secondaryBtnContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: '#fff',
    },
    footerText: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: 'rgba(255,255,255,0.4)',
    },
});
