import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

type MessageHandler = (message: RemoteMessage) => Promise<void>;

export default function usePushNotification() {
  const messaging = getMessaging();
  const requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await requestPermission(messaging);
      return (
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL
      );
    }
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  return {
    requestUserPermission,
    getFCMToken: () => getToken(messaging),
    listenToForegroundNotifications: (handler: MessageHandler) =>
      onMessage(messaging, handler),
    // Register at application startup, outside a component effect.
    listenToBackgroundNotifications: (handler: MessageHandler) =>
      setBackgroundMessageHandler(messaging, handler),
    onNotificationOpenedAppFromBackground: (handler: MessageHandler) =>
      onNotificationOpenedApp(messaging, handler),
    onNotificationOpenedAppFromQuit: () => getInitialNotification(messaging),
  };
}
