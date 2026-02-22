import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, Dimensions, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import BootSplash from "react-native-bootsplash";

// Logo copied from the main app
import LogoSvg from "../../assets/splash/aaharlyName.svg";

const { width } = Dimensions.get("window");

const SplashIntroScreen = () => {
    const navigation = useNavigation<any>();

    // Animation Values exactly like main app
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateXAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        // Hide bootsplash once the JS splash maps directly on top
        BootSplash.hide({ fade: true });

        // Parallel animation matching the main app
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200, // Smooth fade
                useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
                toValue: 0,
                duration: 1000, // Smooth slide
                useNativeDriver: true,
            }),
        ]).start();

        // Timeout duration matches exactly 5000ms from main app
        const timeout = setTimeout(() => {
            // Keeping delivery app Auth logic pattern mock intact
            const hasToken = false;
            const targetScreen = hasToken ? 'MainTabs' : 'Login';

            // Navigation Reset
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: targetScreen }],
                })
            );
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigation, fadeAnim, translateXAnim]);

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateX: translateXAnim }],
                    },
                ]}
            >
                <LogoSvg width={width * 0.6} height={100} />
            </Animated.View>
        </SafeAreaView>
    );
};

export default SplashIntroScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FF622E",
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});
