import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Animated,
    Platform,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors'; // Using existing theme for consistency where possible
import { fonts } from '../theme/fonts';

const { width } = Dimensions.get('window');

const HelpSupportScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // Animation for typing dots
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateDot = (dot: any, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: -4,
                        duration: 400,
                        delay: delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animateDot(dot1, 0);
        animateDot(dot2, 200);
        animateDot(dot3, 400);
    }, []);


    const QuickAction = ({ icon, label, color, delay }: { icon: string, label: string, color: string, delay: number }) => (
        <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#160d08', '#23170f', '#0a0705']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />



            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Icon name="bell" size={22} color="#fff" />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >

                {/* Active Ticket Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Support Ticket</Text>
                    <Text style={styles.statusText}>IN PROGRESS</Text>
                </View>

                <View style={styles.glassCard}>
                    <View style={styles.ticketHeader}>
                        <View>
                            <Text style={styles.ticketLabel}>TICKET ID</Text>
                            <Text style={styles.ticketId}>#9923</Text>
                        </View>
                        <View style={styles.openBadge}>
                            <Text style={styles.openBadgeText}>OPEN</Text>
                        </View>
                    </View>

                    <Text style={styles.ticketDesc}>
                        "The pickup location is blocked by construction, need alternative route guidance for the delivery."
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={styles.progressFill} />
                        </View>
                        <Text style={styles.lastUpdated}>Last updated 12m ago</Text>
                    </View>
                </View>

                {/* Live Support Chat Preview */}
                <Text style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>Live Support</Text>

                <View style={[styles.glassCard, styles.chatPreview]}>
                    <Text style={styles.agentName}>Agent Sarah</Text>

                    {/* Agent Message */}
                    <View style={styles.agentMsgRow}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?u=sarah' }}
                            style={styles.avatar}
                        />
                        <View style={styles.agentBubble}>
                            <Text style={styles.msgText}>
                                Hello! I'm reviewing your ticket for Order #9923. Could you please send a photo of the blocked entrance?
                            </Text>
                        </View>
                    </View>

                    {/* User Message */}
                    <View style={styles.userMsgRow}>
                        <LinearGradient
                            colors={['#FF7F36', '#FF9554']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.userBubble}
                        >
                            <Text style={[styles.msgText, { color: '#fff' }]}>
                                Sure, just a second. I'm arriving at the scene now.
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Typing Indicator */}
                    <View style={styles.typingRow}>
                        <View style={styles.typingDots}>
                            <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
                            <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
                            <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
                        </View>
                        <Text style={styles.typingText}>Sarah is typing...</Text>
                    </View>
                </View>


                {/* Quick Actions Grid */}
                <View style={styles.gridContainer}>
                    <QuickAction icon="help-circle-outline" label="FAQs" color="#F59E0B" delay={0} />
                    <QuickAction icon="phone-outline" label="Call Support" color="#3B82F6" delay={100} />
                    <QuickAction icon="gavel" label="Raise Dispute" color="#EF4444" delay={200} />
                    <QuickAction icon="history" label="Past Tickets" color="#22C55E" delay={300} />
                </View>

                {/* Raise New Ticket */}
                <TouchableOpacity style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>Raise New Ticket</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom CTA */}
            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity style={styles.ctaButtonWrapper}>
                    <LinearGradient
                        colors={['#FF7F36', '#FF9554']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.ctaButton}
                    >
                        <Icon name="chat-processing" size={24} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.ctaText}>Start Live Chat</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0705',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 10,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: '#fff',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#15191E',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: '#fff',
    },
    statusText: {
        fontSize: 11,
        fontFamily: fonts.bold,
        color: '#F59E0B',
        letterSpacing: 1,
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    ticketLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
        fontFamily: fonts.bold,
        marginBottom: 4,
    },
    ticketId: {
        fontSize: 24,
        fontFamily: fonts.extraBold,
        color: '#fff',
    },
    openBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,121,26,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,121,26,0.3)',
    },
    openBadgeText: {
        fontSize: 11,
        fontFamily: fonts.bold,
        color: '#FF7F36',
        letterSpacing: 0.5,
    },
    ticketDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: fonts.regular,
        lineHeight: 22,
        marginBottom: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginRight: 16,
    },
    progressFill: {
        width: '45%',
        height: '100%',
        backgroundColor: '#FF7F36',
        borderRadius: 2,
    },
    lastUpdated: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: fonts.medium,
    },
    /* Chat Preview */
    chatPreview: {
        paddingTop: 16,
    },
    agentName: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 8,
        marginLeft: 50,
        fontFamily: fonts.medium,
    },
    agentMsgRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginRight: 12,
    },
    agentBubble: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderTopLeftRadius: 4,
        padding: 14,
    },
    msgText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontFamily: fonts.regular,
        lineHeight: 20,
    },
    userMsgRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    userBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 16,
        borderBottomRightRadius: 4,
    },
    typingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 48,
    },
    typingDots: {
        flexDirection: 'row',
        marginRight: 8,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 2,
    },
    typingText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: fonts.medium,
    },
    /* Grid */
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 32,
    },
    quickActionCard: {
        width: '48%', // Approx half with minimal gap
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionLabel: {
        fontSize: 14,
        color: '#fff',
        fontFamily: fonts.bold,
    },
    /* Raise Ticket Btn */
    secondaryBtn: {
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#FF7F36',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: 'rgba(255, 127, 54, 0.05)',
    },
    secondaryBtnText: {
        color: '#FF7F36',
        fontSize: 15,
        fontFamily: fonts.bold,
    },
    /* Bottom CTA */
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 20,
        // Add gradient fade or blur here if desired for the sticky footer bg
    },
    ctaButtonWrapper: {
        shadowColor: '#FF7F36',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    ctaButton: {
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: fonts.bold,
    },
});
