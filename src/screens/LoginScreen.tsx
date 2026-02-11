import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Logo from '../components/Logo';
import { authApi } from '../services/api/authApi';

const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage('Please enter both email and password');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            await authApi.login({ email, password });
            // Success - Navigation handled by App.tsx typically watching auth state, 
            // but for now we manually replace.
            navigation.replace('MainTabs');
        } catch (error: any) {
            console.error('Login failed', error);
            if (error.message) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <Logo />
                    <Text style={styles.tagline}>Delivery Partner Portal</Text>
                </View>

                {/* Login Card */}
                <View style={styles.card}>
                    <Text style={styles.welcomeText}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to start your shift</Text>

                    {errorMessage ? (
                        <View style={styles.errorContainer}>
                            <Icon name="alert-circle" size={16} color="#FF4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL OR PHONE</Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.passwordHeader}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotText}>Forgot?</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#999"
                        />
                    </View>

                    <TouchableOpacity onPress={handleLogin} disabled={loading}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryGradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>LOGIN</Text>
                                    <Icon name="arrow-right" size={20} color={colors.white} style={styles.buttonIcon} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>New to the team? <Text style={styles.linkText}>Join as a Partner</Text></Text>
                    <View style={styles.divider} />
                    <Text style={styles.poweredBy}>POWERED BY AAHARLY TECH</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },

    tagline: {
        fontSize: 16,
        color: colors.textSecondary,
        fontFamily: fonts.regular,
    },
    card: {
        backgroundColor: '#1A1E23',
        borderRadius: 32,
        padding: 32,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    welcomeText: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.white,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 32,
        fontFamily: fonts.regular,
    },
    inputGroup: {
        marginBottom: 24,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    button: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonIcon: {
        marginLeft: 8,
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        width: 100,
        backgroundColor: colors.cardBorder,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontFamily: fonts.bold,
        color: colors.textSecondary,
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: colors.white,
        borderRadius: 25, // Pill shape
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        height: 56,
        borderWidth: 0,
        fontFamily: fonts.medium,
    },
    forgotText: {
        color: colors.primary,
        fontSize: 14,
        fontFamily: fonts.semiBold,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: fonts.bold,
        letterSpacing: 1,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 16,
        fontFamily: fonts.regular,
    },
    linkText: {
        color: colors.white,
        fontFamily: fonts.bold,
    },
    poweredBy: {
        fontSize: 10,
        color: colors.textSecondary,
        letterSpacing: 2,
        fontFamily: fonts.bold,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    errorText: {
        color: '#FF4444',
        marginLeft: 8,
        fontSize: 14,
        fontFamily: fonts.medium,
        flex: 1,
    },
});
