import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import {
  type ReportBatchOption,
  reportBatchOptionService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormLabel } from '../../../../core/components/FormLabel.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { parseDate } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';

/** 字段文案：报工归属的生产批号（PC/App 统一口径） */
const BATCH_NO_LABEL = '生产批号';

type ReportBatchNoMode = 'existing' | 'new';

export interface ReportBatchNoFieldProps {
  /** 报工弹窗是否可见；打开时按 workOrderId 拉候选，关闭时复位 */
  visible: boolean;
  workOrderId?: string;
  /** 当前生产批号（提交时原样回传后端） */
  value: string;
  /** 工单页扫码带入的批号，优先级最高 */
  initialBatchNo?: string;
  onChange: (batchNo: string) => void;
  /** 回传后端是否要求必填，供提交前校验；候选读取失败时回传 false（不阻断报工） */
  onRequiredChange: (required: boolean) => void;
  /** 后端批号规则尚未返回时，暂缓提交按钮 */
  onOptionsLoadingChange: (loading: boolean) => void;
}

/** 候选辅助信息：累计报工量、是否已产出、带入批号的来源工单号。 */
function buildOptionSublabel(option: ReportBatchOption): string {
  const parts = [
    `已报 ${formatNumber(option.reportedQty ?? 0, { fallback: '0', maximumFractionDigits: 4 })}`,
  ];
  if (option.hasOutput) parts.push('已产出');
  if (option.source === 'inherited') {
    parts.push(option.sourceWorkOrderNo ? `来源工单 ${option.sourceWorkOrderNo}` : '来源工单带入');
  }
  return parts.join(' · ');
}

/**
 * 默认选中最近一条候选（同类内排序依据：最近报工时间，其次累计报工量）。
 *
 * 优先级：本工单已出现的批号（current）→ 来源工单带入批次（inherited）。
 * 后端只对返工/补加工单返回 inherited 候选，这两类工单沿用来源批次是主路径；
 * 端侧不区分工单类型，只按候选来源取默认值。都没有时由调用方回退到系统建议号。
 */
function pickDefaultOption(options: ReportBatchOption[]): ReportBatchOption | null {
  const currentOptions = options.filter((option) => option.source === 'current');
  const candidates =
    currentOptions.length > 0
      ? currentOptions
      : options.filter((option) => option.source === 'inherited');
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => {
    const aReportedAt = parseDate(a.lastReportedAt);
    const bReportedAt = parseDate(b.lastReportedAt);
    if (aReportedAt && bReportedAt && !aReportedAt.isSame(bReportedAt)) {
      return bReportedAt.valueOf() - aReportedAt.valueOf();
    }
    if (aReportedAt && !bReportedAt) return -1;
    if (!aReportedAt && bReportedAt) return 1;
    return (b.reportedQty ?? 0) - (a.reportedQty ?? 0);
  })[0];
}

/**
 * 报工"生产批号"选择器。
 *
 * 候选、默认值、建议号全部来自后端接口，端侧不判断物料追溯模式、不拼批号规则：
 * - 打开报工弹窗时按 workOrderId 拉候选，默认选中最近一条本工单批号，无本工单批号时
 *   选中最近一条来源工单带入批次（返工/补加沿用来源批次，默认值只按候选来源取）；
 * - "新建批号"分支预填后端建议号，可编辑，也保留扫码填入；
 * - 候选读取失败或后端未要求必填时，保持扫码/手动输入，不阻断报工。
 */
export function ReportBatchNoField({
  visible,
  workOrderId,
  value,
  initialBatchNo,
  onChange,
  onRequiredChange,
  onOptionsLoadingChange,
}: ReportBatchNoFieldProps) {
  const { colors } = useTheme();
  const [options, setOptions] = useState<ReportBatchOption[]>([]);
  const [suggestedBatchNo, setSuggestedBatchNo] = useState('');
  const [mode, setMode] = useState<ReportBatchNoMode>('existing');
  const [batchRequired, setBatchRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  // 打开弹窗时只判定一次初始值，避免后续填写触发重新拉取或覆盖用户选择。
  const valueRef = useRef(value);
  valueRef.current = value;
  const initialBatchNoRef = useRef(initialBatchNo);
  initialBatchNoRef.current = initialBatchNo;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onRequiredChangeRef = useRef(onRequiredChange);
  onRequiredChangeRef.current = onRequiredChange;

  useEffect(() => {
    if (!visible) {
      setOptions([]);
      setSuggestedBatchNo('');
      setMode('existing');
      setBatchRequired(false);
      setLoading(false);
      setLoadFailed(false);
      onOptionsLoadingChange(false);
      return;
    }
    if (!workOrderId) {
      // 缺少工单上下文时保持原有扫码/手动输入，不阻断报工
      setMode('new');
      onOptionsLoadingChange(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    onOptionsLoadingChange(true);
    setLoadFailed(false);
    const resolveRequired = (required: boolean) => {
      setBatchRequired(required);
      onRequiredChangeRef.current(required);
    };

    void reportBatchOptionService
      .optionsForWorkOrder(workOrderId)
      .then((result) => {
        if (cancelled) return;
        const nextOptions = (result.options ?? []).filter((option) => Boolean(option.batchNo));
        const nextSuggestedBatchNo = result.suggestedBatchNo ?? '';
        setOptions(nextOptions);
        setSuggestedBatchNo(nextSuggestedBatchNo);
        resolveRequired(result.batchRequired === true);

        // 优先级：工单页扫码带入值 > 上次填写值 > 后端候选默认值
        const scannedBatchNo = initialBatchNoRef.current?.trim();
        const currentBatchNo = scannedBatchNo || valueRef.current.trim();
        if (currentBatchNo) {
          setMode(
            nextOptions.some((option) => option.batchNo === currentBatchNo) ? 'existing' : 'new',
          );
          return;
        }
        const defaultOption = pickDefaultOption(nextOptions);
        if (defaultOption) {
          setMode('existing');
          onChangeRef.current(defaultOption.batchNo);
          return;
        }
        setMode('new');
        if (nextSuggestedBatchNo) onChangeRef.current(nextSuggestedBatchNo);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to load report batch options', error);
        setOptions([]);
        setSuggestedBatchNo('');
        setMode('new');
        setLoadFailed(true);
        resolveRequired(false);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          onOptionsLoadingChange(false);
        }
      });

    return () => {
      cancelled = true;
      onOptionsLoadingChange(false);
    };
  }, [onOptionsLoadingChange, visible, workOrderId]);

  const trimmedValue = value.trim();
  const selectedOption = useMemo(
    () => options.find((option) => option.batchNo === trimmedValue) ?? null,
    [options, trimmedValue],
  );

  const fetchOptions = useCallback(
    async ({ page, pageSize, keyword }: { page: number; pageSize: number; keyword?: string }) => {
      const normalizedKeyword = keyword?.trim().toLowerCase();
      const filtered = normalizedKeyword
        ? options.filter((option) => {
            const sublabel = buildOptionSublabel(option).toLowerCase();
            return (
              option.batchNo.toLowerCase().includes(normalizedKeyword) ||
              sublabel.includes(normalizedKeyword)
            );
          })
        : options;
      const start = (page - 1) * pageSize;
      return {
        list: filtered.slice(start, start + pageSize),
        total: filtered.length,
      };
    },
    [options],
  );

  const handleSwitchToNew = () => {
    setMode('new');
    if (!trimmedValue && suggestedBatchNo) onChange(suggestedBatchNo);
  };

  const handleSwitchToExisting = () => {
    setMode('existing');
    // 返回候选列表时清掉不在候选中的手输值，避免字段显示与提交值不一致
    if (!selectedOption) onChange('');
  };

  const hint = loadFailed
    ? { text: '可选批号读取失败，可直接扫码或输入生产批号，不影响本次报工。', warning: true }
    : !loading && options.length === 0 && batchRequired
      ? { text: '当前没有可复用批号，可扫码或手动输入新批号。', warning: false }
      : !batchRequired && !trimmedValue
        ? { text: '可留空，由系统按现有规则处理。', warning: false }
        : mode === 'new' && trimmedValue && trimmedValue === suggestedBatchNo
          ? { text: '已带出系统建议批号，可按实际修改。', warning: false }
          : null;

  if (loading) {
    return (
      <View style={styles.container}>
        <FormLabel label={BATCH_NO_LABEL} required={batchRequired} />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>正在读取可选生产批号…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === 'existing' ? (
        <EntityPickerField<ReportBatchOption>
          label={BATCH_NO_LABEL}
          value={selectedOption}
          onChange={(option) => onChange(option?.batchNo ?? '')}
          fetchFn={fetchOptions}
          keyExtractor={(option) => option.batchNo}
          labelExtractor={(option) => option.batchNo}
          sublabelExtractor={buildOptionSublabel}
          title="选择生产批号"
          placeholder="请选择本次报工的生产批号"
          required={batchRequired}
          clearable={!batchRequired}
        />
      ) : (
        <ScanInput
          label={BATCH_NO_LABEL}
          value={value}
          onChangeText={onChange}
          onScanResult={onChange}
          required={batchRequired}
          placeholder="扫码或手动输入生产批号"
        />
      )}

      {options.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={mode === 'existing' ? handleSwitchToNew : handleSwitchToExisting}
          style={({ pressed }) => [styles.modeSwitchButton, { opacity: pressed ? 0.65 : 1 }]}
        >
          <Text style={[styles.modeSwitchText, { color: colors.primary }]}>
            {mode === 'existing' ? '新建批号' : '选择已有批号'}
          </Text>
        </Pressable>
      ) : null}

      {hint ? (
        <Text
          style={[styles.hint, { color: hint.warning ? colors.warning : colors.textSecondary }]}
        >
          {hint.text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  modeSwitchButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET,
  },
  modeSwitchText: { fontSize: FontSize.sm, fontWeight: '600' },
  hint: { fontSize: FontSize.xs, lineHeight: 18 },
});
