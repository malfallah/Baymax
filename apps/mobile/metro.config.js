// Metro configuration for the npm-workspaces monorepo.
// https://docs.expo.dev/guides/monorepos/
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so changes in packages/* trigger reloads.
config.watchFolders = [...new Set([...(config.watchFolders ?? []), workspaceRoot])];

// Look up dependencies in the app first, then in the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve workspace packages straight from source. This does not rely on the
// node_modules symlinks npm creates, which can be missing on some Windows setups.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@baymax/shared': path.resolve(workspaceRoot, 'packages/shared'),
};

module.exports = config;
