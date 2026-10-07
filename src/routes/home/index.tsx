import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import StackProfil from '../profil';
import ExperienceStack from './experienceStack';
import StackHome from './homeStack';
import VideoStack from './videoStack';
import ReservationStack from './reservationStack';
import BarmejTabBar from './tabBar';

const Tab = createBottomTabNavigator();

const renderTabBar = (props: BottomTabBarProps) => <BarmejTabBar {...props} />;

export default function TabNavigation() {
  return (
    <Tab.Navigator
      id="tabs"
      tabBar={renderTabBar}
      screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Explorer"
        component={StackHome}
        options={{
          tabBarButtonTestID: 'tab-explorer',
          tabBarAccessibilityLabel: 'Ouvrir Explorer',
        }}
      />
      <Tab.Screen
        name="Videos"
        component={VideoStack}
        options={{
          tabBarButtonTestID: 'tab-videos',
          tabBarAccessibilityLabel: 'Ouvrir Vidéos',
        }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationStack}
        options={{
          tabBarButtonTestID: 'tab-reservations',
          tabBarAccessibilityLabel: 'Ouvrir Réservations',
        }}
      />
      <Tab.Screen
        name="Expérience Barmej"
        component={ExperienceStack}
        options={{
          tabBarButtonTestID: 'tab-experience',
          tabBarAccessibilityLabel: 'Ouvrir Expérience',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StackProfil}
        options={{
          tabBarButtonTestID: 'tab-profile',
          tabBarAccessibilityLabel: 'Ouvrir Profil',
        }}
      />
    </Tab.Navigator>
  );
}
