import { memo, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { AppText as Text } from '../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';

interface SupportWechatQrProps {
  qrValue: string;
  contactLabel: string;
  hint: string;
  encodeQr: (value: string) => Uint8Array | Promise<Uint8Array>;
  size?: number;
  style?: ViewStyle;
}

const QUIET_ZONE = 4;

export const SupportWechatQr = memo(function SupportWechatQr({
  qrValue,
  contactLabel,
  hint,
  encodeQr,
  size = 128,
  style,
}: SupportWechatQrProps) {
  const { colors } = useTheme();
  const [matrix, setMatrix] = useState<Uint8Array | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.resolve(encodeQr(qrValue))
      .then((result) => {
        if (mounted) setMatrix(result);
      })
      .catch(() => {
        if (!mounted) return;
        setFailed(true);
      });

    return () => {
      mounted = false;
    };
  }, [encodeQr, qrValue]);

  const cells = matrix ? Math.sqrt(matrix.length) : 0;
  const viewBoxSize = cells + QUIET_ZONE * 2;
  const darkModules = useMemo(() => {
    if (!matrix || cells <= 0) return [];

    const modules: Array<{ key: string; x: number; y: number }> = [];
    for (let y = 0; y < cells; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        if (matrix[y * cells + x] === 1) {
          modules.push({ key: `${x}-${y}`, x: x + QUIET_ZONE, y: y + QUIET_ZONE });
        }
      }
    }
    return modules;
  }, [cells, matrix]);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.qrCard, { borderColor: colors.border }]}>
        {!matrix && !failed ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ width: size, height: size }}
          />
        ) : failed ? (
          <View style={[styles.qrFallback, { width: size, height: size }]}>
            <Text style={[styles.fallbackText, { color: colors.textMuted }]}>二维码生成失败</Text>
          </View>
        ) : (
          <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
            <Rect x={0} y={0} width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" />
            {darkModules.map((module) => (
              <Rect
                key={module.key}
                x={module.x}
                y={module.y}
                width={1}
                height={1}
                fill="#000000"
              />
            ))}
          </Svg>
        )}
      </View>
      <Text style={[styles.wechatText, { color: colors.text }]}>{contactLabel}</Text>
      <Text style={[styles.hintText, { color: colors.textSecondary }]}>
        {hint}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qrCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FFFFFF',
  },
  qrFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  wechatText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  hintText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
