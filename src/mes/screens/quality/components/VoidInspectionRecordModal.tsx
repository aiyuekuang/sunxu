import { useState } from 'react';
import { View } from 'react-native';
import type { QualityInspectionRecord } from '../../../types/models/QualityInspectionRecord';
import { qualityService } from '../../../host/services';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { toast } from '../../../../core/toast';

interface VoidInspectionRecordModalProps {
  record: QualityInspectionRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export function VoidInspectionRecordModal({
  record,
  onClose,
  onSuccess,
}: VoidInspectionRecordModalProps) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('请输入作废原因');
      return;
    }
    setSaving(true);
    try {
      await qualityService.voidRecord({ id: record.id, reason: reason.trim() });
      toast.success('检查记录已作废');
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible
      title={`作废第 ${record.sequenceNo} 次检查记录`}
      confirmText="确认作废"
      onClose={onClose}
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <View>
        <FormField
          label="作废原因"
          value={reason}
          onChangeText={setReason}
          placeholder="请输入作废原因"
          multiline
          required
        />
      </View>
    </FullScreenModal>
  );
}
