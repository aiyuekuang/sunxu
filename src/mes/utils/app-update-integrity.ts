import { NativeModules, Platform } from 'react-native';
import { normalizeSha256 } from '../host/services';

interface AppUpdateIntegrityNativeModule {
  sha256: (fileUri: string) => Promise<string>;
}

const appUpdateIntegrityModule = NativeModules.AppUpdateIntegrity as
  | AppUpdateIntegrityNativeModule
  | undefined;

export async function verifyDownloadedPackageSha256(
  fileUri: string,
  expectedSha256: string,
): Promise<void> {
  const expected = normalizeSha256(expectedSha256);
  if (!expected) {
    throw new Error('安装包完整性校验值无效，请联系管理员重新发布版本');
  }
  if (Platform.OS !== 'android') {
    throw new Error('当前平台不支持安装包完整性校验');
  }
  if (!appUpdateIntegrityModule) {
    throw new Error('当前 App 版本未启用安装包完整性校验，请升级 App 后重试');
  }

  const actual = normalizeSha256(await appUpdateIntegrityModule.sha256(fileUri));
  if (!actual || actual !== expected) {
    throw new Error('安装包完整性校验失败，已阻止安装，请重新下载或联系管理员');
  }
}
