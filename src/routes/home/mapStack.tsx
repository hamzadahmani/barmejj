import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MapScreen from '../../components/mapView';
import PlaceDetails from '../../screens/main/detailsPlace';
import Resevation from '../../screens/main/reservation';
import ReservationSuccess from '../../screens/main/reservation/success';
import ReservationTicket from '../../screens/main/reservation/ticket';

const Stack = createStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitle: '',
        headerStyle: {backgroundColor: '#F7F7FB'},
      }}>
      <Stack.Screen
        name="MapExplore"
        component={MapScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name="Details" component={PlaceDetails} />
      <Stack.Screen
        name="Resevation"
        component={Resevation}
        options={{headerTitle: 'Réserver'}}
      />
      <Stack.Screen name="ReservationSuccess" component={ReservationSuccess} />
      <Stack.Screen name="ReservationTicket" component={ReservationTicket} />
    </Stack.Navigator>
  );
}
