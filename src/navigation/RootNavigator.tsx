/**
 * RootNavigator - Navigation Configuration
 * 
 * Phase 1 Update: Removed LocationCheck and PhotoProof screens.
 * Flow: Dashboard → OrderDetails → Verify → DeliverySuccess
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import DeliveryExecutionScreen from '../screens/DeliveryExecutionScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import DeliverySuccessScreen from '../screens/DeliverySuccessScreen';
import SplashIntroScreen from '../screens/SplashIntroScreen';
import BootSplash from 'react-native-bootsplash';

// Removed in Phase 1:
// import LocationCheckScreen from '../screens/LocationCheckScreen';
// import PhotoProofScreen from '../screens/PhotoProofScreen';

import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
                <Stack.Screen name="SplashIntro" component={SplashIntroScreen} />

                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="DeliveryExecution" component={DeliveryExecutionScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                <Stack.Screen name="DeliverySuccess" component={DeliverySuccessScreen} />
                {/* 
                  Phase 1: GPS-only verification 
                  Removed screens:
                  - LocationCheck (merged into Verify)
                  - PhotoProof (not needed in Phase 1)
                */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
