import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { materialService } from '../../../host/services';
import type { UploadFileInput } from '../../../host/services';
import { uploadService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useActionRunner } from '../../../host/hooks/useActionRunner';
import { useFileDisplayNames } from '../../../host/hooks/useFileDisplayNames';
import { useTheme } from '../../../../core/theme/useTheme';
import { downloadAndShareDrawingFile } from '../../../host/drawing-file-download';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DrawingsSectionProps {
  materialId: string;
  drawings: string[];
  canEdit?: boolean;
  onRefresh: () => void;
}

const IMAGE_FILE_REGEXP = /\.(jpg|jpeg|png|webp|heic|heif)(?:[?#].*)?$/i;
function isImageFile(url: string): boolean {
  return IMAGE_FILE_REGEXP.test(url);
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

// ─── Component ────────────────────────────────────────────────────────────────

export function DrawingsSection({
  materialId,
  drawings,
  canEdit = false,
  onRefresh,
}: DrawingsSectionProps) {
  const { colors } = useTheme();
  const { run } = useActionRunner();
  const resolveFileName = useFileDisplayNames(drawings);
  const [uploading, setUploading] = useState(false);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [drawingPolicy, setDrawingPolicy] = useState<Awaited<
    ReturnType<typeof materialService.drawingPolicy>
  > | null>(null);

  useEffect(() => {
    let active = true;
    void materialService
      .drawingPolicy()
      .then((policy) => {
        if (active) setDrawingPolicy(policy);
      })
      .catch(() => {
        // 后端仍会校验上限；策略加载失败时保留上传入口，避免只读页面被阻塞。
      });
    return () => {
      active = false;
    };
  }, []);

  const drawingMaxCount = drawingPolicy?.maxCount;
  const isDrawingLimitReached =
    typeof drawingMaxCount === 'number' && drawings.length >= drawingMaxCount;

  const handleAdd = () => {
    if (!canEdit) return;
    if (isDrawingLimitReached) {
      toast.error(`单个物料最多维护 ${drawingMaxCount ?? '规定数量'} 个图纸附件`);
      return;
    }
    setAddSheetVisible(true);
  };

  const takePhoto = async () => {
    setAddSheetVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      confirmAlert('权限提示', '需要相机权限才能拍照', () => {}, '知道了', false);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadAndSave([
        {
          uri: asset.uri,
          name: asset.fileName ?? undefined,
          mimeType: asset.mimeType ?? undefined,
        },
      ]);
    }
  };

  const pickFromAlbum = async () => {
    setAddSheetVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      confirmAlert('权限提示', '需要相册权限才能选择图片', () => {}, '知道了', false);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled && result.assets.length > 0) {
      await uploadAndSave(
        result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName ?? undefined,
          mimeType: asset.mimeType ?? undefined,
        })),
      );
    }
  };

  const pickDocuments = async () => {
    setAddSheetVisible(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'model/gltf-binary',
        'application/octet-stream',
      ],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      await uploadAndSave(
        result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? undefined,
        })),
      );
    }
  };

  const uploadAndSave = async (files: UploadFileInput[]) => {
    if (!canEdit) {
      toast.error('当前角色没有维护物料图纸的权限');
      return;
    }
    if (isDrawingLimitReached) {
      toast.error(`单个物料最多维护 ${drawingMaxCount ?? '规定数量'} 个图纸附件`);
      return;
    }
    if (typeof drawingMaxCount === 'number' && drawings.length + files.length > drawingMaxCount) {
      toast.error(`本次最多还能上传 ${drawingMaxCount - drawings.length} 个图纸附件`);
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadService.uploadDrawingFiles(files);
      await materialService.addDrawings(materialId, urls);
      toast.success('图纸上传成功');
      onRefresh();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    if (!canEdit) return;
    confirmAlert(
      '删除图纸',
      '确定要删除此图纸？',
      () => run(() => materialService.removeDrawing(materialId, url), '已删除', onRefresh),
      '删除',
    );
  };

  const viewDrawing = (url: string) => {
    if (isImageFile(url)) {
      setPreviewImageUrl(url);
    }
  };

  const downloadDrawing = async (url: string) => {
    setDownloadingUrl(url);
    try {
      await downloadAndShareDrawingFile(url, resolveFileName(url, getDisplayFileName(url)));
      toast.success('已打开应用选择器');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '图纸附件下载失败');
    } finally {
      setDownloadingUrl(null);
    }
  };

  return (
    <>
      <DetailCard
        title={`图纸与3D资料 (${drawings.length})`}
        right={
          canEdit && !isDrawingLimitReached ? (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: `${colors.primary}15` }]}
              onPress={handleAdd}
              disabled={uploading}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>添加</Text>
            </TouchableOpacity>
          ) : undefined
        }
      >
        {uploading && (
          <View style={styles.uploadingRow}>
            <InlineLoading />
            <Text style={[styles.uploadingText, { color: colors.textSecondary }]}>上传中...</Text>
          </View>
        )}
        {drawings.length === 0 && !uploading ? (
          <EmptyState
            compact
            icon="image-outline"
            title="暂无图纸"
            description={canEdit ? '点击添加上传图纸' : '暂无图纸信息'}
          />
        ) : (
          <View style={styles.grid}>
            {drawings.map((url) => (
              <View key={url} style={styles.photoWrap}>
                {isImageFile(url) ? (
                  <TouchableOpacity onPress={() => viewDrawing(url)} activeOpacity={0.8}>
                    <Image
                      source={{ uri: url }}
                      style={[styles.photo, { backgroundColor: colors.surfaceSecondary }]}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.fileCard,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        opacity: downloadingUrl === url ? 0.6 : 1,
                      },
                    ]}
                    activeOpacity={0.82}
                    disabled={downloadingUrl === url}
                    onPress={() => {
                      void downloadDrawing(url);
                    }}
                  >
                    <Ionicons
                      name={downloadingUrl === url ? 'cloud-download-outline' : 'download-outline'}
                      size={22}
                      color={colors.primary}
                    />
                    <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                      {resolveFileName(url, getDisplayFileName(url))}
                    </Text>
                  </TouchableOpacity>
                )}
                {canEdit && (
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.surface }]}
                    onPress={() => handleRemove(url)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </DetailCard>

      {canEdit && (
        <BottomSheet
          visible={addSheetVisible}
          onClose={() => setAddSheetVisible(false)}
          title="添加图纸"
          dynamicHeight
        >
          <View style={styles.addSheetContent}>
            <TouchableOpacity
              style={[styles.addOption, { borderBottomColor: colors.border }]}
              onPress={() => {
                takePhoto().catch((e: unknown) =>
                  toast.error(e instanceof Error ? e.message : '操作失败'),
                );
              }}
            >
              <Ionicons name="camera-outline" size={22} color={colors.text} />
              <Text style={[styles.addOptionText, { color: colors.text }]}>拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => {
                pickFromAlbum().catch((e: unknown) =>
                  toast.error(e instanceof Error ? e.message : '操作失败'),
                );
              }}
            >
              <Ionicons name="images-outline" size={22} color={colors.text} />
              <Text style={[styles.addOptionText, { color: colors.text }]}>从相册选择（多选）</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => {
                pickDocuments().catch((e: unknown) =>
                  toast.error(e instanceof Error ? e.message : '操作失败'),
                );
              }}
            >
              <Ionicons name="document-attach-outline" size={22} color={colors.text} />
              <Text style={[styles.addOptionText, { color: colors.text }]}>
                选择文件（图片/PDF/GLB）
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      <ImagePreviewModal
        visible={!!previewImageUrl}
        uri={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  addBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  photoWrap: { position: 'relative' },
  photo: { width: 88, height: 88, borderRadius: Radius.sm },
  fileCard: {
    width: 88,
    height: 88,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.xs,
  },
  fileName: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 14,
  },
  removeBtn: { position: 'absolute', top: -6, right: -6, borderRadius: Radius.md },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  uploadingText: { fontSize: FontSize.xs },
  addSheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addOptionText: {
    fontSize: FontSize.base,
  },
});
