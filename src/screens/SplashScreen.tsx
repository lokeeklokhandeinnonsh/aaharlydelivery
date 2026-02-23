import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Logo from '../../assets/logoinsplash.svg';
import SplashBackground from '../../assets/splash.svg';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
    const translateX = useRef(new Animated.Value(width)).current;
    const isHidingRef = useRef(false);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 95,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished && !isHidingRef.current) {
                isHidingRef.current = true;
                setTimeout(() => {
                    BootSplash.hide({ fade: true }).then(() => {
                        navigation.replace('Home');
                    });
                }, 150);
            }
        });
    }, [translateX, navigation]);

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                <SplashBackground width="100%" height="100%" preserveAspectRatio="none" />
            </View>
            <Animated.View style={[styles.logoContainer, { transform: [{ translateX }] }]}>
                <Logo width={204} height={86} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    logoContainer: {
        position: 'absolute',
        top: 383,
        left: 0,
        width: 204,
        height: 86,
    },
});

export default SplashScreen;
