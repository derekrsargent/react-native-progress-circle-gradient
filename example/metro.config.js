const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

const modules = Object.keys({
  ...pak.peerDependencies,
});

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,

  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
    ...defaultConfig.resolver,

    blockList: modules.map(
      (m) =>
        new RegExp(
          `^${path
            .join(root, 'node_modules', m)
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/.*$`
        )
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
};
