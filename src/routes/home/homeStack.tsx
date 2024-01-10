import {createStackNavigator} from '@react-navigation/stack';
import categorie from '../../screens/main/categories';
import PlaceDetails from '../../screens/main/detailsPlace';
import HomeScreen from '../../screens/main/home';
import Resevation from '../../screens/main/reservation';
import React from 'react';
import MapScreen from '../../components/mapView';
const Stack = createStackNavigator();

export default function StackHome() {
  return (
    <Stack.Navigator
      screenOptions={{
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

      <Stack.Screen
        name="Details"
        component={PlaceDetails}
        options={{
          headerTitle: '',
        }}
      />
      <Stack.Screen name="Resevation" component={Resevation} options={{}} />
    </Stack.Navigator>
  );
}
