import { StyleSheet, View } from 'react-native';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { PRODUCTION_FIELD_HELP } from '../../../constants/production-field-help';
import { Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanInfoSectionProps {
  planStartDate: string;
  planEndDate: string;
  priority: string;
  description: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanInfoSection({
  planStartDate,
  planEndDate,
  priority,
  description,
  onStartDateChange,
  onEndDateChange,
  onPriorityChange,
  onDescriptionChange,
}: PlanInfoSectionProps) {
  const { options: priorityOptions } = useDict('order_priority');

  return (
    <DetailCard title="计划信息">
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <DatePickerField
            label="计划开始日期"
            help={PRODUCTION_FIELD_HELP.planStartDate}
            value={planStartDate}
            onChange={onStartDateChange}
            placeholder="不填则由系统排程计算"
          />
        </View>
        <View style={styles.dateField}>
          <DatePickerField
            label="计划完成日期"
            help={PRODUCTION_FIELD_HELP.planEndDate}
            value={planEndDate}
            onChange={onEndDateChange}
            placeholder="不填则由系统排程计算"
          />
        </View>
      </View>
      <ChipSelectField
        label="优先级"
        options={priorityOptions}
        value={priority}
        onChange={onPriorityChange}
      />
      <FormField
        label="备注"
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="选填"
        multiline
      />
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  dateField: { flex: 1 },
});
