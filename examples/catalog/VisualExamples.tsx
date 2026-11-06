import type React from 'react';
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  AppText,
  ChartLegend,
  ChartPanel,
  DetailScreenContainer,
  MapScreenContainer,
  FontSize,
  Radius,
  Spacing,
  useTheme,
  type ChartLegendItem,
} from 'sunxu';
import { MapControlStack, MapCurrentLocationMarker, MapLocationButton, MapMarker } from 'sunxu/maps';
import { SunxuBarChart, SunxuLineChart, SunxuPieChart, SunxuRadarChart } from 'sunxu/charts';

export function VisualExamples({ onBack, footer }: { onBack: () => void; footer: React.ReactNode }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [locationMessage, setLocationMessage] = useState('点击定位按钮后，宿主地图驱动器可将镜头移动到坐标');
  const chartWidth = Math.max(220, Math.min(width - 104, 420));
  const mapHeight = Math.min(300, Math.max(184, height - 176));
  const legendItems: ChartLegendItem[] = [
    { id: 'visit', label: '拜访', color: colors.primary },
    { id: 'call', label: '电话', color: colors.success },
    { id: 'task', label: '任务', color: colors.warning },
  ];

  return (
    <DetailScreenContainer title="地图与图表" onBack={onBack} footer={footer}>
      <View style={styles.content}>
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>MapScreenContainer · 地图叠层</AppText>
          <MapScreenContainer
            safeArea={false}
            testID="demo-map-screen"
            style={[styles.map, { height: mapHeight, borderColor: colors.border }]}
            topTrailing={
              <MapControlStack>
                <MapLocationButton
                  onLocation={(point) =>
                    setLocationMessage(`已获取坐标 ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`)
                  }
                  onLocationError={(error) => setLocationMessage(error.message)}
                />
              </MapControlStack>
            }
            bottomLeading={
              <View style={[styles.mapCaption, { backgroundColor: colors.surface }]}>
                <AppText style={[styles.mapCaptionText, { color: colors.text }]}>地图视图由宿主 SDK 注入</AppText>
              </View>
            }
          >
            <View style={[styles.mapMock, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.road, styles.roadA, { backgroundColor: colors.surface }]} />
              <View style={[styles.road, styles.roadB, { backgroundColor: colors.surface }]} />
              <View style={[styles.road, styles.roadC, { backgroundColor: colors.surface }]} />
              <View style={styles.demoMarker}><MapMarker label="示例地点" /></View>
              <View style={styles.demoCurrent}><MapCurrentLocationMarker /></View>
              <View style={[styles.locationMessage, { backgroundColor: colors.surface }]}>
                <AppText style={[styles.locationText, { color: colors.textSecondary }]}>{locationMessage}</AppText>
              </View>
            </View>
          </MapScreenContainer>
          <AppText style={[styles.hint, { color: colors.textSecondary }]}>
            定位权限与坐标由 Sunxu 处理；相机移动、底图和坐标系转换由宿主地图适配器处理。
          </AppText>
        </View>

        <ChartPanel
          testID="demo-bar-chart"
          title="月度活动 · 柱状图"
          subtitle="统一主题、坐标轴和图例；数据请求留在宿主。"
          legend={<ChartLegend items={legendItems} />}
        >
          <SunxuBarChart
            data={[
              { value: 18, label: '一月' },
              { value: 26, label: '二月' },
              { value: 22, label: '三月' },
              { value: 34, label: '四月' },
              { value: 29, label: '五月' },
            ]}
            width={chartWidth}
            height={190}
            barWidth={28}
            spacing={24}
            noOfSections={4}
            initialSpacing={10}
            isAnimated={false}
          />
        </ChartPanel>

        <ChartPanel testID="demo-line-chart" title="趋势 · 折线图" subtitle="同一套主题轴线与文字色。">
          <SunxuLineChart
            data={[
              { value: 12, label: '一月' },
              { value: 18, label: '二月' },
              { value: 15, label: '三月' },
              { value: 24, label: '四月' },
              { value: 28, label: '五月' },
            ]}
            width={chartWidth}
            height={180}
            noOfSections={4}
            isAnimated={false}
          />
        </ChartPanel>

        <ChartPanel testID="demo-pie-chart" title="客户来源 · 饼图">
          <SunxuPieChart
            data={[
              { value: 48, text: '转介绍' },
              { value: 31, text: '线上' },
              { value: 21, text: '展会' },
            ]}
            radius={88}
            showText
            textSize={11}
            isAnimated={false}
          />
        </ChartPanel>

        <ChartPanel testID="demo-radar-chart" title="能力维度 · 雷达图">
          <SunxuRadarChart
            data={[82, 68, 91, 74, 78]}
            labels={['需求分析', '方案沟通', '客户维护', '推进效率', '成交能力']}
            maxValue={100}
            noOfSections={4}
            chartSize={Math.min(chartWidth, 280)}
          />
        </ChartPanel>
      </View>
    </DetailScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.base, paddingVertical: Spacing.sm },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600', marginHorizontal: Spacing.sm },
  map: { height: 300, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg },
  mapMock: { flex: 1, overflow: 'hidden' },
  road: { position: 'absolute', height: 13, borderRadius: 10, opacity: 0.82 },
  roadA: { width: '120%', left: -18, top: 92, transform: [{ rotate: '-12deg' }] },
  roadB: { width: '110%', left: 55, top: 140, transform: [{ rotate: '57deg' }] },
  roadC: { width: '85%', left: -24, top: 208, transform: [{ rotate: '21deg' }] },
  demoMarker: { position: 'absolute', top: 42, left: '24%' },
  demoCurrent: { position: 'absolute', right: '22%', bottom: 66 },
  locationMessage: { position: 'absolute', left: 12, right: 70, bottom: 12, padding: 8, borderRadius: 8 },
  locationText: { fontSize: 11, lineHeight: 16 },
  mapCaption: { paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 3, borderRadius: Radius.md },
  mapCaptionText: { fontSize: FontSize.xs, fontWeight: '600' },
  hint: { fontSize: FontSize.xs, lineHeight: 17, marginHorizontal: Spacing.sm },
});
