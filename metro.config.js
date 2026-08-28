const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const fs = require('fs');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const realProjectRoot = fs.realpathSync.native(__dirname);

const config = {
  // Release builds run from a temporary short drive (for example R:\\) to
  // avoid Windows' 260-character CMake limit. Node can still resolve some
  // dependencies to the physical C:\\ path, so Metro must watch both roots.
  watchFolders: Array.from(new Set([__dirname, realProjectRoot])),
  resolver: {
    nodeModulesPaths: Array.from(
      new Set([
        path.join(__dirname, 'node_modules'),
        path.join(realProjectRoot, 'node_modules'),
      ]),
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
