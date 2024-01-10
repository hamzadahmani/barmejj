import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../../screens/auth/signIn';
import React from 'react';
import SignupScreen from '../../screens/auth/signup';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignupScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* Add other screens */}
    </Stack.Navigator>
  );
};

export default AuthStack;
