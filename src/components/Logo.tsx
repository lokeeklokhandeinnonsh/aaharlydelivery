import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

import LogoSvg from '../assets/logo2.svg';

interface LogoProps {
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
}

const Logo: React.FC<LogoProps> = ({
    width = 240,
    height = 80,
    style,
}) => {
    return (
        <View style={style}>
            <LogoSvg width={width} height={height} />
        </View>
    );
};

export default Logo;
