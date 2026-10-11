import React, {useState} from 'react';
import {NativeBaseProvider} from 'native-base';
import {QueryClientProvider} from '@tanstack/react-query';
import {createQueryClient} from './src/query/client';
import NativeQueryLifecycle from './src/query/NativeQueryLifecycle';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import MainStack from './src/routes/main';
import AuthProvider from './src/routes/auth/authProvider';
import {AxiosInterceptor} from './src/services/request';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {linking} from './src/helpers/constatn';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import {nativeBaseTheme} from './src/theme/nativeBaseTheme';

// Écrans dont le haut est sombre : barre d'état claire et fond nuit derrière.
const darkTopScreens = new Set([
  'Categories',
  'Barmejli',
  'Details',
  'Resevation',
  'StayBooking',
]);

function App(): React.JSX.Element {
  const [queryClient] = useState(createQueryClient);
  const navigationRef =
    useNavigationContainerRef<Record<string, object | undefined>>();
  const [exploring, setExploring] = useState(false);
  const syncAppearance = () =>
    setExploring(
      darkTopScreens.has(navigationRef.getCurrentRoute()?.name ?? ''),
    );
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle={exploring ? 'light-content' : 'dark-content'} />
        <GestureHandlerRootView style={styles.root}>
          <QueryClientProvider client={queryClient}>
            <NativeQueryLifecycle />
            <AuthProvider>
              <NativeBaseProvider theme={nativeBaseTheme}>
                <NavigationContainer
                  ref={navigationRef}
                  onReady={syncAppearance}
                  onStateChange={syncAppearance}
                  linking={linking as any}>
                  <AxiosInterceptor>
                    <SafeAreaView
                      edges={['top']}
                      style={[styles.safe, exploring && styles.exploring]}>
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
const styles = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1, backgroundColor: '#F8F6FC'},
  exploring: {backgroundColor: '#241B36'},
});
