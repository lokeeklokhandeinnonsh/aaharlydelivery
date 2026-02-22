import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Animated,
    PanResponder,
    Dimensions,
    Image
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { completeDelivery, updateDeliveryStatus, NearbyDeliveryItem } from '../services/api/deliveryApi';

const { width } = Dimensions.get('window');

const DeliveryExecutionScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();

    // Receive full delivery object from Dashboard
    const delivery: NearbyDeliveryItem = route.params?.delivery;

    // Fallback if accessed incorrectly
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
        mealName,
        mealType,
        planName
    } = delivery as any;

    const targetLat = delivery.address?.lat || 0;
    const targetLng = delivery.address?.lng || 0;

    // State
    const [isCompleting, setIsCompleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Slider Setup
    const slideAnim = useRef(new Animated.Value(0)).current;
    const SLIDER_WIDTH = width - 40;
    const THUMB_SIZE = 56;
    const MAX_SLIDE = SLIDER_WIDTH - THUMB_SIZE - 6;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setErrorMsg(null);
            },
            onPanResponderMove: (evt, gestureState) => {
                if (!isCompleting) {
                    let newX = gestureState.dx;
                    if (newX < 0) newX = 0;
                    if (newX > MAX_SLIDE) newX = MAX_SLIDE;
                    slideAnim.setValue(newX);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (isCompleting) return;

                if (gestureState.dx > MAX_SLIDE * 0.8) {
                    // Trigger completion
                    Animated.timing(slideAnim, {
                        toValue: MAX_SLIDE,
                        duration: 150,
                        useNativeDriver: false,
                    }).start();
                    handleCompleteDelivery();
                } else {
                    // Snap back
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        friction: 5,
                        tension: 40,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    const handleCall = () => {
        if (customerPhone) {
            Linking.openURL(`tel:${customerPhone}`);
        }
    };

    const handleNavigate = () => {
        let url = '';
        if (targetLat !== 0 && targetLng !== 0) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
        } else {
            const label = encodeURIComponent(delivery.address?.street || '');
            url = `https://www.google.com/maps/dir/?api=1&destination=${label}`;
        }
        Linking.openURL(url);
    };

    const handleCompleteDelivery = async () => {
        setIsCompleting(true);
        setErrorMsg(null);

        try {
            if (['PENDING', 'PREPARING', 'READY_TO_DISPATCH'].includes(delivery.status)) {
                try {
                    await updateDeliveryStatus(orderId, 'HANDED_OVER');
                } catch (e) {
                    console.error('Error pre-updating status', e);
                }
            }

            const response = await completeDelivery(orderId, {
                completionLatitude: targetLat,
                completionLongitude: targetLng,
                completedAt: new Date().toISOString()
            });

            if (response && response.success) {
                setTimeout(() => {
                    navigation.navigate('DeliverySuccess', {
                        orderId: orderId,
                        customerName: customerName,
                        gpsVerified: false
                    });
                }, 2000);
            } else {
                throw new Error("API returned failure");
            }
        } catch (err: any) {
            console.error('Completion Error:', err);
            // Snap back on error
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 5,
                useNativeDriver: false,
            }).start();
            setIsCompleting(false);
            setErrorMsg("Failed to complete delivery. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Customer Pill Card */}
                <View style={styles.customerCard}>
                    <View style={styles.customerInfo}>
                        <TouchableOpacity onPress={handleCall} style={styles.callButtonLarge}>
                            <Icon name="phone" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.customerName}>{customerName}</Text>
                            <View style={styles.badgeRow}>
                                <Text style={styles.badgeText}>{delivery.priority === 'URGENT' ? 'URGENT ORDER' : 'PREMIUM CUSTOMER'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Delivery Address Section */}
                <View style={styles.addressCard}>
                    <View style={styles.addressHeaderRow}>
                        <Icon name="map-marker" size={16} color="#D97706" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>
                    </View>

                    <Text style={styles.addressText}>{delivery.address?.street}</Text>

                    {/* Static Map Container */}
                    <View style={styles.mapContainer}>
                        <Image source={{ uri: 'https://i.imgur.com/gK9fIap.jpeg' }} style={styles.mapImage} />

                        <View style={styles.mapOverlay}>
                            {/* Navigation Button */}
                            <TouchableOpacity onPress={handleNavigate} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#FF791A', '#EA580C']} // Primary Orange Gradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.navigateButton}
                                >
                                    <Icon name="navigation" size={20} color={colors.white} style={{ marginRight: 8 }} />
                                    <Text style={styles.navigateButtonText}>NAVIGATE</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Meal Details Section */}
                <View style={styles.mealCard}>
                    <View style={styles.addressHeaderRow}>
                        <Icon name="clipboard-text-outline" size={16} color="#D97706" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionLabel}>ORDER DETAILS</Text>
                    </View>

                    <View style={styles.mealDetailsContainer}>
                        <View style={styles.mealDetailsCol}>
                            <Icon name="arrow-expand" size={16} color="#D97706" style={{ marginRight: 6 }} />
                            <Text style={styles.mealDetailLabel}>PLAN: </Text>
                            <Text style={styles.mealDetailValue}>{planName || mealType || '7-Day Weight Loss'}</Text>
                        </View>

                        <View style={styles.mealDetailsCol}>
                            <Icon name="food-fork-drink" size={16} color="#D97706" style={{ marginRight: 6 }} />
                            <Text style={styles.mealDetailLabel}>MEAL: </Text>
                            <Text style={styles.mealDetailValue}>{mealName || 'Paneer Bowl'}</Text>
                        </View>

                        <View style={styles.mealDetailsCol}>
                            <Icon name="clock-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                            <Text style={styles.mealDetailLabel}>SLOT: </Text>
                            <Text style={styles.mealDetailValue}>12:00 PM - 2:00 PM</Text>
                        </View>
                    </View>
                </View>

                {errorMsg && (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                )}
            </ScrollView>

            {/* Slider Button */}
            <View style={styles.footer}>
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderTextText}>SLIDE TO COMPLETE</Text>
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.sliderThumb,
                            { transform: [{ translateX: slideAnim }] }
                        ]}
                    >
                        {isCompleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Icon name="chevron-right" size={28} color="#fff" />
                        )}
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

export default DeliveryExecutionScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#131110' },
    center: { justifyContent: 'center', alignItems: 'center' },
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
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        paddingBottom: 120,
    },
    customerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1C1917',
        borderRadius: 50,
        padding: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    customerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatarLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFB36B',
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
        backgroundColor: 'rgba(217, 119, 6, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4
    },
    badgeText: { color: '#D97706', fontSize: 10, fontFamily: fonts.semiBold },
    callButtonLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4
    },
    addressCard: {
        backgroundColor: '#1C1917',
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    addressHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
    sectionLabel: { fontSize: 12, fontFamily: fonts.bold, color: '#A8A29E', letterSpacing: 1 },
    addressText: { color: colors.white, fontSize: 16, fontFamily: fonts.regular, lineHeight: 24, marginBottom: 20 },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#2A2F35',
    },
    mapImage: { width: '100%', height: '100%', opacity: 0.9 },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navigateButton: {
        paddingHorizontal: 24,
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    navigateButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
    mealCard: {
        backgroundColor: '#1C1917',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    mealDetailsContainer: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16 },
    mealDetailsCol: { flexDirection: 'row', alignItems: 'center' },
    mealDetailLabel: { color: '#D4D4D8', fontSize: 14, marginRight: 4, fontFamily: fonts.bold },
    mealDetailValue: { color: colors.white, fontSize: 14, fontFamily: fonts.regular },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    sliderContainer: {
        height: 64,
        backgroundColor: '#292524',
        borderRadius: 32,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    sliderTextText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        position: 'absolute',
        width: '100%',
    },
    sliderThumb: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 4,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 16,
        fontFamily: fonts.semiBold
    }
});
