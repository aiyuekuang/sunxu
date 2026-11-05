import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';

function getExpoVersion(): string | undefined {
  return Constants.expoConfig?.version;
}

function getExpoBuildVersion(): string | number | undefined {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.ios?.buildNumber;
  }
  return Constants.expoConfig?.android?.versionCode;
}

export function getCurrentPlatform() {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export function getCurrentVersion() {
  return Application.nativeApplicationVersion ?? getExpoVersion() ?? '0.0.0';
}

export function getCurrentVersionCode() {
  const nativeBuildVersion = Number(Application.nativeBuildVersion);
  if (Number.isFinite(nativeBuildVersion) && nativeBuildVersion > 0) {
    return nativeBuildVersion;
  }

  const expoBuildVersion = Number(getExpoBuildVersion());
  return Number.isFinite(expoBuildVersion) && expoBuildVersion > 0 ? expoBuildVersion : 1;
}

export function formatAppVersion() {
  return `v${getCurrentVersion()} (${getCurrentVersionCode()})`;
}
