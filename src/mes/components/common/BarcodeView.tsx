import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';

interface BarcodeViewProps {
  /** 条码内容文本（会被编码到条码图案中） */
  text: string;
  /**
   * 条码类型
   * - code128 / ean13：1D 条码，后端 bwip-js 会在图片底部自动渲染 text 作为可读文本
   * - qrcode / datamatrix：2D 条码，图片内不含可读文本，必须通过 label 提供
   */
  type?: 'code128' | 'qrcode' | 'ean13' | 'datamatrix';
  /**
   * 图片下方额外展示的标签文本（由前端 RN Text 渲染，非后端 alttext）。
   *
   * ⚠️ 使用场景：
   * - code128/ean13：仅当需要展示"和 text 不同的补充信息"时传入（如物料 barcode 图 + code 标签）；
   *   **禁止传入和 text 相同的值**，会与图片自带文本重复。
   * - qrcode/datamatrix：必须传入，否则用户无法识读内容。
   */
  label?: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 布局自定义 */
  style?: ViewStyle;
  /** Host-owned encoder; returns a base64 PNG without the data URI prefix. */
  generateBarcode: (input: { text: string; type: NonNullable<BarcodeViewProps['type']> }) => Promise<string>;
}

export function BarcodeView({
  text,
  type = 'code128',
  label,
  width,
  height,
  style,
  generateBarcode,
}: BarcodeViewProps) {
  const isSquare = type === 'qrcode' || type === 'datamatrix';
  const finalSize = width ?? (isSquare ? 180 : 240);
  const finalHeight = height ?? (isSquare ? finalSize : 56);
  const { colors } = useTheme();
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!text) return;
    setLoading(true);
    setError(false);
    generateBarcode({ text, type })
      .then((result) => {
        setBase64(result);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [generateBarcode, text, type]);

  const handleShare = async () => {
    if (!base64) return;
    const path = `${FileSystem.cacheDirectory}barcode_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Sharing.shareAsync(path, { mimeType: 'image/png' });
  };

  if (!text) return null;

  return (
    <View style={[styles.container, style]}>
      {/* 条码图片区域 — 白底圆角容器 */}
      <View style={[styles.barcodeCard, { borderColor: colors.border }]}>
        <View style={styles.barcodeWrap}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ width: finalSize, height: finalHeight }}
            />
          ) : error ? (
            <Text style={[styles.errorText, { color: colors.textMuted }]}>条码生成失败</Text>
          ) : base64 ? (
            <Image
              source={{ uri: `data:image/png;base64,${base64}` }}
              style={[{ width: finalSize, height: finalHeight }, isSquare && { aspectRatio: 1 }]}
              resizeMode="contain"
            />
          ) : null}
        </View>

        {/* 标签居中在条码下方 */}
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>

      {/* 分享按钮 */}
      {base64 && !loading && (
        <Pressable
          style={({ pressed }) => [
            styles.shareBtn,
            { backgroundColor: `${colors.primary}10` },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={16} color={colors.primary} />
          <Text style={[styles.shareText, { color: colors.primary }]}>分享条码图片</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barcodeCard: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  barcodeWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: FontSize.sm,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  shareText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
