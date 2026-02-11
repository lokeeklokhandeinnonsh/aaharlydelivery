import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

interface GlowButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    colors?: string[];
}

export const GlowButton = ({
    title,
    onPress,
    loading = false,
    style,
    textStyle,
    colors: gradientColors = [colors.primaryGradientStart, colors.primaryGradientEnd]
}: GlowButtonProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            disabled={loading}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        // Glow effect
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
