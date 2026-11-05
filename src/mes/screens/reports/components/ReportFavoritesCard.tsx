import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ReportCatalogItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { LoadingView } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { getReportMenuItems, isReportDetailCode, REPORT_COMMON_LIMIT } from '../report-menu';
import { useReportCatalog } from '../useReportCatalog';
import { ReportMenuGrid } from './ReportMenuGrid.tsx';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

function ReportFavoritesCard() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items: catalogItems, loading, failed, reload } = useReportCatalog();
  const items = getReportMenuItems(catalogItems)
    .filter((item) => item.isFavorite)
    .slice(0, REPORT_COMMON_LIMIT);
  const openCatalog = () => navigation.navigate('ReportCatalog');
  const openItem = useCallback(
    (item: ReportCatalogItem) => {
      if (isReportDetailCode(item.reportCode))
        navigation.navigate('ReportDetail', { reportCode: item.reportCode });
    },
    [navigation],
  );

  return (
    <View testID="report-common" style={styles.container}>
      <ReportSectionHeader
        testID="report-common-header"
        title="常用报表"
        action={
          <TouchableOpacity
            onPress={openCatalog}
            style={styles.moreButton}
            accessibilityRole="button"
            accessibilityLabel="查看全部报表"
          >
            <Text style={[styles.moreText, { color: colors.primary }]}>全部报表</Text>
          </TouchableOpacity>
        }
      />
      {loading ? (
        <LoadingView />
      ) : failed ? (
        <EmptyState
          compact
          icon="cloud-offline-outline"
          title="常用报表加载失败"
          action={{ label: '重试', onPress: reload }}
        />
      ) : items.length === 0 ? (
        <EmptyState compact icon="star-outline" title="暂无常用报表" />
      ) : (
        <ReportMenuGrid testID="report-common-grid" items={items} onOpen={openItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  moreButton: {
    justifyContent: 'center',
    minHeight: Spacing['4xl'],
    paddingHorizontal: Spacing.xs,
  },
  moreText: { fontSize: FontSize.sm, fontWeight: '600' },
});

export default ReportFavoritesCard;
