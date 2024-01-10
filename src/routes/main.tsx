import {useContext} from 'react';
import {AuthContext} from './auth/authProvider';
import {createStackNavigator} from '@react-navigation/stack';
import AuthStack from './auth';
import TabNavigation from './home';
const Stack = createStackNavigator();

const MainStack = () => {
  const {user} = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {user?.token ? (
        <>
          <Stack.Screen
            name="Main"
            component={TabNavigation}
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
