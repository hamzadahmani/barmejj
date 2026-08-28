import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MyReservation from '../../screens/main/myReservations';
import ReservationDetailsScreen from '../../screens/main/myReservations/updateReservation';
import ReservationTicket from '../../screens/main/reservation/ticket';

const Stack = createStackNavigator();

export default function ReservationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitle: '',
        headerStyle: {backgroundColor: '#F7F7FB'},
      }}>
      <Stack.Screen
        name="ReservationList"
        component={MyReservation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UpdateReservation"
        component={ReservationDetailsScreen}
        options={{headerTitle: 'Détails'}}
      />
      <Stack.Screen name="ReservationTicket" component={ReservationTicket} />
    </Stack.Navigator>
  );
}
