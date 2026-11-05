import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useUpdateStore } from '../../mes/host/state/update.store';
import {
  checkHotUpdate,
  confirmReloadHotUpdate,
  HOT_UPDATE_SYNC_INTERVAL_MS,
} from './appHotUpdate';

/**
 * 热更新检查器。
 *
 * 与安装包更新是两条独立通道：冷启动由原生层按 ON_LOAD 策略检查，
 * 这里补上运行期间发布与回到前台的情况，避免长时间驻留的现场设备拿不到热修。
 * 不依赖登录态——登录页同样需要能收到 JS 层修复。
 */
export function HotUpdateChecker() {
  useEffect(() => {
    let lastSyncedAt = 0;

    const sync = () => {
      if (Date.now() - lastSyncedAt < HOT_UPDATE_SYNC_INTERVAL_MS) {
        return;
      }
      lastSyncedAt = Date.now();
      void checkHotUpdate()
        .then(async (status) => {
          if (status !== 'downloaded') {
            return;
          }
          const { visible, updateInfo } = useUpdateStore.getState();
          // 安装包更新弹窗正在占用界面（或待强制更新）时不叠加重启提示，
          // 已下载的热更新会在下次启动自动生效。
          if (visible || updateInfo?.forceUpdate === true) {
            return;
          }
          await confirmReloadHotUpdate();
        })
        .catch((error: unknown) => {
          console.warn(
            '[HotUpdateChecker] 检查热更新失败:',
            error instanceof Error ? error.message : error,
          );
        });
    };

    sync();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        sync();
      }
    });
    return () => subscription.remove();
  }, []);

  return null;
}
