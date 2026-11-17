import type { ReactNode } from 'react';
import { Text, View } from '@tarojs/components';
import { Button } from './Button';
import { Icon } from './Icon';

export type AttachmentKind = 'image' | 'video' | 'document' | 'file';
export type AttachmentStatus = 'ready' | 'uploading' | 'error';

export interface AttachmentItem {
  id: string;
  name: string;
  kind?: AttachmentKind;
  meta?: string;
  status?: AttachmentStatus;
  statusText?: string;
}

export interface AttachmentAddAction {
  key: string;
  label: string;
  accessibilityLabel?: string;
  icon?: ReactNode;
  onPress: () => void;
}

/**
 * Shared attachment presentation and interaction states. File selection,
 * transfer, authorization, preview and persistence stay with the host app.
 */
export function AttachmentField({
  items,
  onOpen,
  onRemove,
  onRetry,
  addActions = [],
  label,
  emptyText = '暂无附件',
  loadingText = '正在读取附件',
  busyText = '正在处理附件',
  maxCount,
  loading = false,
  busy = false,
  disabled = false,
  readOnly = false,
  className = '',
}: {
  items: readonly AttachmentItem[];
  onOpen?: (item: AttachmentItem) => void;
  onRemove?: (item: AttachmentItem) => void;
  onRetry?: (item: AttachmentItem) => void;
  addActions?: readonly AttachmentAddAction[];
  label?: string;
  emptyText?: string;
  loadingText?: string;
  busyText?: string;
  maxCount?: number;
  loading?: boolean;
  busy?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  const canEdit = !disabled && !readOnly;
  const limit = maxCount === undefined ? undefined : Math.max(0, maxCount);
  const canAdd = canEdit && !busy && (limit === undefined || items.length < limit);
  const visibleActions = canAdd ? addActions : [];

  return (
    <View className={`app-attachment-field${className ? ` ${className}` : ''}`}>
      {label || maxCount !== undefined ? (
        <View className="app-attachment-field__heading">
          {label ? <Text className="app-attachment-field__label">{label}</Text> : null}
          {limit !== undefined ? <Text className="app-attachment-field__count">{items.length}/{limit}</Text> : null}
        </View>
      ) : null}
      {loading ? <View className="app-attachment-field__state" role="status"><Text>{loadingText}</Text></View> : null}
      {!loading && items.length === 0 ? <Text className="app-attachment-field__state">{emptyText}</Text> : null}
      {!loading && items.length > 0 ? (
        <View className="app-attachment-field__list">
          {items.map((item) => {
            const kind = item.kind || 'file';
            const kindLabel = kind === 'image' ? '图片' : kind === 'video' ? '视频' : kind === 'document' ? '文档' : '文件';
            const itemName = item.name || '未命名附件';
            const itemUploading = item.status === 'uploading';
            const itemUnavailable = busy || itemUploading || item.status === 'error';
            const statusText = item.statusText || (item.status === 'uploading' ? busyText : item.status === 'error' ? '上传失败' : '');
            return (
              <View className={`app-attachment-field__item${item.status === 'error' ? ' is-error' : ''}`} key={item.id}>
                <Button
                  className="app-attachment-field__open"
                  ariaLabel={`${item.status === 'uploading' ? '正在上传' : '打开'}${kindLabel}${itemName}`}
                  disabled={disabled || itemUnavailable || !onOpen}
                  onClick={() => onOpen?.(item)}
                  plain
                  appearance="plain"
                  uiSize="row"
                >
                  <Icon name="document-attach-outline" className="app-attachment-field__icon" />
                  <View className="app-attachment-field__details">
                    <Text className="app-attachment-field__name">{itemName}</Text>
                    <Text className="app-attachment-field__meta">{item.meta || kindLabel}</Text>
                    {statusText ? <Text className={`app-attachment-field__status${item.status === 'error' ? ' is-error' : ''}`}>{statusText}</Text> : null}
                  </View>
                </Button>
                {item.status === 'error' && onRetry && canEdit ? (
                  <Button ariaLabel={`重试上传${itemName}`} disabled={busy} onClick={() => onRetry(item)} plain appearance="plain" uiSize="row" className="app-attachment-field__retry">重试</Button>
                ) : null}
                {onRemove && canEdit ? (
                  <Button ariaLabel={`${itemUploading ? '取消上传' : '删除'}附件${itemName}`} disabled={busy} onClick={() => onRemove(item)} plain appearance="plain" uiSize="row" className="app-attachment-field__remove">{itemUploading ? '取消上传' : '删除'}</Button>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
      {busy && !loading ? <View className="app-attachment-field__state" role="status"><Text>{busyText}</Text></View> : null}
      {visibleActions.length ? (
        <View className="app-attachment-field__actions">
          {visibleActions.map((action) => (
            <Button
              key={action.key}
              ariaLabel={action.accessibilityLabel || action.label}
              disabled={busy}
              onClick={action.onPress}
              plain
              appearance="plain"
              uiSize="link"
              className="app-attachment-field__add"
            >
              {action.icon || <Icon name="add-outline" />}
              <Text>{action.label}</Text>
            </Button>
          ))}
        </View>
      ) : null}
    </View>
  );
}
