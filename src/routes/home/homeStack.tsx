import {createStackNavigator} from '@react-navigation/stack';
import categorie from '../../screens/main/categories';
import PlaceDetails from '../../screens/main/detailsPlace';
import StayBooking from '../../screens/main/stay';
import HomeScreen from '../../screens/main/home';
import Resevation from '../../screens/main/reservation';
import ReservationSuccess from '../../screens/main/reservation/success';
import ReservationTicket from '../../screens/main/reservation/ticket';
import React from 'react';
import MapScreen from '../../components/mapView';
import MyFavorit from '../../screens/main/favorit';
const Stack = createStackNavigator();

export default function StackHome() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#F5F5F5',
        },
      }}>
      <Stack.Screen
        options={{
          headerShown: false,
          headerTitle: '',
        }}
        name="Categories"
        component={categorie}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerTitle: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NearMe"
        component={MapScreen}
        options={{
          headerTitle: '',
          headerShown: false,
        }}
      />
      <Stack.Screen name="FavoriteList" component={MyFavorit} />

      <Stack.Screen
        name="Details"
        component={PlaceDetails}
        options={{
          headerTitle: '',
        }}
      />

      <Stack.Screen name="StayBooking" component={StayBooking} />
      <Stack.Screen name="Resevation" component={Resevation} options={{}} />
      <Stack.Screen name="ReservationSuccess" component={ReservationSuccess} />
      <Stack.Screen name="ReservationTicket" component={ReservationTicket} />
    </Stack.Navigator>
  );
}
