import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../core/components/AppText.tsx';
import { confirmAlert } from '../../core/components/ConfirmAlert.ts';
import { FormField } from '../../core/components/FormField.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';
import type { ServerTestResult } from '../../mes/types/server-config';

export type { ServerTestResult } from '../../mes/types/server-config';

interface ServerConfigModalProps {
  visible: boolean;
  value: string;
  testing: boolean;
  testResult?: ServerTestResult | null;
  testServerUrl?: string;
  history: readonly string[];
  onChange: (value: string) => void;
  onClose: () => void;
  onTest: () => void;
  onDismissTestResult: () => void;
  onUseTestServer?: () => void;
  onSelectHistory: (value: string) => void;
  onDeleteHistory: (value: string) => Promise<void>;
  onSave: () => void;
}

export function ServerConfigModal({
  visible,
  value,
  testing,
  testResult,
  testServerUrl,
  history,
  onChange,
  onClose,
  onTest,
  onDismissTestResult,
  onUseTestServer,
  onSelectHistory,
  onDeleteHistory,
  onSave,
}: ServerConfigModalProps) {
  const { colors } = useTheme();
  const [historyVisible, setHistoryVisible] = useState(false);

  useEffect(() => {
    if (!visible) setHistoryVisible(false);
  }, [visible]);

  const handleSelectHistory = (url: string) => {
    onSelectHistory(url);
    setHistoryVisible(false);
  };

  const handleDeleteHistory = (url: string) => {
    confirmAlert('删除历史地址', `确认删除「${url}」？`, () => onDeleteHistory(url));
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.box, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>服务器地址</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>
              填写服务入口即可，App 会自动补全 /api。示例：https://api.yuanwenmes.com 或
              http://192.168.1.10:6033
            </Text>

            <FormField
              label="服务器地址"
              value={value}
              onChangeText={onChange}
              placeholder="https://域名或 IP:端口"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              rightElement={
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    onPress={() => setHistoryVisible(true)}
                    hitSlop={HIT_SLOP}
                    style={styles.iconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="打开服务器地址历史"
                  >
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  {value.length > 0 && (
                    <TouchableOpacity
                      onPress={() => onChange('')}
                      hitSlop={HIT_SLOP}
                      style={styles.iconBtn}
                      accessibilityRole="button"
                      accessibilityLabel="清空服务器地址"
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              }
            />

            {testServerUrl && onUseTestServer && (
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: `${colors.primary}14` }]}
                onPress={onUseTestServer}
              >
                <Ionicons name="flash-outline" size={18} color={colors.primary} />
                <Text style={[styles.quickBtnText, { color: colors.primary }]}>写入测试地址</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.testBtn, { borderColor: colors.primary, opacity: testing ? 0.6 : 1 }]}
              onPress={onTest}
              disabled={testing}
            >
              <Text style={[styles.testBtnText, { color: colors.primary }]}>
                {testing ? '测试中...' : '测试连接'}
              </Text>
            </TouchableOpacity>

            {testResult ? (
              <View
                style={[
                  styles.testResult,
                  {
                    backgroundColor:
                      testResult.kind === 'success' ? colors.successLight : colors.errorLight,
                    borderColor: testResult.kind === 'success' ? colors.success : colors.error,
                  },
                ]}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Ionicons
                  name={testResult.kind === 'success' ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={testResult.kind === 'success' ? colors.success : colors.error}
                />
                <View style={styles.testResultContent}>
                  <Text style={[styles.testResultTitle, { color: colors.text }]}>
                    {testResult.kind === 'success' ? '连接成功' : '连接失败'}
                  </Text>
                  <Text style={[styles.testResultMessage, { color: colors.textSecondary }]}>
                    {testResult.message}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.dismissResultButton}
                  onPress={onDismissTestResult}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel="关闭连接测试结果"
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={onSave}
              >
                <Text style={[styles.primaryActionText, { color: colors.textOnPrimary }]}>
                  保存
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={historyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.historyBox, { backgroundColor: colors.surface }]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>历史服务器地址</Text>
              <TouchableOpacity
                onPress={() => setHistoryVisible(false)}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="关闭历史服务器地址"
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <Text style={[styles.emptyHistory, { color: colors.textSecondary }]}>
                暂无历史地址，保存服务器地址后会显示在这里
              </Text>
            ) : (
              <ScrollView
                style={styles.historyList}
                contentContainerStyle={styles.historyListContent}
                showsVerticalScrollIndicator
              >
                {history.map((url) => (
                  <View key={url} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.historySelect}
                      onPress={() => handleSelectHistory(url)}
                      accessibilityRole="button"
                      accessibilityLabel={`选择服务器地址 ${url}`}
                    >
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                      <Text style={[styles.historyUrl, { color: colors.text }]} numberOfLines={2}>
                        {url}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteHistory(url)}
                      hitSlop={HIT_SLOP}
                      accessibilityRole="button"
                      accessibilityLabel={`删除服务器地址 ${url}`}
                    >
                      <Ionicons name="trash-outline" size={19} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  box: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  desc: {
    fontSize: FontSize.sm,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtn: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtn: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  quickBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  testBtnText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    borderWidth: 0,
  },
  secondaryActionText: {
    fontSize: FontSize.base,
  },
  primaryActionText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  testResultContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  testResultTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  testResultMessage: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  dismissResultButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBox: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  historyList: {
    flexGrow: 0,
  },
  historyListContent: {
    gap: Spacing.xs,
  },
  historyRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  historySelect: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  historyUrl: {
    flex: 1,
    fontSize: FontSize.base,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistory: {
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.5,
    paddingVertical: Spacing.base,
  },
});
