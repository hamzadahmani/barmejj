import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ExperienceHome from '../../screens/main/experience';
import GroupPlannerScreen from '../../screens/main/community/groupPlanner';
import WaitlistScreen from '../../screens/main/community/waitlist';
import VerifiedReviewsScreen from '../../screens/main/community/reviews';
import PersonalizationScreen from '../../screens/main/profil/personalization';
import DetailsPlace from '../../screens/main/detailsPlace';
import Resevation from '../../screens/main/reservation';
import ReservationSuccess from '../../screens/main/reservation/success';
import ReservationTicket from '../../screens/main/reservation/ticket';
import LoyaltyRewardsScreen from '../../screens/main/experience/rewards';
import BarmejliScreen from '../../screens/main/experience/barmejli';
import StayBooking from '../../screens/main/stay';

const Stack=createStackNavigator();
export default function ExperienceStack(){return <Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="ExperienceHome" component={ExperienceHome}/><Stack.Screen name="Barmejli" component={BarmejliScreen}/><Stack.Screen name="LoyaltyRewards" component={LoyaltyRewardsScreen}/><Stack.Screen name="SmartAssistant" component={BarmejliScreen} initialParams={{mode:'single'}}/><Stack.Screen name="GroupPlanner" component={GroupPlannerScreen}/><Stack.Screen name="Waitlist" component={WaitlistScreen}/><Stack.Screen name="VerifiedReviews" component={VerifiedReviewsScreen}/><Stack.Screen name="Personalization" component={PersonalizationScreen}/><Stack.Screen name="Details" component={DetailsPlace}/><Stack.Screen name="StayBooking" component={StayBooking}/><Stack.Screen name="Resevation" component={Resevation}/><Stack.Screen name="ReservationSuccess" component={ReservationSuccess}/><Stack.Screen name="ReservationTicket" component={ReservationTicket}/></Stack.Navigator>;}
