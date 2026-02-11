import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { colors } from '../theme/colors';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const GlassCard = ({ children, style, ...props }: GlassCardProps) => {
    return (
        <View style={[styles.card, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 16,
        // Soft shadow for depth
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});
