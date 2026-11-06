const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const rootPackage = require('../../package.json');
const appPackage = require('./package.json');
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  sunxu: workspaceRoot,
};
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, '../mes-app/node_modules'),
];
// The shared source lives above the app and has development dependencies of its own.
// Resolve shared peers through the app copy so providers and hooks share one module instance.
const appOwnedModules = [...new Set([
  ...Object.keys(rootPackage.peerDependencies ?? {}),
  ...Object.keys(appPackage.dependencies ?? {}),
])].filter((name) => name !== 'sunxu');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const appOwnedRoot = appOwnedModules.find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`),
  );
  if (appOwnedRoot) {
    const appModule = path.resolve(projectRoot, 'node_modules', moduleName);
    return context.resolveRequest(context, appModule, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
