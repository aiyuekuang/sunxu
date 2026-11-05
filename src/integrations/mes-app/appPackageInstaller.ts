import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { verifyDownloadedPackageSha256 } from '../../mes/utils/app-update-integrity';

export interface PackageDownloadProgress {
  bytesWritten: number;
  totalBytes: number;
  progress: number;
}

interface DownloadPackageParams {
  downloadUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  fileSha256?: string | null;
  onProgress?: (progress: PackageDownloadProgress) => void;
}

const APK_MIME_TYPE = 'application/vnd.android.package-archive';
const FLAG_GRANT_READ_URI_PERMISSION = 1;

function normalizeApkFileName(fileName?: string | null) {
  const rawName = fileName?.trim() || 'mes-app-update.apk';
  const safeName = rawName.replace(/[^\w.-]/g, '-');
  return safeName.toLowerCase().endsWith('.apk') ? safeName : `${safeName}.apk`;
}

function getDownloadDirectory() {
  const root = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!root) {
    throw new Error('当前设备不支持本地安装包下载');
  }
  return `${root}app-updates/`;
}

async function ensureDownloadDirectory() {
  const directory = getDownloadDirectory();
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true }).catch(() => undefined);
  return directory;
}

export async function downloadAndroidPackage({
  downloadUrl,
  fileName,
  fileSize,
  fileSha256,
  onProgress,
}: DownloadPackageParams) {
  if (Platform.OS !== 'android') {
    throw new Error('当前平台不支持 App 内安装包下载');
  }
  if (!downloadUrl) {
    throw new Error('暂无安装包下载地址');
  }

  const directory = await ensureDownloadDirectory();
  const fileUri = `${directory}${normalizeApkFileName(fileName)}`;
  await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => undefined);

  const task = FileSystem.createDownloadResumable(downloadUrl, fileUri, {}, (event) => {
    const expectedBytes =
      event.totalBytesExpectedToWrite > 0 ? event.totalBytesExpectedToWrite : fileSize || 0;
    const progress = expectedBytes > 0 ? event.totalBytesWritten / expectedBytes : 0;
    onProgress?.({
      bytesWritten: event.totalBytesWritten,
      totalBytes: expectedBytes,
      progress: Math.max(0, Math.min(progress, 1)),
    });
  });

  const result = await task.downloadAsync();
  if (!result?.uri) {
    throw new Error('安装包下载未完成');
  }
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`安装包下载失败，状态码 ${result.status}`);
  }

  const fileInfo = await FileSystem.getInfoAsync(result.uri);
  if (!fileInfo.exists || fileInfo.size <= 0) {
    throw new Error('安装包文件异常，请重新下载');
  }

  try {
    if (fileSha256) {
      await verifyDownloadedPackageSha256(result.uri, fileSha256);
    }
  } catch (error) {
    await FileSystem.deleteAsync(result.uri, { idempotent: true }).catch(() => undefined);
    throw error;
  }

  onProgress?.({
    bytesWritten: fileInfo.size,
    totalBytes: fileSize || fileInfo.size,
    progress: 1,
  });

  return result.uri;
}

export async function installAndroidPackage(fileUri: string) {
  if (Platform.OS !== 'android') {
    throw new Error('当前平台不支持 App 内安装');
  }

  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: FLAG_GRANT_READ_URI_PERMISSION,
    type: APK_MIME_TYPE,
  });
}
