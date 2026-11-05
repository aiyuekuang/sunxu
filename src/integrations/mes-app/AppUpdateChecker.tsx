import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  BackHandler,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type AppUpdateInfo,
  AppUpdateRequestInvalidatedError,
  type AppUpdateSource,
} from '../../mes/host/services';
import { AppText as Text } from '../../core/components/AppText.tsx';
import { confirmAlert } from '../../core/components/ConfirmAlert.ts';
import { InlineLoading } from '../../core/components/LoadingView.tsx';
import { ProgressBar } from '../../core/components/ProgressBar.tsx';
import { FontSize, FontWeight, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';
import { useUpdateStore } from '../../mes/host/state/update.store';
import { downloadAndroidPackage, installAndroidPackage } from './appPackageInstaller';
import { formatAppVersion } from './appVersion';
import { canInstallUnknownApps, openInstallPermissionSettings } from './installPermission';
import { toast } from '../../core/toast';

interface AppUpdateCheckerProps {
  source: AppUpdateSource;
}

function formatFileSize(value?: number | null) {
  if (!value || value <= 0) {
    return '';
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)}KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)}MB`;
}

export function formatTargetVersion(info: AppUpdateInfo) {
  if (info.versionName) {
    return `v${info.versionName}${info.versionCode !== null && info.versionCode !== undefined ? ` (${info.versionCode})` : ''}`;
  }
  if (info.versionCode !== null && info.versionCode !== undefined) {
    return `版本号 ${info.versionCode}`;
  }
  return '服务器安装包';
}

type InstallPermissionStatus = 'unknown' | 'granted' | 'denied';

const UPDATE_TOUCH_TARGET = Platform.OS === 'android' ? 48 : MIN_TOUCH_TARGET;

export function AppUpdateChecker({ source }: AppUpdateCheckerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { checkUpdate, dismissModal, reset, updateInfo, visible } = useUpdateStore();
  const [actionStatus, setActionStatus] = useState<
    'idle' | 'checkingPermission' | 'downloading' | 'installing' | 'fallback'
  >('idle');
  const [downloadProgress, setDownloadProgress] = useState({
    bytesWritten: 0,
    progress: 0,
    totalBytes: 0,
  });
  const [installPermissionStatus, setInstallPermissionStatus] =
    useState<InstallPermissionStatus>('unknown');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    reset();
    checkUpdate({ showModal: false, source }).catch((error: unknown) => {
      if (error instanceof AppUpdateRequestInvalidatedError) {
        return;
      }
      console.warn(
        '[AppUpdateChecker] 检查更新失败:',
        error instanceof Error ? error.message : error,
      );
    });
  }, [checkUpdate, reset, source]);

  useEffect(() => {
    if (!visible || updateInfo?.forceUpdate !== true || Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [updateInfo?.forceUpdate, visible]);

  const refreshInstallPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const allowed = await canInstallUnknownApps();
      setInstallPermissionStatus(allowed ? 'granted' : 'denied');
    } catch {
      setInstallPermissionStatus('unknown');
    }
  }, []);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') {
      setInstallPermissionStatus('unknown');
      return undefined;
    }

    void refreshInstallPermission();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshInstallPermission();
      }
    });

    return () => subscription.remove();
  }, [refreshInstallPermission, visible]);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabledMotionReduction) => {
      if (mounted) {
        setReduceMotion(enabledMotionReduction);
      }
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const handleOpenInBrowser = useCallback(async () => {
    if (!updateInfo?.downloadUrl) {
      toast.error('请联系管理员重新上传安装包', '暂无下载地址');
      return;
    }

    setActionStatus('fallback');
    try {
      await Linking.openURL(updateInfo.downloadUrl);
    } catch {
      toast.error('请稍后重试，或在 PC 端扫描 App 下载二维码', '打开下载失败');
    } finally {
      setActionStatus('idle');
    }
  }, [updateInfo?.downloadUrl]);

  const handleOpenInstallPermissionSettings = useCallback(async () => {
    try {
      await openInstallPermissionSettings();
      toast.info('返回 App 后，再点击“立即更新”继续安装');
    } catch (error) {
      const message = error instanceof Error ? error.message : '请在系统设置中手动开启安装权限';
      toast.error(message, '打开授权设置失败');
    }
  }, []);

  const promptInstallPermission = useCallback(() => {
    confirmAlert(
      '需要安装权限',
      'App 内更新需要允许 MES App 安装未知应用。请先前往系统设置开启权限，返回后再点击 App 内下载。',
      handleOpenInstallPermissionSettings,
      '去授权',
      false,
      undefined,
      true,
    );
  }, [handleOpenInstallPermissionSettings]);

  const handleDownload = useCallback(async () => {
    if (!updateInfo?.downloadUrl) {
      toast.error('请联系管理员重新上传安装包', '暂无下载地址');
      return;
    }

    if (Platform.OS !== 'android') {
      await handleOpenInBrowser();
      return;
    }

    setActionStatus('checkingPermission');
    let hasInstallPermission = false;
    try {
      hasInstallPermission = await canInstallUnknownApps();
      setInstallPermissionStatus(hasInstallPermission ? 'granted' : 'denied');
    } catch (error) {
      const message = error instanceof Error ? error.message : '无法读取安装权限状态';
      setActionStatus('idle');
      const canUseBrowserFallback = !updateInfo.fileSha256;
      confirmAlert(
        '安装权限检查失败',
        message,
        handleOpenInstallPermissionSettings,
        '打开安装权限',
        false,
        canUseBrowserFallback ? handleOpenInBrowser : undefined,
        true,
        canUseBrowserFallback ? '浏览器下载' : '取消',
      );
      return;
    }

    if (!hasInstallPermission) {
      setActionStatus('idle');
      promptInstallPermission();
      return;
    }

    setDownloadProgress({
      bytesWritten: 0,
      progress: 0,
      totalBytes: updateInfo.fileSize || 0,
    });
    setActionStatus('downloading');

    try {
      const fileUri = await downloadAndroidPackage({
        downloadUrl: updateInfo.downloadUrl,
        fileName: updateInfo.fileName,
        fileSize: updateInfo.fileSize,
        fileSha256: updateInfo.fileSha256,
        onProgress: (progress) => setDownloadProgress(progress),
      });
      setActionStatus('installing');
      await installAndroidPackage(fileUri);
    } catch (error) {
      const message = error instanceof Error ? error.message : '请稍后重试';
      const canUseBrowserFallback = !updateInfo.fileSha256;
      confirmAlert(
        'App 内更新失败',
        message,
        handleOpenInstallPermissionSettings,
        '打开安装权限',
        false,
        canUseBrowserFallback ? handleOpenInBrowser : undefined,
        true,
        canUseBrowserFallback ? '浏览器下载' : '取消',
      );
    } finally {
      setActionStatus('idle');
    }
  }, [
    handleOpenInBrowser,
    handleOpenInstallPermissionSettings,
    promptInstallPermission,
    updateInfo?.downloadUrl,
    updateInfo?.fileName,
    updateInfo?.fileSize,
    updateInfo?.fileSha256,
  ]);

  if (!visible || !updateInfo) {
    return null;
  }

  const fileSize = formatFileSize(updateInfo.fileSize);
  const isForceUpdate = updateInfo.forceUpdate === true;
  const isBusy = actionStatus !== 'idle';
  const progressPercent = Math.round(downloadProgress.progress * 100);
  const progressTarget = downloadProgress.totalBytes || updateInfo.fileSize || 0;
  const progressSize = [
    formatFileSize(downloadProgress.bytesWritten),
    formatFileSize(downloadProgress.totalBytes),
  ]
    .filter(Boolean)
    .join(' / ');
  const primaryLabel =
    actionStatus === 'checkingPermission'
      ? '检查安装权限'
      : actionStatus === 'downloading'
        ? '下载中...'
        : actionStatus === 'installing'
          ? '准备安装...'
          : actionStatus === 'fallback'
            ? '打开下载中...'
            : Platform.OS === 'android'
              ? '立即更新'
              : '打开下载';
  const showInstallPermissionAction =
    Platform.OS === 'android' && installPermissionStatus !== 'granted';

  return (
    <Modal
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      visible={visible}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {
        if (!isForceUpdate) {
          dismissModal();
        }
      }}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.overlay,
            paddingBottom: Math.max(Spacing.xl, insets.bottom),
            paddingTop: Math.max(Spacing.xl, insets.top),
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {!isForceUpdate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="关闭更新提示"
              onPress={dismissModal}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Ionicons accessible={false} name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isForceUpdate ? colors.warningSurface : colors.primarySurface,
              },
            ]}
          >
            <Ionicons
              accessible={false}
              name={isForceUpdate ? 'alert-circle-outline' : 'arrow-up-circle-outline'}
              size={32}
              color={isForceUpdate ? colors.warning : colors.primary}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {isForceUpdate ? '重要更新' : '发现新版本'}
          </Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            {formatAppVersion()} → {formatTargetVersion(updateInfo)}
            {fileSize ? ` · ${fileSize}` : ''}
          </Text>

          {isForceUpdate ? (
            <View
              style={[
                styles.forceHintBox,
                { backgroundColor: colors.warningSurface, borderColor: colors.warning },
              ]}
            >
              <Ionicons
                accessible={false}
                name="lock-closed-outline"
                size={16}
                color={colors.warning}
              />
              <Text style={[styles.forceHintText, { color: colors.text }]}>
                此版本包含重要更新，完成安装后才能继续使用
              </Text>
            </View>
          ) : null}

          {updateInfo.releaseNotes ? (
            <View
              style={[
                styles.notesBox,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.notesTitle, { color: colors.textSecondary }]}>更新内容</Text>
              <ScrollView
                style={styles.notesScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <Text style={[styles.notesText, { color: colors.text }]}>
                  {updateInfo.releaseNotes}
                </Text>
              </ScrollView>
            </View>
          ) : null}

          {actionStatus === 'downloading' || actionStatus === 'installing' ? (
            <View style={styles.progressBox}>
              <View style={styles.progressMeta}>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {actionStatus === 'installing' ? '正在打开系统安装器' : '正在下载更新'}
                </Text>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {progressPercent}%
                </Text>
              </View>
              <ProgressBar
                current={downloadProgress.bytesWritten}
                target={progressTarget}
                height={8}
              />
              {progressSize ? (
                <Text style={[styles.progressSize, { color: colors.textSecondary }]}>
                  {progressSize}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isForceUpdate ? '立即更新，重要更新' : primaryLabel}
              accessibilityState={{ disabled: isBusy }}
              disabled={isBusy}
              onPress={handleDownload}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
                isBusy && styles.disabled,
              ]}
            >
              {isBusy ? <InlineLoading color={colors.textOnPrimary} /> : null}
              <Text style={[styles.primaryButtonText, { color: colors.textOnPrimary }]}>
                {primaryLabel}
              </Text>
            </Pressable>
          </View>

          {updateInfo.downloadUrl && !isBusy && !updateInfo.fileSha256 ? (
            <View style={styles.secondaryActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="浏览器下载"
                accessibilityState={{ disabled: false }}
                onPress={handleOpenInBrowser}
                style={({ pressed }) => [styles.secondaryActionButton, pressed && styles.pressed]}
              >
                <Ionicons accessible={false} name="open-outline" size={16} color={colors.primary} />
                <Text style={[styles.secondaryActionText, { color: colors.primary }]}>
                  浏览器下载
                </Text>
              </Pressable>
              {showInstallPermissionAction ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="安装权限"
                  accessibilityState={{ disabled: false }}
                  onPress={handleOpenInstallPermissionSettings}
                  style={({ pressed }) => [styles.secondaryActionButton, pressed && styles.pressed]}
                >
                  <Ionicons
                    accessible={false}
                    name="settings-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>
                    安装权限
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    ...Shadow.lg,
    maxWidth: 360,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: Radius.full,
    height: UPDATE_TOUCH_TARGET,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    width: UPDATE_TOUCH_TARGET,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.full,
    height: 56,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    width: 56,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  version: {
    marginTop: Spacing.xs,
  },
  forceHintBox: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  forceHintText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  notesBox: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  notesTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  notesScroll: {
    maxHeight: 220,
  },
  notesText: {
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'flex-end',
    marginTop: Spacing.xl,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    gap: Spacing.sm,
    justifyContent: 'center',
    minHeight: UPDATE_TOUCH_TARGET,
    minWidth: 120,
    paddingHorizontal: Spacing.lg,
  },
  primaryButtonText: {
    fontWeight: FontWeight.bold,
  },
  progressBox: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  progressMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  progressSize: {
    fontSize: FontSize.sm,
  },
  secondaryActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  secondaryActionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
    minHeight: UPDATE_TOUCH_TARGET,
    paddingHorizontal: Spacing.sm,
  },
  secondaryActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.65,
  },
});
