/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NativeBaseProvider} from 'native-base';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './src/routes/main';
import AuthProvider from './src/routes/auth/authProvider';
import {AxiosInterceptor} from './src/services/request';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {linking} from './src/helpers/constatn';
import {StatusBar} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AppErrorBoundary from './src/components/AppErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {queries: {retry: false, staleTime: 5000}},
});

function App(): React.JSX.Element {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <GestureHandlerRootView style={{flex: 1}}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NativeBaseProvider>
                <NavigationContainer linking={linking as any}>
                  <AxiosInterceptor>
                    <SafeAreaView
                      edges={['top', 'bottom']}
                      style={{flex: 1, backgroundColor: '#F7F7FB'}}>
                      <MainStack />
                    </SafeAreaView>
                  </AxiosInterceptor>
                </NavigationContainer>
              </NativeBaseProvider>
            </AuthProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

export default App;
