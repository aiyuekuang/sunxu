import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface ReportPhotosSectionProps {
  photoUrls?: string[] | null;
  scrapPhotoUrls?: string[] | null;
  onPreview: (url: string) => void;
}

function uniqueUrls(urls?: string[] | null): string[] {
  return Array.from(new Set((urls ?? []).map((url) => url.trim()).filter(Boolean)));
}

export function ReportPhotosSection({
  photoUrls,
  scrapPhotoUrls,
  onPreview,
}: ReportPhotosSectionProps) {
  const { colors } = useTheme();
  const groups = [
    { title: '现场照片', urls: uniqueUrls(photoUrls) },
    { title: '报废照片', urls: uniqueUrls(scrapPhotoUrls) },
  ].filter((group) => group.urls.length > 0);

  if (groups.length === 0) return null;

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {group.title}（{group.urls.length}）
          </Text>
          <View style={styles.photos}>
            {group.urls.map((url, index) => (
              <Pressable
                key={url}
                accessibilityRole="button"
                accessibilityLabel={`查看${group.title}第 ${index + 1} 张`}
                onPress={() => onPreview(url)}
                style={styles.photoButton}
              >
                <Image source={{ uri: url }} style={styles.photo} resizeMode="cover" />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm, paddingLeft: 2 },
  group: { gap: Spacing.xs },
  label: { fontSize: FontSize.xs, fontWeight: '500' },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  photoButton: { minWidth: 56, minHeight: 56 },
  photo: { width: 56, height: 56, borderRadius: Radius.sm },
});
