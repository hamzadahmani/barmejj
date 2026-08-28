import React from 'react';
import {StyleProp, Text, TextProps, TextStyle} from 'react-native';

export const createStyledText = (baseStyle: StyleProp<TextStyle>) => {
  return function StyledText({style, ...props}: TextProps) {
    return <Text {...props} style={[baseStyle, style]} />;
  };
};
