import {createStackNavigator} from '@react-navigation/stack';
import MyReservation from '../../screens/main/myReservations';
import UpadateResevationScreen from '../../screens/main/myReservations/updateReservation';
import Profil from '../../screens/main/profil';
import React from 'react';
import SettingsScreen from '../../screens/main/profil/settings';
const Stack = createStackNavigator();

export default function StackProfil() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#F5F5F5',
        },
      }}>
      <Stack.Screen
        options={{
          headerShown: false,
          headerTitle: '',
        }}
        name="Profil"
        component={Profil}
      />
      <Stack.Screen
        name="MyReservation"
        component={MyReservation}
        options={{
          headerTitle: 'Mes réservations',
        }}
      />
      <Stack.Screen
        name="UpdateReservation"
        component={UpadateResevationScreen}
        options={{
          headerTitle: 'Mise a jour réservation',
        }}
      />
      <Stack.Screen
        name="MySettings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Paramètres',
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
    </Stack.Navigator>
  );
}
