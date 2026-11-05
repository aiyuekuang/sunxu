import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReportCatalogItem } from '../../../host/services';
import { MIN_TOUCH_TARGET, Spacing } from '../../../../core/theme/tokens';
import { useFontScale } from '../../../../core/theme/font-scale';
import { ReportCatalogCard } from './ReportCatalogCard.tsx';

interface ReportMenuGridProps {
  items: ReportCatalogItem[];
  onOpen: (item: ReportCatalogItem) => void;
  onToggleFavorite?: (item: ReportCatalogItem) => void;
  mode?: 'open' | 'manage';
  pending?: boolean;
  testID: string;
}

/** 三列九宫格；容器变窄或字体放大时减少列数，保留完整名称和触控面积。 */
export function ReportMenuGrid({
  items,
  onOpen,
  onToggleFavorite,
  mode,
  pending,
  testID,
}: ReportMenuGridProps) {
  const [width, setWidth] = useState(0);
  const fontScale = useFontScale();
  const minCellWidth = MIN_TOUCH_TARGET * 2 * fontScale;
  const columns = width
    ? Math.max(1, Math.min(3, Math.floor((width + Spacing.sm) / (minCellWidth + Spacing.sm))))
    : 3;
  const cellWidth = width ? (width - Spacing.sm * (columns - 1)) / columns : undefined;

  return (
    <View
      testID={testID}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={styles.grid}
    >
      {items.map((item) => (
        <View key={item.reportCode} style={[styles.cell, { width: cellWidth }]}>
          <ReportCatalogCard
            item={item}
            onPress={() => onOpen(item)}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
            mode={mode}
            favoritePending={pending}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'stretch' },
  cell: { flexGrow: 0, flexShrink: 0 },
});
