import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { qualityService } from '../../../host/services';
import { uploadService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

interface QualityPhotosSectionProps {
  inspectionId: string;
  photos: string[];
  canUpload: boolean;
  onRefresh: () => void;
}

export function QualityPhotosSection({
  inspectionId,
  photos,
  canUpload,
  onRefresh,
}: QualityPhotosSectionProps) {
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const openUploadSheet = () => {
    setLocalPhotos([]);
    setSheetVisible(true);
  };

  const handleUpload = async () => {
    if (localPhotos.length === 0) {
      toast.error('请先选择照片');
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadService.uploadImages(localPhotos);
      await qualityService.addPhotos(inspectionId, urls);
      toast.success(`已上传 ${urls.length} 张照片`);
      setSheetVisible(false);
      setLocalPhotos([]);
      onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '照片上传失败');
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload && photos.length === 0) return null;

  return (
    <>
      <DetailCard
        title={`质检照片（${photos.length}）`}
        right={
          canUpload ? (
            <TouchableOpacity onPress={openUploadSheet} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>上传</Text>
            </TouchableOpacity>
          ) : undefined
        }
      >
        {photos.length === 0 ? (
          <EmptyState
            compact
            icon="camera-outline"
            title="暂无照片"
            description={canUpload ? '点击右上角上传' : undefined}
          />
        ) : (
          <View style={styles.photoGrid}>
            {photos.map((url) => (
              <Pressable key={url} onPress={() => setPreviewPhotoUrl(url)}>
                <Image source={{ uri: url }} style={styles.photoItem} />
              </Pressable>
            ))}
          </View>
        )}
      </DetailCard>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="上传质检照片"
        confirmText="确认上传"
        onConfirm={handleUpload}
        loading={uploading}
        avoidKeyboard
        dynamicHeight
      >
        <PhotoPicker
          photos={localPhotos}
          onPhotosChange={setLocalPhotos}
          maxCount={5}
          label="质检照片"
        />
      </BottomSheet>

      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
  },
});
