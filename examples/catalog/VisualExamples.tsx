import type React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  AudioPlayer,
  ActionButton,
  AppText,
  ChartLegend,
  ChartPanel,
  DetailScreenContainer,
  DialPad,
  ListCard,
  ListScreenContainer,
  MapScreenContainer,
  PersistentBottomSheet,
  BorderWidth,
  ControlSize,
  FontSize,
  Radius,
  Spacing,
  MotionDuration,
  SearchBar,
  Skeleton,
  useTheme,
  type ChartLegendItem,
} from 'sunxu';
import { MapControlStack, MapCurrentLocationMarker, MapLocationButton, MapMarker } from 'sunxu/maps';
import { SunxuBarChart, SunxuLineChart, SunxuPieChart, SunxuRadarChart } from 'sunxu/charts';

export function VisualExamples({ onBack, footer }: { onBack: () => void; footer: React.ReactNode }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [locationMessage, setLocationMessage] = useState('点击定位按钮后，宿主地图驱动器可将镜头移动到坐标');
  const [dialValue, setDialValue] = useState('');
  const [dialSubmitted, setDialSubmitted] = useState('');
  const [persistentSheetOpen, setPersistentSheetOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [nestedSearch, setNestedSearch] = useState('');
  const chartWidth = Math.max(220, Math.min(width - 104, 420));
  const mapHeight = Math.min(300, Math.max(184, height - 176));
  const legendItems: ChartLegendItem[] = [
    { id: 'visit', label: '拜访', color: colors.primary },
    { id: 'call', label: '电话', color: colors.success },
    { id: 'task', label: '任务', color: colors.warning },
  ];

  return (
    <DetailScreenContainer title="共享控件与地图图表" onBack={onBack} footer={footer}>
      <View style={styles.content}>
        <View style={styles.section} testID="demo-dial-pad">
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>DialPad · 拨号键盘</AppText>
          <DialPad
            value={dialValue}
            onChangeText={setDialValue}
            onSubmit={setDialSubmitted}
          />
          {dialSubmitted ? (
            <AppText style={[styles.hint, { color: colors.textSecondary }]}>已提交号码：{dialSubmitted}</AppText>
          ) : null}
        </View>

        <View style={styles.section} testID="demo-persistent-bottom-sheet">
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>PersistentBottomSheet · 常驻工具面板</AppText>
          <ActionButton onPress={() => setPersistentSheetOpen(true)}>打开面板示例</ActionButton>
          <PersistentBottomSheet
            index={persistentSheetOpen ? 0 : -1}
            snapPoints={['42%', '72%']}
            onChange={(index) => {
              if (index < 0) setPersistentSheetOpen(false);
            }}
          >
            <View style={styles.persistentSheetContent}>
              <AppText style={{ color: colors.text }}>常驻工具面板没有模态遮罩或重复页头。</AppText>
              <ActionButton variant="secondary" onPress={() => setPersistentSheetOpen(false)}>
                收起面板
              </ActionButton>
            </View>
          </PersistentBottomSheet>
        </View>

        <View style={styles.section} testID="demo-audio-player">
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>AudioPlayer · 音频播放</AppText>
          <AudioPlayer
            title="示例音频"
            durationSeconds={96}
            currentTimeSeconds={audioTime}
            isPlaying={audioPlaying}
            onToggle={() => setAudioPlaying((current) => !current)}
            onSeek={setAudioTime}
          />
        </View>

        <View style={styles.section} testID="demo-nested-list-container">
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>父级已有标题的嵌套列表</AppText>
          <View style={[styles.listPreview, { borderColor: colors.border }]}>
            <ListScreenContainer
              safeAreaEdges={[]}
              toolbar={
                <SearchBar
                  value={nestedSearch}
                  onChangeText={setNestedSearch}
                  placeholder="搜索当前列表"
                />
              }
            >
              <ScrollView contentContainerStyle={styles.nestedList}>
                <ListCard>
                  <ListCard.Title>列表容器不重复页头标题</ListCard.Title>
                  <ListCard.Subtitle>父级导航继续拥有页面名称。</ListCard.Subtitle>
                </ListCard>
              </ScrollView>
            </ListScreenContainer>
          </View>
        </View>

        <View style={styles.section} testID="demo-skeleton-reduced-motion">
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>Skeleton 状态</AppText>
          <Skeleton width="72%" height={14} />
          <Skeleton width="44%" height={14} />
        </View>

        <View style={styles.section} testID="demo-shared-layout-tokens">
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>共享布局 tokens</AppText>
          <View
            style={[
              styles.tokenSample,
              {
                height: ControlSize.control,
                borderWidth: BorderWidth.default,
                borderColor: colors.border,
                borderRadius: Radius.sm,
              },
            ]}
          >
            <AppText style={{ color: colors.textSecondary }}>
              控件高 {ControlSize.control} · 快速动效 {MotionDuration.fast}ms
            </AppText>
          </View>
        </View>

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
  listPreview: { height: 196, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md },
  nestedList: { padding: Spacing.sm },
  persistentSheetContent: { gap: Spacing.sm, paddingVertical: Spacing.md },
  tokenSample: { justifyContent: 'center', paddingHorizontal: Spacing.sm },
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
