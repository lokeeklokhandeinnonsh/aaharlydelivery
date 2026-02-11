import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

const PlaceholderScreen = ({ route }: any) => (
    <LinearGradient colors={[colors.background, '#1e293b']} style={styles.container}>
        <Text style={styles.text}>{route.name} Screen</Text>
        <Text style={styles.subtext}>Coming Soon</Text>
    </LinearGradient>
);

export default PlaceholderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    subtext: {
        color: colors.textSecondary,
        marginTop: 8,
    },
});
