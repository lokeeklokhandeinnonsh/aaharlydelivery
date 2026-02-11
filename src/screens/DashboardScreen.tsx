import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Platform } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { mockOrders, Order } from '../data/mockOrders';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const DashboardScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

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
    const renderOrder = ({ item }: { item: Order }) => (
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
                            <Text style={styles.userName}>{item.name}</Text>

                            <View style={styles.statusRow}>
                                <View style={styles.pulseDot} />
                                <Text style={styles.pendingText}>
                                    Pending Delivery
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>
                            ID #{item.id.slice(-4)}
                        </Text>
                    </View>

                </View>

                {/* Details */}
                <View style={styles.details}>

                    <View style={styles.detailRow}>
                        <Icon name="silverware-fork-knife" size={16} color="#999" />
                        <Text style={styles.detailText}>
                            {item.meal} • <Text style={styles.boldText}>{item.slot}</Text>
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="map-marker" size={16} color="#999" />
                        <Text style={styles.detailText}>{item.address}</Text>
                    </View>

                </View>

                {/* Actions */}
                <View style={styles.actions}>

                    <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() =>
                            navigation.navigate('OrderDetails', {
                                orderId: item.id,
                            })
                        }
                    >
                        <Text style={styles.verifyText}>Verify Delivery</Text>
                        <Icon name="qrcode-scan" size={20} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.callBtn}>
                        <Icon name="phone" size={20} color="#ddd" />
                    </TouchableOpacity>

                </View>

            </View>
        </View>
    );

    /* ---------------- UI ---------------- */
    return (
        <View style={styles.container}>

            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>

                <View>
                    <Text style={styles.title}>Ravet Kitchen</Text>
                    <Text style={styles.date}>6 FEB 2026</Text>
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
                {renderStat('TOTAL', '12', '#999')}
                {renderStat('PENDING', '5', '#f59e0b')}
                {renderStat('DONE', '7', '#22c55e')}
            </View>

            {/* Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Live Orders</Text>
                <Icon name="tune" size={22} color="#888" />
            </View>

            {/* Orders */}
            <FlatList
                data={mockOrders}
                renderItem={renderOrder}
                keyExtractor={i => i.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 160 }}
            />

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
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        letterSpacing: 1,
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
        backgroundColor: '#f59e0b',
    },

    pendingText: {
        fontSize: 12,
        color: '#f59e0b',
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

});
