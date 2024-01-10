/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View} from 'native-base';
import React, {useEffect, useState} from 'react';
import StackHome from './homeStack';
import SvgHome from '../../assets/Home';
import SvgSelectedHome from '../../assets/SelectedHome';
import SvgNotifications from '../../assets/Notifications';
import SvgSelectedNotifications from '../../assets/SelectedNotifications';
import SvgHeart from '../../assets/Heart';
import SvgSelectedProfile from '../../assets/SelectedProfile';
import SvgProfile from '../../assets/Profile';
import SvgSelectedFavoris from '../../assets/SelectedFavoris';
import Favorit from '../../screens/main/favorit';
import {Keyboard} from 'react-native';
import StackProfil from '../profil';
import NotficationScreen from '../../screens/notfication';
export default function TabNavigation() {
  const Tab = createBottomTabNavigator();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return (
    <View
      style={{
        flex: 1,
      }}>
      <Tab.Navigator
        id="tabs"
        screenOptions={({}) => ({
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 25,
            display: keyboardVisible ? 'none' : 'flex',
            right: 25,
            backgroundColor: '#45377A',
            borderRadius: 15,
            height: 72,
            borderTopColor: '#45377A',
          },
        })}
        sceneContainerStyle={{
          flex: 1,
          backgroundColor: 'transparent',
        }}>
        <Tab.Screen
          name="Home"
          component={StackHome}
          options={({}) => ({
            tabBarLabel: 'Home',
            tabBarIcon: ({focused}) =>
              focused ? (
                <SvgSelectedHome />
              ) : (
                <View flex={1} justifyContent="flex-end" paddingBottom={2.5}>
                  <SvgHome />
                </View>
              ),
          })}
        />
        <Tab.Screen
          name="Favorit"
          component={Favorit}
          options={{
            tabBarLabel: 'Favorit',
            tabBarIcon: ({focused}) =>
              focused ? (
                <SvgSelectedFavoris />
              ) : (
                <View flex={1} justifyContent="flex-end" paddingBottom={2.5}>
                  <SvgHeart />
                </View>
              ),
          }}
        />
        <Tab.Screen
          name="Notifcation"
          component={NotficationScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({focused}) =>
              focused ? (
                <SvgSelectedNotifications />
              ) : (
                <View flex={1} justifyContent="flex-end" paddingBottom={2.5}>
                  <SvgNotifications />
                </View>
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={StackProfil}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({focused}) =>
              focused ? (
                <SvgSelectedProfile />
              ) : (
                <View flex={1} justifyContent="flex-end" paddingBottom={2.5}>
                  <SvgProfile />
                </View>
              ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
