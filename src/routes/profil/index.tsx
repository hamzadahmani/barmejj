import {createStackNavigator} from '@react-navigation/stack';
import MyReservation from '../../screens/main/myReservations';
import UpadateResevationScreen from '../../screens/main/myReservations/updateReservation';
import Profil from '../../screens/main/profil';
import React from 'react';
import SettingsScreen from '../../screens/main/profil/settings';
import TermsAndConditionsScreen from '../../screens/policy/termAndCondition';
import PolicyScreen from '../../screens/policy/policy';
import VerifiedReviewsScreen from '../../screens/main/community/reviews';
import WaitlistScreen from '../../screens/main/community/waitlist';
import GroupPlannerScreen from '../../screens/main/community/groupPlanner';
import BarmejliScreen from '../../screens/main/experience/barmejli';
import DetailsPlace from '../../screens/main/detailsPlace';
import StayBooking from '../../screens/main/stay';
import PersonalizationScreen from '../../screens/main/profil/personalization';
import NotficationScreen from '../../screens/notfication';
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
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{
          title: 'Termes et conditions',
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
      <Stack.Screen
        name="policy"
        component={PolicyScreen}
        options={{
          title: 'politique',
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
      <Stack.Screen name="VerifiedReviews" component={VerifiedReviewsScreen} options={{headerShown: false}} />
      <Stack.Screen name="Waitlist" component={WaitlistScreen} options={{headerShown: false}} />
      <Stack.Screen name="GroupPlanner" component={GroupPlannerScreen} options={{headerShown: false}} />
      {/* L’ancien « Assistant Barmej » est fusionné dans Barmejli (mode « Juste une adresse »). */}
      <Stack.Screen name="SmartAssistant" component={BarmejliScreen} initialParams={{mode: 'single'}} options={{headerShown: false}} />
      <Stack.Screen name="Details" component={DetailsPlace} options={{headerShown: false}} />
      <Stack.Screen name="StayBooking" component={StayBooking} options={{headerShown: false}} />
      <Stack.Screen name="Personalization" component={PersonalizationScreen} options={{headerShown: false}} />
      <Stack.Screen name="Notifications" component={NotficationScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}
