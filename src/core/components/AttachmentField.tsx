import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppText as Text } from './AppText';
import { ActionButton } from './ActionButton';
import { IconActionButton } from './IconActionButton';
import { BorderWidth, FontSize, MIN_TOUCH_TARGET_ANDROID, Spacing, Radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export type AttachmentKind = 'image' | 'video' | 'document' | 'file';
export type AttachmentStatus = 'ready' | 'uploading' | 'error';

/** App-owned file metadata. Sunxu renders it but never reads or writes the file. */
export interface AttachmentFieldItem {
  id: string;
  name: string;
  kind: AttachmentKind;
  status: AttachmentStatus;
  /** Optional human-readable size, type, or other non-sensitive detail. */
  description?: string;
  /** Optional recovery detail shown when status is `error`. */
  errorMessage?: string;
}

export interface AttachmentFieldProps {
  /** Controlled list of app-owned attachment metadata. */
  items: AttachmentFieldItem[];
  label?: string;
  addLabel?: string;
  /** Adds a file through a host-provided picker; selection and upload stay in the host. */
  onAdd?: () => void;
  /** Opens or previews a ready item using host-provided platform behavior. */
  onOpen?: (item: AttachmentFieldItem) => void;
  /** Removes an item or cancels its upload using host-provided behavior. */
  onRemove?: (item: AttachmentFieldItem) => void;
  /** Retries an item in the error state using host-provided behavior. */
  onRetry?: (item: AttachmentFieldItem) => void;
  /** Hides mutating actions while keeping ready items available to open. */
  readOnly?: boolean;
  /** Disables every action while preserving the current attachment display. */
  disabled?: boolean;
  /** Disables actions while a host operation is in progress. */
  busy?: boolean;
  /** Hides the add action when the controlled item count reaches this limit. */
  maxCount?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const KIND_ICON: Record<AttachmentKind, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  image: 'file-image-outline',
  video: 'file-video-outline',
  document: 'file-document-outline',
  file: 'paperclip',
};

function statusLabel(item: AttachmentFieldItem) {
  if (item.status === 'uploading') return '正在上传';
  if (item.status === 'error') return item.errorMessage || '上传失败';
  return item.description;
}

/** Controlled attachment rows with host-owned selection, storage, and preview behavior. */
export function AttachmentField({
  items,
  label = '附件',
  addLabel = '添加附件',
  onAdd,
  onOpen,
  onRemove,
  onRetry,
  readOnly = false,
  disabled = false,
  busy = false,
  maxCount,
  style,
  testID,
}: AttachmentFieldProps) {
  const { colors } = useTheme();
  const atLimit = maxCount !== undefined && items.length >= Math.max(0, maxCount);
  const canMutate = !readOnly && !disabled && !busy;
  const showAdd = Boolean(onAdd) && !readOnly && !atLimit;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.heading}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {maxCount !== undefined ? (
          <Text style={[styles.count, { color: colors.textTertiary }]}>{`${items.length}/${Math.max(0, maxCount)}`}</Text>
        ) : null}
      </View>

      {items.length ? (
        <View style={styles.list}>
          {items.map((item) => {
            const detail = statusLabel(item);
            const isError = item.status === 'error';
            const canOpen = item.status === 'ready' && Boolean(onOpen);
            const rowDisabled = disabled || busy || !canOpen;

            return (
              <View
                key={item.id}
                style={[
                  styles.row,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  disabled && styles.rowDisabled,
                ]}
              >
                <Pressable
                  style={({ pressed }) => [styles.main, pressed && canOpen && !disabled && !busy && styles.pressed]}
                  onPress={canOpen ? () => onOpen?.(item) : undefined}
                  disabled={rowDisabled}
                  accessibilityRole={canOpen ? 'button' : undefined}
                  accessibilityLabel={canOpen ? `打开附件${item.name}` : undefined}
                  accessibilityState={{ disabled: rowDisabled, busy: item.status === 'uploading' }}
                  accessibilityHint={canOpen ? '打开或预览此附件' : undefined}
                >
                  <MaterialCommunityIcons
                    name={KIND_ICON[item.kind]}
                    size={20}
                    color={isError ? colors.error : colors.textSecondary}
                    accessible={false}
                  />
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    {detail ? (
                      <Text
                        style={[styles.detail, { color: isError ? colors.error : colors.textSecondary }]}
                        numberOfLines={2}
                        accessibilityLiveRegion={isError ? 'polite' : 'none'}
                      >
                        {detail}
                      </Text>
                    ) : null}
                  </View>
                  {item.status === 'uploading' ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      accessibilityLabel={`${item.name}正在上传`}
                    />
                  ) : null}
                </Pressable>

                {!readOnly && isError && onRetry ? (
                  <IconActionButton
                    icon="refresh"
                    size={MIN_TOUCH_TARGET_ANDROID}
                    tone="warning"
                    onPress={() => onRetry(item)}
                    accessibilityLabel={`重试上传附件${item.name}`}
                    disabled={!canMutate}
                  />
                ) : null}
                {!readOnly && onRemove ? (
                  <IconActionButton
                    icon="close"
                    size={MIN_TOUCH_TARGET_ANDROID}
                    tone="danger"
                    onPress={() => onRemove(item)}
                    accessibilityLabel={`${item.status === 'uploading' ? '取消' : '移除'}附件${item.name}`}
                    disabled={!canMutate}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.empty, { color: colors.textTertiary }]}>{readOnly || !onAdd ? '暂无附件' : '尚未添加附件'}</Text>
      )}

      {showAdd ? (
        <ActionButton
          variant="outlined"
          size="md"
          icon="paperclip"
          onPress={onAdd}
          disabled={disabled || busy}
          accessibilityLabel={addLabel}
          style={styles.addButton}
        >
          {addLabel}
        </ActionButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { flex: 1, fontSize: FontSize.sm, fontWeight: '500' },
  count: { fontSize: FontSize.xs },
  list: { gap: Spacing.xs },
  row: {
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: BorderWidth.default,
    borderRadius: Radius.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    gap: Spacing.xs,
  },
  rowDisabled: { opacity: 0.6 },
  main: {
    minWidth: 0,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pressed: { opacity: 0.7 },
  copy: { minWidth: 0, flex: 1, paddingVertical: Spacing.xs },
  name: { fontSize: FontSize.sm, fontWeight: '500' },
  detail: { marginTop: 2, fontSize: FontSize.xs, lineHeight: 18 },
  empty: { paddingVertical: Spacing.sm, fontSize: FontSize.sm },
  addButton: { alignSelf: 'flex-start' },
});
