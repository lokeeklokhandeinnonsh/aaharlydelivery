import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProximityIndicatorProps {
    distance: number | null;
    radius: number;
}

const MAX_ANIMATION_DISTANCE = 200;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.2; // Slightly smaller than VerifyScreen for embedded view

const ProximityIndicator: React.FC<ProximityIndicatorProps> = ({ distance, radius }) => {
    // If distance is null, assume far away
    const currentDistance = distance ?? MAX_ANIMATION_DISTANCE;
    const isWithinRange = currentDistance <= radius;

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const distanceAnim = useRef(new Animated.Value(MAX_ANIMATION_DISTANCE)).current;

    useEffect(() => {
        // Continuous pulse loop
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    useEffect(() => {
        // Animate based on distance
        Animated.timing(distanceAnim, {
            toValue: Math.min(Math.max(currentDistance, 0), MAX_ANIMATION_DISTANCE),
            duration: 500,
            useNativeDriver: false, // Color interpolation might need false depending on RN version, but scale useNativeDriver: true. 
            // We use standard Animated, usually color supports native driver? No, color often requires false.
            // But here we are driving values that will be interpolated.
            // Let's use false to be safe for color interpolation if we drive style props directly?
            // Actually, we interpolate logic in render.
            // Let's try native driver true where possible.
        }).start();
    }, [currentDistance]);

    // Interpolations
    const circleScale = distanceAnim.interpolate({
        inputRange: [0, radius, MAX_ANIMATION_DISTANCE],
        outputRange: [MIN_SCALE, 0.8, MAX_SCALE],
        extrapolate: 'clamp'
    });

    const circleOpacity = distanceAnim.interpolate({
        inputRange: [0, radius, MAX_ANIMATION_DISTANCE],
        outputRange: [1, 0.8, 0.3],
        extrapolate: 'clamp'
    });

    const circleColor = distanceAnim.interpolate({
        inputRange: [0, radius * 0.5, radius, MAX_ANIMATION_DISTANCE],
        outputRange: ['#22C55E', '#22C55E', '#FF791A', 'rgba(255,255,255,0.2)'],
        extrapolate: 'clamp'
    });

    const glowIntensity = distanceAnim.interpolate({
        inputRange: [0, radius],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.container}>
            {/* Outer Ring */}
            <Animated.View style={[
                styles.proximityCircle,
                {
                    transform: [{ scale: circleScale }],
                    opacity: circleOpacity,
                    borderColor: circleColor,
                    backgroundColor: isWithinRange ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 121, 26, 0.05)'
                }
            ]} />

            {/* Inner Core */}
            <Animated.View style={[
                styles.pulseCore,
                {
                    transform: [{ scale: pulseAnim }],
                    shadowOpacity: glowIntensity,
                }
            ]}>
                <View style={[styles.iconCore, isWithinRange && styles.iconCoreSuccess]}>
                    <Icon name={isWithinRange ? "check" : "map-marker"} size={24} color="#fff" />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    proximityCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseCore: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#FF791A",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 5,
    },
    iconCore: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF791A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCoreSuccess: {
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
    },
});

export default ProximityIndicator;
