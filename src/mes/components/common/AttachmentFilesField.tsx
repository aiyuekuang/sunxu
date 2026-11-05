import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { uploadService, type UploadFileInput } from '../../host/services';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useFileDisplayNames } from '../../host/hooks/useFileDisplayNames';
import { useTheme } from '../../../core/theme/useTheme';
import { downloadAndShareBusinessFile } from '../../host/drawing-file-download';
import { toast } from '../../../core/toast';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { ImagePreviewModal } from '../../../core/components/ImagePreviewModal.tsx';
import { BottomSheet } from '../../../core/components/BottomSheet.tsx';

interface AttachmentFilesFieldProps {
  label: string;
  files: string[];
  onChange?: (files: string[]) => void;
  editable?: boolean;
  required?: boolean;
  imagesOnly?: boolean;
  uploadLabel?: string;
  emptyText?: string;
  maxCount?: number;
  allowedExtensions?: string[];
  selectableFiles?: string[];
}

const IMAGE_FILE_REGEXP = /\.(jpg|jpeg|png|webp|heic|heif)(?:[?#].*)?$/i;
const DOCUMENT_PICKER_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  '*/*',
];
const IMAGE_PICKER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const DEFAULT_FILE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
];
const EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
};

function normalizeFileUrls(urls?: string[] | null): string[] {
  return Array.from(
    new Set((urls ?? []).map((url) => (typeof url === 'string' ? url.trim() : '')).filter(Boolean)),
  );
}

function isImageFile(url: string): boolean {
  return IMAGE_FILE_REGEXP.test(url);
}

function getFileExtension(url: string): string {
  const clean = url.split(/[?#]/, 1)[0] ?? url;
  const name = clean.split('/').pop() ?? '';
  return name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
}

function getDisplayFileName(url: string): string {
  const clean = url.split('?')[0];
  const segments = clean.split('/');
  const raw = segments[segments.length - 1] ?? '';
  if (!raw) return '附件';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function toUploadFiles(assets: DocumentPicker.DocumentPickerAsset[]): UploadFileInput[] {
  return assets.map((asset) => ({
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? undefined,
  }));
}

export function AttachmentFilesField({
  label,
  files,
  onChange,
  editable = false,
  required = false,
  imagesOnly = false,
  uploadLabel = '上传附件',
  emptyText = '暂无附件',
  maxCount = 20,
  allowedExtensions,
  selectableFiles = [],
}: AttachmentFilesFieldProps) {
  const { colors } = useTheme();
  const normalizedFiles = normalizeFileUrls(files);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);
  const [selectedLinkFiles, setSelectedLinkFiles] = useState<string[]>([]);
  const effectiveAllowedExtensions = allowedExtensions ?? DEFAULT_FILE_EXTENSIONS;
  const normalizedSelectableFiles = normalizeFileUrls(selectableFiles).filter((url) =>
    ['jpg', 'jpeg', 'png', 'pdf'].includes(getFileExtension(url)),
  );
  const resolveFileName = useFileDisplayNames(
    normalizeFileUrls([...normalizedFiles, ...normalizedSelectableFiles]),
  );
  const atMaxCount = normalizedFiles.length >= maxCount;

  const pickAndUpload = async () => {
    if (!editable || !onChange) return;
    if (normalizedFiles.length >= maxCount) {
      toast.error(`最多上传 ${maxCount} 个附件`);
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: imagesOnly
        ? IMAGE_PICKER_TYPES
        : allowedExtensions
          ? allowedExtensions
              .map((extension) => EXTENSION_MIME_TYPES[extension.toLowerCase()])
              .filter((mimeType): mimeType is string => Boolean(mimeType))
          : DOCUMENT_PICKER_TYPES,
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const unsupported = allowedExtensions
      ? result.assets.filter(
          (asset) => !effectiveAllowedExtensions.includes(getFileExtension(asset.name)),
        )
      : [];
    if (unsupported.length > 0) {
      toast.error(
        allowedExtensions?.includes('pdf') && allowedExtensions.length <= 4
          ? '图纸仅支持 JPG、PNG、PDF 文件'
          : `仅支持 ${effectiveAllowedExtensions.map((extension) => extension.toUpperCase()).join('、')} 文件`,
      );
      return;
    }
    if (normalizedFiles.length + result.assets.length > maxCount) {
      toast.error(`本次最多还能上传 ${maxCount - normalizedFiles.length} 个附件`);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = await uploadService.uploadBusinessFiles(toUploadFiles(result.assets));
      onChange(normalizeFileUrls([...normalizedFiles, ...uploadedUrls]));
      toast.success('附件上传成功');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '附件上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (url: string) => {
    if (!editable || !onChange) return;
    onChange(normalizedFiles.filter((item) => item !== url));
  };

  const openLinkSheet = () => {
    setSelectedLinkFiles(normalizedSelectableFiles.filter((url) => normalizedFiles.includes(url)));
    setLinkSheetVisible(true);
  };

  const confirmLinkedFiles = () => {
    const rowOnlyFiles = normalizedFiles.filter((url) => !normalizedSelectableFiles.includes(url));
    const next = normalizeFileUrls([...rowOnlyFiles, ...selectedLinkFiles]);
    if (next.length > maxCount) {
      toast.error(`明细行最多关联 ${maxCount} 个附件`);
      return;
    }
    onChange?.(next);
    setLinkSheetVisible(false);
  };

  const toggleLinkedFile = (url: string) => {
    setSelectedLinkFiles((current) =>
      current.includes(url) ? current.filter((item) => item !== url) : [...current, url],
    );
  };

  const openFile = async (url: string) => {
    if (isImageFile(url)) {
      setPreviewImageUrl(url);
      return;
    }

    setDownloadingUrl(url);
    try {
      await downloadAndShareBusinessFile(url, resolveFileName(url, getDisplayFileName(url)));
      toast.success('已打开应用选择器');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '附件下载失败');
    } finally {
      setDownloadingUrl(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required ? ' *' : ''}
        </Text>
        {editable ? (
          <View style={styles.actions}>
            {normalizedSelectableFiles.length > 0 ? (
              <TouchableOpacity
                style={[styles.uploadButton, { borderColor: colors.border }]}
                onPress={openLinkSheet}
                accessibilityRole="button"
                accessibilityHint="选择订单头附件并关联到当前明细行"
              >
                <Ionicons name="link-outline" size={15} color={colors.primary} />
                <Text style={[styles.uploadButtonText, { color: colors.primary }]}>选订单图纸</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                {
                  borderColor: atMaxCount ? colors.border : colors.primary,
                  backgroundColor: atMaxCount ? colors.surfaceSecondary : 'transparent',
                },
                (uploading || atMaxCount) && styles.uploadButtonDisabled,
              ]}
              disabled={uploading || atMaxCount}
              accessibilityRole="button"
              accessibilityState={{ disabled: uploading || atMaxCount }}
              accessibilityHint={atMaxCount ? `已达到附件上限 ${maxCount} 个` : undefined}
              onPress={() => {
                void pickAndUpload();
              }}
            >
              <Ionicons
                name={uploading ? 'cloud-upload-outline' : 'add-outline'}
                size={15}
                color={atMaxCount ? colors.textMuted : colors.primary}
              />
              <Text
                style={[
                  styles.uploadButtonText,
                  { color: atMaxCount ? colors.textMuted : colors.primary },
                ]}
              >
                {uploading ? '上传中' : atMaxCount ? `已达附件上限（${maxCount}）` : uploadLabel}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {normalizedFiles.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyText}</Text>
      ) : (
        <View style={styles.grid}>
          {normalizedFiles.map((url) => {
            const isImage = isImageFile(url);
            const disabled = downloadingUrl === url;
            return (
              <TouchableOpacity
                key={url}
                style={[
                  styles.fileCard,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    opacity: disabled ? 0.55 : 1,
                  },
                ]}
                activeOpacity={0.82}
                disabled={disabled}
                onPress={() => {
                  void openFile(url);
                }}
              >
                {isImage ? (
                  <Image source={{ uri: url }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.fileIconWrap}>
                    <Ionicons
                      name={disabled ? 'cloud-download-outline' : 'document-attach-outline'}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                )}
                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                  {resolveFileName(url, getDisplayFileName(url))}
                </Text>
                {editable ? (
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: colors.surface }]}
                    onPress={() => removeFile(url)}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <BottomSheet
        visible={linkSheetVisible}
        onClose={() => setLinkSheetVisible(false)}
        title="关联订单附件图纸"
        subtitle="所选附件会关联到当前订单明细行"
        confirmText="确定"
        onConfirm={confirmLinkedFiles}
        maxHeightRatio={0.72}
      >
        <View style={styles.linkList}>
          {normalizedSelectableFiles.map((url) => {
            const selected = selectedLinkFiles.includes(url);
            const filename = resolveFileName(url, getDisplayFileName(url));
            const isImage = isImageFile(url);
            return (
              <View key={url} style={[styles.linkOption, { borderBottomColor: colors.border }]}>
                {isImage ? (
                  <Pressable
                    style={styles.linkThumbnailButton}
                    onPress={() => setPreviewImageUrl(url)}
                    accessibilityRole="button"
                    accessibilityLabel={`预览附件：${filename}`}
                    accessibilityHint="在应用内打开图片预览"
                  >
                    <Image source={{ uri: url }} style={styles.linkThumbnail} accessible={false} />
                  </Pressable>
                ) : null}
                <TouchableOpacity
                  style={styles.linkOptionSelect}
                  onPress={() => toggleLinkedFile(url)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`关联附件：${filename}`}
                  accessibilityState={{ checked: selected }}
                >
                  {!isImage ? (
                    <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  ) : null}
                  <Text
                    style={[styles.fileName, styles.linkOptionName, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {filename}
                  </Text>
                  <Ionicons
                    name={selected ? 'checkbox' : 'square-outline'}
                    size={21}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </BottomSheet>
      <ImagePreviewModal
        visible={!!previewImageUrl}
        uri={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  uploadButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  uploadButtonDisabled: {
    borderWidth: 1,
  },
  emptyText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  fileCard: {
    width: '48%',
    minHeight: 116,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  thumbnail: {
    width: '100%',
    height: 72,
    borderRadius: Radius.sm,
  },
  fileIconWrap: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: Radius.full,
  },
  linkList: {
    paddingHorizontal: Spacing.base,
  },
  linkOption: {
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  linkThumbnailButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkOptionSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
  },
  linkOptionName: { flex: 1 },
  linkThumbnail: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
  },
});
