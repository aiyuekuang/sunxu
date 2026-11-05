import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from './AppText.tsx';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toast } from '../toast';
import { ImagePreviewModal } from './ImagePreviewModal.tsx';

/** 包装 async onPress 回调，捕获未处理的 rejection */
const safeAsync = (fn: () => Promise<void>) => () => {
  fn().catch((e: unknown) => {
    toast.error(e instanceof Error ? e.message : '操作失败');
  });
};

interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxCount?: number;
  label?: string;
  /** 点检证据只允许现场拍照；成功拍摄后可先上传并由服务端签发证据。 */
  cameraOnly?: boolean;
  onPhotoCaptured?: (uri: string) => Promise<string | undefined>;
  onPhotoEvidenceChange?: (evidenceIds: string[]) => void;
}

export const PhotoPicker = ({
  photos,
  onPhotosChange,
  maxCount = 3,
  label = '拍照凭证',
  cameraOnly = false,
  onPhotoCaptured,
  onPhotoEvidenceChange,
}: PhotoPickerProps) => {
  const { colors } = useTheme();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);

  useEffect(() => {
    if (photos.length === 0 && evidenceIds.length > 0) {
      setEvidenceIds([]);
      onPhotoEvidenceChange?.([]);
    }
  }, [evidenceIds, onPhotoEvidenceChange, photos.length]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限提示', '需要相机权限才能拍照');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const evidenceId = onPhotoCaptured ? await onPhotoCaptured(uri) : undefined;
      if (evidenceId) {
        const nextEvidenceIds = [...evidenceIds, evidenceId];
        setEvidenceIds(nextEvidenceIds);
        onPhotoEvidenceChange?.(nextEvidenceIds);
      }
      onPhotosChange([...photos, uri]);
    }
  };

  const pickFromAlbum = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限提示', '需要相册权限才能选择图片');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      onPhotosChange([...photos, result.assets[0].uri]);
    }
  };

  const handleAdd = () => {
    if (cameraOnly) {
      safeAsync(takePhoto)();
      return;
    }
    Alert.alert('添加照片', '选择方式', [
      { text: '拍照', onPress: safeAsync(takePhoto) },
      { text: '从相册选择', onPress: safeAsync(pickFromAlbum) },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const removePhoto = (index: number) => {
    const next = [...photos];
    next.splice(index, 1);
    if (evidenceIds[index]) {
      const nextEvidenceIds = [...evidenceIds];
      nextEvidenceIds.splice(index, 1);
      setEvidenceIds(nextEvidenceIds);
      onPhotoEvidenceChange?.(nextEvidenceIds);
    }
    onPhotosChange(next);
  };

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <View key={uri} style={styles.photoWrap}>
            <Pressable onPress={() => setPreviewUri(uri)}>
              <Image source={{ uri }} style={styles.photo} />
            </Pressable>
            <TouchableOpacity
              style={[styles.removeBtn, { backgroundColor: colors.surface }]}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < maxCount && (
          <TouchableOpacity
            style={[
              styles.addBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
            onPress={handleAdd}
          >
            <Ionicons name="camera" size={24} color={colors.textSecondary} />
            <Text style={[styles.addText, { color: colors.textSecondary }]}>
              {photos.length === 0 ? '拍照' : `${photos.length}/${maxCount}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ImagePreviewModal
        visible={!!previewUri}
        uri={previewUri}
        onClose={() => setPreviewUri(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginTop: Spacing.sm + 2,
    marginBottom: Spacing.xs,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  photoWrap: { position: 'relative' },
  photo: { width: 72, height: 72, borderRadius: Radius.sm },
  removeBtn: { position: 'absolute', top: -6, right: -6, borderRadius: 10 },
  addBtn: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  addText: { fontSize: FontSize.xs },
});
