import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { purchaseReceiptService } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { toast } from '../../../core/toast';

interface GeneratePurchaseReceiptBatchNoButtonProps {
  materialId: string;
  batchNo: string;
  onGenerated: (batchNo: string) => void;
}

export function GeneratePurchaseReceiptBatchNoButton({
  materialId,
  batchNo,
  onGenerated,
}: GeneratePurchaseReceiptBatchNoButtonProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const batchNoRef = useRef(batchNo);
  batchNoRef.current = batchNo;

  const handleGenerate = async () => {
    if (!materialId || batchNoRef.current.trim() || loading) return;

    setLoading(true);
    try {
      const result = await purchaseReceiptService.generateSystemBatchNo(materialId);
      const generatedBatchNo = result.batchNo.trim();
      if (!generatedBatchNo) throw new Error('系统未返回批号');
      if (!batchNoRef.current.trim()) {
        onGenerated(generatedBatchNo);
        toast.success('系统批号已写入当前明细');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '自动生成系统批号失败');
    } finally {
      setLoading(false);
    }
  };

  const disabled = !materialId || Boolean(batchNo.trim()) || loading;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="自动生成系统批号"
        accessibilityState={{ disabled, busy: loading }}
        disabled={disabled}
        onPress={() => void handleGenerate()}
        style={styles.hitTarget}
      >
        <View
          style={[
            styles.button,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: disabled ? 0.55 : 1,
            },
          ]}
        >
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          <Text style={[styles.buttonText, { color: colors.primary }]}>自动写入</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  hitTarget: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  button: {
    minHeight: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  buttonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
