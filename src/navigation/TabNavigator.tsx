import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    elevation: 10,
                    height: 80,
                    paddingBottom: 0,
                    backgroundColor: '#1A1E23', // Dark Card color
                    borderColor: colors.cardBorder,
                    borderTopWidth: 1, // Add top border for separation since it's docked
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 }, // Shadow upwards
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontFamily: fonts.bold,
                    marginTop: 0,
                    marginBottom: 15,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarItemStyle: {
                    height: 80,
                    paddingTop: 15,
                }
            }}
        >
            <Tab.Screen
                name="Dash" // Short name
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon name={focused ? "view-grid" : "view-grid-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="History"
                component={PlaceholderScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon name={focused ? "clock-time-four" : "clock-time-four-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Map"
                component={PlaceholderScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon name={focused ? "map" : "map-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Settings"
                component={ProfileScreen}
                options={{
                    tabBarStyle: { display: "none" }, // Hide tab bar on Profile Screen
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon name={focused ? "cog" : "cog-outline"} size={24} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
