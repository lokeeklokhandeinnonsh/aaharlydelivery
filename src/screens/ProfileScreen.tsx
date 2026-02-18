import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuthStore();

    const MenuItem = (icon: string, title: string, subtitle: string, onPress?: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIcon}>
                <Icon name={icon} size={22} color={colors.primary} />
            </View>

            <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>

            <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
    );

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>


            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Partner Profile</Text>

                <TouchableOpacity style={styles.headerBtn}>
                    <Icon name="cog" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Profile */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarBorder}>
                            <Image
                                source={{
                                    uri: 'https://i.pravatar.cc/300',
                                }}
                                style={styles.avatar}
                            />
                        </View>

                        <View style={styles.onlineDot} />
                    </View>

                    <Text style={styles.name}>{user?.name || 'Delivery Partner'}</Text>

                    <View style={styles.companyRow}>
                        <Icon name="storefront" size={14} color={colors.primary} />
                        <Text style={styles.company}> Ravet Kitchen</Text>
                    </View>

                    <Text style={styles.partnerId}>PARTNER ID: #{user?.id?.substring(0, 6).toUpperCase() || '7721'}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Icon name="moped" size={22} color={colors.primary} />
                        <Text style={styles.statValue}>1,250</Text>
                        <Text style={styles.statLabel}>ORDERS</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Icon name="star" size={22} color={colors.primary} />
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>RATING</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Icon name="clock-outline" size={22} color={colors.primary} />
                        <Text style={styles.statValue}>142h</Text>
                        <Text style={styles.statLabel}>HOURS</Text>
                    </View>
                </View>

                {/* Section */}
                <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>

                {/* Menu */}
                <View style={styles.menuContainer}>
                    {MenuItem('chart-bar', 'My Performance', 'Weekly earnings & insights')}
                    {MenuItem('car', 'Vehicle Info', 'Documents & registration')}
                    {MenuItem('wallet', 'Payouts', 'Settlement history')}
                    {MenuItem('headset', 'Help & Support', 'FAQs & live chat', () => navigation.navigate('HelpSupport'))}
                </View>

                {/* Logout */}
                <View style={[styles.footer, { paddingBottom: 40 + insets.bottom }]}>
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                    >
                        <View style={styles.logoutIcon}>
                            <Icon name="logout" size={20} color="#f87171" />
                        </View>

                        <Text style={styles.logoutText}>Logout Profile</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>V2.4.1 STABLE BUILD</Text>
                </View>

            </ScrollView>
        </View>
    );
};

export default ProfileScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0705',
    },



    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: '#fff',
    },

    /* Profile */
    profileSection: {
        alignItems: 'center',
        marginTop: 20,
    },

    avatarWrapper: {
        position: 'relative',
    },

    avatarBorder: {
        width: 130,
        height: 130,
        borderRadius: 65,
        padding: 3,
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },

    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },

    onlineDot: {
        position: 'absolute',
        bottom: 4,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#22c55e',
        borderWidth: 3,
        borderColor: '#0a0705',
    },

    name: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: '#fff',
        marginTop: 16,
    },

    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    company: {
        color: 'rgba(255,255,255,0.8)',
        fontFamily: fonts.medium,
    },

    partnerId: {
        fontSize: 11,
        letterSpacing: 2,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 6,
        fontFamily: fonts.bold,
    },

    /* Stats */
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 28,
    },

    statCard: {
        width: '30%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },

    statValue: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: '#fff',
        marginTop: 4,
    },

    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
        fontFamily: fonts.bold,
    },

    /* Section */
    sectionLabel: {
        marginTop: 32,
        marginLeft: 24,
        marginBottom: 12,
        fontSize: 12,
        letterSpacing: 2,
        fontFamily: fonts.bold,
        color: 'rgba(255,255,255,0.4)',
    },

    /* Menu */
    menuContainer: {
        paddingHorizontal: 20,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },

    menuIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,121,26,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    menuText: {
        flex: 1,
    },

    menuTitle: {
        fontSize: 15,
        color: '#fff',
        fontFamily: fonts.semiBold,
    },

    menuSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
        fontFamily: fonts.regular,
    },

    /* Footer */
    footer: {
        padding: 20,
        paddingBottom: 40,
        marginTop: 16,
    },

    logoutBtn: {
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.2)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    logoutIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(248,113,113,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    logoutText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: '#f87171',
    },

    version: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 10,
        letterSpacing: 3,
        color: 'rgba(255,255,255,0.2)',
        fontFamily: fonts.medium,
    },
});
