import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toast } from '../toast';
import { ImagePreviewModal } from './ImagePreviewModal';

const PHOTO_ACTION_TARGET = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

/** 包装 async onPress 回调，捕获未处理的 rejection */
const safeAsync = (fn: () => Promise<void>) => () => {
  fn().catch((e: unknown) => {
    toast.error(e instanceof Error ? e.message : '操作失败');
  });
};

export interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxCount?: number;
  label?: string;
  /** Restrict selection to the camera. Upload and record workflows stay with the host. */
  cameraOnly?: boolean;
  /** 是否允许一次从相册选择多张图片。 */
  allowsMultipleSelection?: boolean;
  /** 标记首张为封面，并允许调整封面顺序。 */
  showCoverControls?: boolean;
  /** Let the host finish asynchronous capture processing before the photo is added. */
  onPhotoCaptured?: (uri: string) => void | Promise<void>;
  addLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Disable edits while the host processes selected photos. */
  busy?: boolean;
  testID?: string;
}

export const PhotoPicker = ({
  photos,
  onPhotosChange,
  maxCount = 3,
  label = '照片',
  cameraOnly = false,
  allowsMultipleSelection = false,
  showCoverControls = false,
  onPhotoCaptured,
  addLabel = '添加照片',
  disabled = false,
  readOnly = false,
  busy = false,
  testID,
}: PhotoPickerProps) => {
  const { colors } = useTheme();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const canEdit = !disabled && !readOnly && !busy && !isWorking;

  const appendPhotos = (uris: string[]) => {
    const current = photosRef.current;
    const remaining = Math.max(0, maxCount - current.length);
    const next = [...current, ...uris.slice(0, remaining)];
    photosRef.current = next;
    onPhotosChange(next);
  };

  const takePhoto = async () => {
    if (!canEdit) return;
    setIsWorking(true);
    try {
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
        await onPhotoCaptured?.(uri);
        appendPhotos([uri]);
      }
    } finally {
      setIsWorking(false);
    }
  };

  const pickFromAlbum = async () => {
    if (!canEdit) return;
    setIsWorking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限提示', '需要相册权限才能选择图片');
        return;
      }
      const current = photosRef.current;
      const remaining = Math.max(0, maxCount - current.length);
      if (remaining === 0) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsMultipleSelection,
        selectionLimit: allowsMultipleSelection ? remaining : 1,
      });
      if (!result.canceled && result.assets.length) {
        appendPhotos(result.assets.map((asset) => asset.uri));
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleAdd = () => {
    if (!canEdit || photos.length >= maxCount) return;
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
    if (!canEdit) return;
    const next = [...photosRef.current];
    next.splice(index, 1);
    photosRef.current = next;
    onPhotosChange(next);
  };

  const setCoverPhoto = (index: number) => {
    if (!canEdit || index <= 0 || index >= photosRef.current.length) return;
    const current = photosRef.current;
    const nextPhotos = [current[index], ...current.filter((_, photoIndex) => photoIndex !== index)];
    photosRef.current = nextPhotos;
    onPhotosChange(nextPhotos);
  };

  return (
    <View testID={testID}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <View key={uri} style={styles.photoWrap}>
            <Pressable
              onPress={() => setPreviewUri(uri)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`预览照片 ${index + 1}`}
              testID={testID ? `${testID}-preview-${index + 1}` : undefined}
            >
              <Image source={{ uri }} style={styles.photo} />
            </Pressable>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removePhoto(index)}
              disabled={!canEdit}
              accessibilityRole="button"
              accessibilityLabel={`移除照片 ${index + 1}`}
              accessibilityState={{ disabled: !canEdit }}
              testID={testID ? `${testID}-remove-${index + 1}` : undefined}
            >
              <View style={[styles.removeIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </View>
            </TouchableOpacity>
            {showCoverControls ? (
              <>
                <View
                  style={[
                    styles.coverBadge,
                    {
                      backgroundColor:
                        index === 0 ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Text
                    style={[
                      styles.coverText,
                      {
                        color:
                          index === 0 ? colors.textOnPrimary : colors.textSecondary,
                      },
                    ]}
                  >
                    {index === 0 ? '封面' : `${index + 1}`}
                  </Text>
                </View>
                {index > 0 && !readOnly ? (
                  <TouchableOpacity
                    style={styles.setCoverBtn}
                    onPress={() => setCoverPhoto(index)}
                    hitSlop={8}
                    disabled={!canEdit}
                    accessibilityRole="button"
                    accessibilityLabel={`将照片 ${index + 1} 设为封面`}
                    accessibilityState={{ disabled: !canEdit }}
                    testID={testID ? `${testID}-cover-${index + 1}` : undefined}
                  >
                    <View style={[styles.coverActionIcon, { backgroundColor: colors.surface }]}>
                      <Ionicons name="star-outline" size={15} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </View>
        ))}
        {!readOnly && photos.length < maxCount && (
          <TouchableOpacity
            style={[
              styles.addBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
            onPress={handleAdd}
            disabled={!canEdit}
            accessibilityRole="button"
            accessibilityLabel={
              busy || isWorking
                ? '正在处理照片'
                : `${addLabel}，已选择 ${photos.length} 张，共 ${maxCount} 张`
            }
            accessibilityState={{ disabled: !canEdit, busy: busy || isWorking }}
            testID={testID ? `${testID}-add` : undefined}
          >
            <Ionicons name="camera" size={24} color={colors.textSecondary} />
            <Text style={[styles.addText, { color: colors.textSecondary }]}>
              {photos.length === 0 ? addLabel : `${photos.length}/${maxCount}`}
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
  removeBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: PHOTO_ACTION_TARGET,
    height: PHOTO_ACTION_TARGET,
    borderRadius: PHOTO_ACTION_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  coverBadge: {
    position: 'absolute',
    left: 3,
    top: 3,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  coverText: { fontSize: 9, lineHeight: 12, fontWeight: '600' },
  setCoverBtn: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: PHOTO_ACTION_TARGET,
    height: PHOTO_ACTION_TARGET,
    borderRadius: PHOTO_ACTION_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
