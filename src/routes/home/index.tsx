/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View} from 'native-base';
import React, {useEffect, useState} from 'react';
import StackHome from './homeStack';
import SvgHome from '../../assets/Home';
import SvgNotifications from '../../assets/Notifications';
import SvgHeart from '../../assets/Heart';
import SvgProfile from '../../assets/Profile';
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
    <Tab.Navigator
      id="tabs"
      screenOptions={({}) => ({
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 25,
          bottom: 20,
          display: keyboardVisible ? 'none' : 'flex',
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
          tabBarIcon: ({focused}) => (
            <View
              style={{
                flexGrow: 1,
                justifyContent: focused ? 'space-between' : 'flex-end',
                paddingVertical: 10,
              }}>
              {focused && (
                <View
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    alignSelf: 'center',
                  }}
                />
              )}
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
          tabBarIcon: ({focused}) => (
            <View
              style={{
                flexGrow: 1,
                justifyContent: focused ? 'space-between' : 'flex-end',
                paddingVertical: 10,
              }}>
              {focused && (
                <View
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    alignSelf: 'center',
                  }}
                />
              )}
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
          tabBarIcon: ({focused}) => (
            <View
              style={{
                flexGrow: 1,
                justifyContent: focused ? 'space-between' : 'flex-end',
                paddingVertical: 10,
              }}>
              {focused && (
                <View
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    alignSelf: 'center',
                  }}
                />
              )}
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
          tabBarIcon: ({focused}) => (
            <View
              style={{
                flexGrow: 1,
                justifyContent: focused ? 'space-between' : 'flex-end',
                paddingVertical: 10,
              }}>
              {focused && (
                <View
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    alignSelf: 'center',
                  }}
                />
              )}
              <SvgProfile />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
