import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect, useState} from 'react';
import {Keyboard, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import StackProfil from '../profil';
import ExperienceStack from './experienceStack';
import StackHome from './homeStack';
import MapStack from './mapStack';
import ReservationStack from './reservationStack';

const Tab = createBottomTabNavigator();

type IconName = 'home' | 'map' | 'calendar' | 'experience' | 'profile';

const NavigationIcon = ({name, color}: {name: IconName; color: string}) => {
  const common = {
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <Path {...common} d="M3 10.8 12 3l9 7.8V21h-6v-6H9v6H3V10.8Z" />
      )}
      {name === 'map' && (
        <>
          <Path {...common} d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
          <Path {...common} d="M9 3v15M15 6v15" />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect {...common} x="3" y="5" width="18" height="16" rx="3" />
          <Path {...common} d="M8 3v4M16 3v4M3 10h18M8 14h3M14 14h2M8 17h2" />
        </>
      )}
      {name === 'experience' && (
        <>
          <Path {...common} d="M12 2c.7 5.2 2.8 7.3 8 8-5.2.7-7.3 2.8-8 8-.7-5.2-2.8-7.3-8-8 5.2-.7 7.3-2.8 8-8Z" />
          <Path {...common} d="M19 16c.3 2.1 1.2 3 3 3.5-1.8.4-2.7 1.3-3 3.5-.4-2.2-1.3-3.1-3-3.5 1.7-.5 2.6-1.4 3-3.5Z" />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle {...common} cx="12" cy="8" r="4" />
          <Path {...common} d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      )}
    </Svg>
  );
};

const tabIcon = (icon: IconName, label: string, focused: boolean) => (
  <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
    <NavigationIcon name={icon} color={focused ? '#FFFFFF' : '#C8C0E0'} />
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.78}
      maxFontSizeMultiplier={1.1}
      style={[
        styles.tabLabel,
        {color: focused ? '#FFFFFF' : '#C8C0E0'},
        focused && styles.tabLabelFocused,
      ]}>
      {label}
    </Text>
  </View>
);

export default function TabNavigation() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      id="tabs"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          display: keyboardVisible ? 'none' : 'flex',
          height: 64,
          marginHorizontal: 12,
          bottom: 8,
          paddingTop: 3,
          paddingBottom: 3,
          backgroundColor: '#45377A',
          borderTopWidth: 0,
          borderRadius: 22,
          elevation: 12,
          shadowColor: '#45377A',
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        tabBarItemStyle: {
          height: 58,
          paddingHorizontal: 1,
        },
        tabBarIconStyle: {
          width: '100%',
          height: 58,
          margin: 0,
        },
      }}>
      <Tab.Screen
        name="Explorer"
        component={StackHome}
        options={{
          tabBarIcon: ({focused}) => tabIcon('home', 'Explorer', focused),
        }}
      />
      <Tab.Screen
        name="Carte"
        component={MapStack}
        options={{tabBarIcon: ({focused}) => tabIcon('map', 'Carte', focused)}}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationStack}
        options={{
          tabBarIcon: ({focused}) =>
            tabIcon('calendar', 'Réservations', focused),
        }}
      />
      <Tab.Screen
        name="Expérience Barmej"
        component={ExperienceStack}
        options={{
          tabBarIcon: ({focused}) => tabIcon('experience', 'Expérience', focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StackProfil}
        options={{
          tabBarIcon: ({focused}) => tabIcon('profile', 'Profil', focused),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    width: '92%',
    maxWidth: 64,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    paddingHorizontal: 1,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  tabLabel: {
    width: '100%',
    marginTop: 3,
    color: '#C8C0E0',
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabLabelFocused: {
    fontWeight: '800',
  },
});
