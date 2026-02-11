import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    rightIcon?: string;
    onRightPress?: () => void;
}

export const Header = ({ title, showBack, rightIcon, onRightPress }: HeaderProps) => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-left" size={24} color={colors.white} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.title}>{title}</Text>
                </View>

                {rightIcon && (
                    <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
                        <Icon name={rightIcon} size={24} color={colors.white} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.background,
    },
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    rightButton: {
        padding: 4,
        backgroundColor: colors.card,
        borderRadius: 8,
    },
});
