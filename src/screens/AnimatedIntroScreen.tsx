import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    withRepeat,
    withSpring,
    Easing,
    runOnJS,
    interpolate
} from 'react-native-reanimated';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Scooter from '../assets/illustrations/scooter.svg';

const { width, height } = Dimensions.get('window');

const AnimatedIntroScreen = () => {
    const navigation = useNavigation();

    // Animation Values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.85);
    const translateY = useSharedValue(40);
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const shadowOpacity = useSharedValue(0);

    const handleNavigation = async () => {
        // Mock Auth Check
        const hasToken = false;

        const targetScreen = hasToken ? 'MainTabs' : 'Login';

        // Navigation Reset
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: targetScreen }],
            })
        );
    };

    useEffect(() => {
        const sequence = async () => {
            // Hide native splash immediately
            await BootSplash.hide({ fade: true });

            // 1. Fade In Scooter (0ms - 300ms)
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { damping: 12 });
            translateY.value = withSpring(0, { damping: 12 });

            // 2. Idle Vibration (800ms)
            // Start engine vibration
            rotate.value = withDelay(800, withRepeat(
                withSequence(
                    withTiming(-1, { duration: 50 }),
                    withTiming(1, { duration: 50 }),
                    withTiming(-1, { duration: 50 }),
                    withTiming(0, { duration: 50 })
                ),
                4, // Repeat 4 times
                false
            ));

            // Shadow appears
            shadowOpacity.value = withDelay(800, withTiming(0.4, { duration: 300 }));

            // 3. Acceleration (1200ms -> 1800ms)
            // Move off screen to the right
            translateX.value = withDelay(1200, withTiming(width + 150, {
                duration: 800,
                easing: Easing.in(Easing.cubic),
            }, (finished) => {
                if (finished) {
                    runOnJS(handleNavigation)();
                }
            }));
        };

        sequence();
    }, []);

    // Styles
    const scooterStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` }
        ]
    }));

    const shadowStyle = useAnimatedStyle(() => ({
        opacity: shadowOpacity.value,
        transform: [
            { scaleX: 1.5 },
            { translateX: translateX.value } // Shadow follows scooter
        ]
    }));

    // Optional background slide effect (simplistic: fade color or move bg)
    // We'll keep it simple full orange as requested.

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF7A00" />

            <View style={styles.centerContent}>
                {/* Shadow */}
                <Animated.View style={[styles.shadow, shadowStyle]} />

                {/* Scooter */}
                <Animated.View style={scooterStyle}>
                    {/* If SVG fails, fallback to Icon? No, we created SVG. */}
                    <Scooter width={180} height={180} />
                </Animated.View>

                {/* Text */}
                <Animated.View style={[styles.textContainer, { opacity: opacity }]}>
                    <Text style={styles.title}>Aaharly Delivery Partner</Text>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF7A00', // Full orange
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadow: {
        position: 'absolute',
        bottom: 40,
        width: 100,
        height: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.2)',
        transform: [{ scaleX: 1.5 }]
    },
    textContainer: {
        marginTop: 40,
        position: 'absolute',
        bottom: -60, // Position below scooter
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        opacity: 0.9,
    },
});

export default AnimatedIntroScreen;
