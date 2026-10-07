import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/* Gabarit conservé (bottom 8 + hauteur 64) : les écrans réservent déjà cet espace. */
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_OFFSET = 8;

type IconName = 'home' | 'video' | 'calendar' | 'experience' | 'profile';

const TABS: Record<string, {icon: IconName; label: string}> = {
  Explorer: {icon: 'home', label: 'Explorer'},
  Videos: {icon: 'video', label: 'Vidéos'},
  Reservations: {icon: 'calendar', label: 'Réservations'},
  'Expérience Barmej': {icon: 'experience', label: 'Expérience'},
  Profile: {icon: 'profile', label: 'Profil'},
};

/* Écrans plein-écran sombres : la barre passe en version « verre fumé ». */
const DARK_ROUTES = new Set(['VideoFeed']);

const palette = {
  light: {
    bar: '#FFFFFF',
    border: '#ECE7F5',
    icon: '#8A8699',
    label: '#8A8699',
    labelActive: '#7251C9',
    shadow: '#5B4A86',
  },
  dark: {
    bar: 'rgba(18,13,27,.92)',
    border: 'rgba(255,255,255,.12)',
    icon: 'rgba(255,255,255,.62)',
    label: 'rgba(255,255,255,.62)',
    labelActive: '#FFFFFF',
    shadow: '#000000',
  },
};

const TabIcon = memo(function TabIconView({
  name,
  color,
  active,
}: {
  name: IconName;
  color: string;
  active: boolean;
}) {
  const common = {
    stroke: color,
    strokeWidth: active ? 2.1 : 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const accent = active ? color : 'none';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <>
          <Path {...common} d="M3 10.8 12 3l9 7.8V21h-6v-6H9v6H3V10.8Z" />
          {active ? <Path d="M10 21v-5h4v5" fill={accent} /> : null}
        </>
      )}
      {name === 'video' && (
        <>
          <Rect {...common} x="3" y="4" width="18" height="16" rx="5" />
          <Path {...common} d="m10 8.5 5.5 3.5-5.5 3.5v-7Z" fill={accent} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect {...common} x="3" y="5" width="18" height="16" rx="3" />
          <Path {...common} d="M8 3v4M16 3v4M3 10h18" />
          <Circle cx="8.5" cy="14.5" r="1.3" fill={color} />
          <Circle cx="12" cy="14.5" r="1.3" fill={active ? color : 'none'} />
          <Circle cx="15.5" cy="14.5" r="1.3" fill={active ? color : 'none'} />
        </>
      )}
      {name === 'experience' && (
        <>
          <Path
            {...common}
            fill={accent}
            d="M12 2c.7 5.2 2.8 7.3 8 8-5.2.7-7.3 2.8-8 8-.7-5.2-2.8-7.3-8-8 5.2-.7 7.3-2.8 8-8Z"
          />
          <Path
            {...common}
            d="M19 16c.3 2.1 1.2 3 3 3.5-1.8.4-2.7 1.3-3 3.5-.4-2.2-1.3-3.1-3-3.5 1.7-.5 2.6-1.4 3-3.5Z"
          />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle {...common} cx="12" cy="8" r="4" fill={accent} />
          <Path {...common} d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      )}
    </Svg>
  );
});

const TabButton = memo(function TabButtonView({
  icon,
  label,
  focused,
  dark,
  testID,
  accessibilityLabel,
  onPress,
  onLongPress,
}: {
  icon: IconName;
  label: string;
  focused: boolean;
  dark: boolean;
  testID?: string;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const colors = dark ? palette.dark : palette.light;
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  const iconStyle = {
    transform: [
      {scale: scale.interpolate({inputRange: [0, 1], outputRange: [1, 1.08]})},
      {
        translateY: scale.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1],
        }),
      },
    ],
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{selected: focused}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({pressed}) => [styles.tab, pressed && styles.pressed]}>
      <Animated.View style={[styles.iconSlot, iconStyle]}>
        <TabIcon
          name={icon}
          active={focused}
          color={focused ? '#FFFFFF' : colors.icon}
        />
      </Animated.View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        maxFontSizeMultiplier={1.15}
        style={[
          styles.label,
          {color: focused ? colors.labelActive : colors.label},
          focused && styles.labelFocused,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
});

function BarmejTabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const indicator = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    Animated.spring(indicator, {
      toValue: state.index,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [indicator, state.index]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setWidth(prev => (prev === next ? prev : next));
  }, []);

  if (keyboardVisible) return null;

  const activeRoute = state.routes[state.index];
  const nestedName = getFocusedRouteNameFromRoute(activeRoute);
  const dark =
    activeRoute.name === 'Videos' &&
    (nestedName === undefined || DARK_ROUTES.has(nestedName));
  const colors = dark ? palette.dark : palette.light;

  const count = state.routes.length;
  const tabWidth = width ? (width - INNER_PADDING * 2) / count : 0;
  const indicatorStyle = {
    width: INDICATOR_WIDTH,
    transform: [
      {
        translateX: Animated.add(
          Animated.multiply(indicator, tabWidth),
          INNER_PADDING + (tabWidth - INDICATOR_WIDTH) / 2,
        ),
      },
    ],
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.bar,
        {
          bottom: insets.bottom + TAB_BAR_OFFSET,
          backgroundColor: colors.bar,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      {tabWidth ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, indicatorStyle]}
        />
      ) : null}
      {state.routes.map((route, i) => {
        const {options} = descriptors[route.key];
        const config = TABS[route.name] ?? {icon: 'home', label: route.name};
        const focused = state.index === i;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        const onLongPress = () =>
          navigation.emit({type: 'tabLongPress', target: route.key});
        return (
          <TabButton
            key={route.key}
            icon={config.icon}
            label={config.label}
            focused={focused}
            dark={dark}
            testID={options.tabBarButtonTestID}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

export default memo(BarmejTabBar);

const INNER_PADDING = 6;
const INDICATOR_WIDTH = 46;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: INNER_PADDING,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 14,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7251C9',
    shadowColor: '#7251C9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  pressed: {opacity: 0.7},
  iconSlot: {
    width: INDICATOR_WIDTH,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
    paddingHorizontal: 2,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  labelFocused: {fontWeight: '800'},
});
