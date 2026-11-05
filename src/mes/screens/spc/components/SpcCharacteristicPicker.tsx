import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type SpcCharacteristicOption, spcService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface SpcCharacteristicPickerProps {
  materialId?: string;
  value: string;
  onChangeText: (value: string) => void;
  onMetaChange?: (option: SpcCharacteristicOption | null) => void;
  required?: boolean;
  allowManualFallback?: boolean;
}

function formatSpecRange(option: SpcCharacteristicOption) {
  if (option.lowerLimit == null || option.upperLimit == null) {
    return null;
  }
  const range = `${option.lowerLimit} ~ ${option.upperLimit}`;
  return option.unit ? `${range} ${option.unit}` : range;
}

function buildHelperText(option: SpcCharacteristicOption) {
  const parts: string[] = [];

  if (option.templateName) {
    parts.push(`模板：${option.templateName}`);
  } else if (option.source === 'record') {
    parts.push('来源：历史采样记录');
  }

  const specRange = formatSpecRange(option);
  if (specRange) {
    parts.push(`规格：${specRange}`);
  } else {
    parts.push('规格：未维护完整上下限');
  }

  if (option.recordCount > 0) {
    parts.push(`已采样：${option.recordCount} 条`);
  }

  return parts.join(' · ');
}

export function SpcCharacteristicPicker({
  materialId,
  value,
  onChangeText,
  onMetaChange,
  required = false,
  allowManualFallback = false,
}: SpcCharacteristicPickerProps) {
  const { colors } = useTheme();
  const [options, setOptions] = useState<SpcCharacteristicOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const onChangeTextRef = useRef(onChangeText);
  const onMetaChangeRef = useRef(onMetaChange);

  useEffect(() => {
    onChangeTextRef.current = onChangeText;
  }, [onChangeText]);

  useEffect(() => {
    onMetaChangeRef.current = onMetaChange;
  }, [onMetaChange]);

  useEffect(() => {
    let cancelled = false;

    setOptions([]);
    setLoadError(null);
    onChangeTextRef.current('');

    if (!materialId) {
      onMetaChangeRef.current?.(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void spcService
      .characteristics({ materialId })
      .then((nextOptions) => {
        if (cancelled) {
          return;
        }
        setOptions(nextOptions ?? []);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setLoadError(error instanceof Error && error.message ? error.message : '加载 SPC 特征失败');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [materialId]);

  const selectedOption = useMemo(
    () => options.find((item) => item.characteristicName === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    onMetaChangeRef.current?.(selectedOption);
  }, [selectedOption]);

  const pickerOptions = useMemo(
    () =>
      options.map((item) => ({
        label: item.characteristicName,
        value: item.characteristicName,
      })),
    [options],
  );

  const helperText = useMemo(() => {
    if (loadError) {
      return loadError;
    }
    if (!materialId) {
      return '先选择物料，再从该物料的质检模板或历史采样记录里选特征。';
    }
    if (loading) {
      return '正在加载该物料的 SPC 特征...';
    }
    if (!options.length) {
      return allowManualFallback
        ? '当前物料还没维护“用于SPC”的特征，建议先补质检模板；如需补录，可临时手工输入。'
        : '当前物料未维护“用于SPC”的特征，也没有历史采样记录。';
    }
    if (selectedOption) {
      return buildHelperText(selectedOption);
    }
    return `已加载 ${options.length} 个可选特征，请直接选择，不要手工猜名称。`;
  }, [allowManualFallback, loadError, loading, materialId, options.length, selectedOption]);

  const useManualFallback =
    allowManualFallback && !!materialId && !loading && !loadError && !options.length;

  return (
    <View style={styles.container}>
      {useManualFallback ? (
        <FormField
          label="特征名称"
          required={required}
          value={value}
          onChangeText={onChangeText}
          placeholder="如：长度、重量、硬度"
        />
      ) : (
        <PickerField
          label="特征名称"
          required={required}
          value={value}
          onChange={onChangeText}
          options={pickerOptions}
          clearable
          disabled={!materialId || loading || !!loadError || !options.length}
          disabledReason={
            !materialId
              ? '请先选择物料后再选择特征名称'
              : loading
                ? '特征正在加载，请稍候'
                : loadError
                  ? '特征加载失败，请刷新后重试'
                  : !options.length
                    ? '当前物料暂无可用特征'
                    : undefined
          }
          placeholder={
            !materialId
              ? '请先选择物料'
              : loading
                ? '特征加载中'
                : options.length
                  ? '请选择特征名称'
                  : '当前物料暂无可用特征'
          }
        />
      )}

      <Text
        style={[styles.helperText, { color: loadError ? colors.warning : colors.textSecondary }]}
      >
        {helperText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  helperText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
