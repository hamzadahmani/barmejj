import {expect, it, jest} from '@jest/globals';
import {getToken, onMessage} from '@react-native-firebase/messaging';
import usePushNotification from '../src/hooks/usePushNotification';

it('requests the token only once and returns it to the caller', async () => {
  jest.mocked(getToken).mockClear();
  const notifications = usePushNotification();
  expect(await notifications.getFCMToken()).toBe('test-token');
  expect(getToken).toHaveBeenCalledTimes(1);
});

it('returns the foreground listener cleanup synchronously', () => {
  const unsubscribe = jest.fn();
  jest.mocked(onMessage).mockReturnValueOnce(unsubscribe);
  const notifications = usePushNotification();
  const handler = async () => {};
  const cleanup = notifications.listenToForegroundNotifications(handler);
  expect(cleanup).toBe(unsubscribe);
  cleanup();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
});
