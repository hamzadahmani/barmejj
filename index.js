/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';

// These warnings come from third-party libraries during module loading.
// Register the filters before requiring App so they never reach LogBox UI.
LogBox.ignoreLogs([
  'DrawerLayoutAndroid is deprecated',
  'In React 18, SSRProvider is not necessary and is a noop.',
]);

const App = require('./App').default;

AppRegistry.registerComponent(appName, () => App);
