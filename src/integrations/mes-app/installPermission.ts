import { NativeModules, Platform } from 'react-native';

interface InstallPermissionNativeModule {
  canRequestPackageInstalls: () => Promise<boolean>;
  openInstallPermissionSettings: () => Promise<boolean>;
}

const installPermissionModule = NativeModules.InstallPermission as
  | InstallPermissionNativeModule
  | undefined;

export async function canInstallUnknownApps(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (!installPermissionModule) {
    return false;
  }

  return installPermissionModule.canRequestPackageInstalls();
}

export async function openInstallPermissionSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  if (!installPermissionModule) {
    throw new Error('当前安装包未启用安装权限设置入口');
  }

  await installPermissionModule.openInstallPermissionSettings();
}
