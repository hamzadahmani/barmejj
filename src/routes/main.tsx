import React from 'react';
import {useAuth} from './auth/authProvider';
import {createStackNavigator} from '@react-navigation/stack';
import AuthStack from './auth';
import TabNavigation from './home';
import InterestOnboardingScreen from '../screens/onboarding/InterestOnboardingScreen';
const Stack = createStackNavigator();

const MainStack = () => {
  const {user, userInfo} = useAuth();

  return (
    <Stack.Navigator>
      {user?.token ? (
        <>
          <Stack.Screen
            name="Main"
            component={userInfo?.onboardingRequired === false ? TabNavigation : InterestOnboardingScreen}
            options={{
              headerShown: false,
            }}
          />

          {/* Add other authenticated screens */}
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default MainStack;
