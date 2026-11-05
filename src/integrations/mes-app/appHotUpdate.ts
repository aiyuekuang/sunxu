import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';
import { confirmAlert } from '../../core/components/ConfirmAlert';

/**
 * 热更新（JS bundle 层）检查与生效。
 *
 * 热更新只替换 JS 层与随包资源，不改变原生能力；只有原生运行时版本
 * （runtimeVersion）一致的安装包才会收到同一条热更新包。原生能力变化
 * 仍然必须发布新的安装包。
 */

/** 热更新检查结果。 */
export type HotUpdateStatus =
  /** 当前构建不参与热更新：开发构建、Web 端，或原生包未内置热更新能力 */
  | 'unsupported'
  /** 已是最新版本 */
  | 'up-to-date'
  /** 已下载完成，重启后生效 */
  | 'downloaded';

/** 前台自动检查的最小间隔，避免长时间驻留的现场设备频繁请求官方更新源。 */
export const HOT_UPDATE_SYNC_INTERVAL_MS = 15 * 60 * 1000;

export function isHotUpdateSupported(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  return Updates.isEnabled;
}

/** 当前正在运行的是安装包内置版本，还是已应用的热更新。 */
export interface HotUpdateState {
  /** 是否已应用过热更新（false 表示运行的是安装包内置版本） */
  applied: boolean;
  /** 已应用热更新的发布时间；未应用时为 null */
  publishedAt: Date | null;
}

export function getHotUpdateState(): HotUpdateState {
  if (!isHotUpdateSupported()) {
    return { applied: false, publishedAt: null };
  }
  return {
    applied: Updates.isEmbeddedLaunch !== true && Updates.updateId !== null,
    publishedAt: Updates.createdAt ?? null,
  };
}

/**
 * 查询是否有可用的热更新（只查询，不下载）。
 *
 * 用于「检查更新」时先判断两条通道各自是否可用，再决定提示方式。
 */
export async function hasHotUpdateAvailable(): Promise<boolean> {
  if (!isHotUpdateSupported()) {
    return false;
  }
  const result = await Updates.checkForUpdateAsync();
  return result.isAvailable === true;
}

/**
 * 检查并下载热更新。
 *
 * 冷启动时原生层已按 ON_LOAD 策略检查过一次；这里覆盖运行期间发布的新版本，
 * 因此对长时间驻留的设备同样有效。
 */
export async function checkHotUpdate(): Promise<HotUpdateStatus> {
  if (!isHotUpdateSupported()) {
    return 'unsupported';
  }

  const result = await Updates.checkForUpdateAsync();
  if (!result.isAvailable) {
    return 'up-to-date';
  }

  // 必须等下载完成再提示重启，否则用户重启后仍会运行旧 bundle。
  await Updates.fetchUpdateAsync();
  return 'downloaded';
}

/** 询问是否立即重启以应用已下载的热更新。 */
export function confirmReloadHotUpdate(): Promise<boolean> {
  return new Promise((resolve) => {
    confirmAlert(
      '更新已就绪',
      '新版本已下载完成，重启 App 后生效。是否立即重启？',
      () => {
        void Updates.reloadAsync();
        resolve(true);
      },
      '立即重启',
      false,
      () => resolve(false),
      true,
      '稍后',
    );
  });
}

/** 检查更新后需要执行的动作。原生升级优先，两者都可用时交给用户选择。 */
export type UpdateDecision =
  /** 两条通道都没有新版本 */
  | { kind: 'none' }
  /** 只有热更新可用：下载并询问是否重启 */
  | { kind: 'hot-update' }
  /** 只有原生安装包可升级：走既有安装包更新流程 */
  | { kind: 'native-update' }
  /** 两条通道都可用：由用户选择先更新哪一个 */
  | { kind: 'both' };

/**
 * 判断本次检查更新该走哪条通道。
 *
 * 规则：有新的原生安装包时优先升级原生版本（原生升级会一并带来其中的全部
 * 修复）；当前安装包同时也有热修复时，把选择权交给用户。
 */
export async function decideUpdateAction(options: {
  hasNativeUpdate: boolean;
}): Promise<UpdateDecision> {
  const hasHotUpdate = await hasHotUpdateAvailable();
  if (options.hasNativeUpdate && hasHotUpdate) {
    return { kind: 'both' };
  }
  if (options.hasNativeUpdate) {
    return { kind: 'native-update' };
  }
  if (hasHotUpdate) {
    return { kind: 'hot-update' };
  }
  return { kind: 'none' };
}

/** 两条通道都可用时，让用户选择本次更新哪一个。返回 null 表示稍后再说。 */
export function promptUpdateChoice(options: {
  nativeLabel: string;
}): Promise<'native' | 'hot' | null> {
  return new Promise((resolve) => {
    Alert.alert(
      '发现两项更新',
      `App 版本可升级到 ${options.nativeLabel}；当前安装包也有热修复可用。\n升级 App 版本会一并包含这些修复，只应用热修复则先修当前版本的问题。`,
      [
        { text: '升级 App 版本', onPress: () => resolve('native') },
        { text: '只应用热修复', onPress: () => resolve('hot') },
        { text: '稍后', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

/** 只有热修复可用时，用户选择的结果。 */
export type HotUpdateApplyResult =
  /** 已下载并重启生效 */
  | 'applied'
  /** 用户选择稍后 */
  | 'declined'
  /** 期间已经没有可用更新（例如别处已应用） */
  | 'up-to-date'
  /** 当前构建不参与热更新 */
  | 'unsupported';

/**
 * 主动检查到热修复时，先让用户决定要不要更新。
 *
 * 与后台静默预备不同：主动检查时把决定权交给用户，确认后下载并立即重启生效，
 * 只出现一次提示，不再叠加一次重启确认。
 */
export async function confirmAndApplyHotUpdate(): Promise<HotUpdateApplyResult> {
  if (!isHotUpdateSupported()) {
    return 'unsupported';
  }

  const agreed = await promptApplyHotUpdate();
  if (!agreed) {
    return 'declined';
  }

  const status = await checkHotUpdate();
  if (status !== 'downloaded') {
    return 'up-to-date';
  }

  await Updates.reloadAsync();
  return 'applied';
}

/** 询问是否立即下载并重启应用热修复。 */
function promptApplyHotUpdate(): Promise<boolean> {
  return new Promise((resolve) => {
    confirmAlert(
      '发现热修复',
      '新版本已准备好，下载完成后需要重启 App 才能生效。是否立即更新？',
      () => resolve(true),
      '立即更新',
      false,
      () => resolve(false),
      true,
      '稍后',
    );
  });
}
