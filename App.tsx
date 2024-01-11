/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NativeBaseProvider } from 'native-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/routes/main';
import AuthProvider from './src/routes/auth/authProvider';
import { AxiosInterceptor } from './src/services/request';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import usePushNotification from './src/hooks/usePushNotification';
import { getQueryParams, linking } from './src/helpers/constatn';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { SafeAreaView } from 'react-native';

function App(): JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Global query options
        retry: false, // Disable automatic retries
        staleTime: 5000,
      },
    },
  });
  const {
    requestUserPermission,
    getFCMToken,
    listenToBackgroundNotifications,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();

  useEffect(() => {
    const listenToNotifications = () => {
      try {
        getFCMToken();
        requestUserPermission();
        onNotificationOpenedAppFromQuit();
        listenToBackgroundNotifications();
        listenToForegroundNotifications();
        onNotificationOpenedAppFromBackground();
      } catch (error) {
        console.log(error);
      }
    };

    listenToNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDynamicLink = (link: any) => {
    // Handle dynamic link inside your own application
    console.log('link', link);
    let productId = getQueryParams(link.url);
    console.log('productId:', productId);
    if (link.url === 'https://invertase.io/offer') {
      // ...navigate to your offers screen
    }
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    // When the component is unmounted, remove the listener
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then((link: any) => {
        console.log('closed link', link);

        if (link.url === 'https://invertase.io/offer') {
          // ...set initial route as offers screen
        }
      });
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NativeBaseProvider>
            <NavigationContainer linking={linking}>
              <AxiosInterceptor>
                <SafeAreaView style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                }}>
                  <MainStack />
                </SafeAreaView>
              </AxiosInterceptor>
            </NavigationContainer>
          </NativeBaseProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
