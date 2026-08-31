jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

require('react-native-gesture-handler/jestSetup');

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
  setRNConfiguration: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('react-native-image-viewing', () => 'ImageViewing');

jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: 'MapView',
  Marker: 'Marker',
  PROVIDER_GOOGLE: 'google',
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');
jest.mock('react-native-video', () => 'Video');
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: {},
  })),
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
}));

jest.mock('react-native-modern-datepicker', () => ({
  __esModule: true,
  default: 'DatePicker',
  getToday: jest.fn(() => '2024-01-01'),
  getFormatedDate: jest.fn(value => value),
}));

jest.mock('@react-native-firebase/messaging', () => () => ({
  getToken: jest.fn().mockResolvedValue('test-token'),
  hasPermission: jest.fn().mockResolvedValue(true),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn().mockResolvedValue(null),
  setBackgroundMessageHandler: jest.fn(),
  requestPermission: jest.fn().mockResolvedValue(1),
}));

jest.mock('@react-native-firebase/dynamic-links', () => () => ({
  onLink: jest.fn(() => jest.fn()),
  getInitialLink: jest.fn().mockResolvedValue(null),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
  },
  statusCodes: {},
}));
