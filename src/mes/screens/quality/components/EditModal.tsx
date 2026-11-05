import { useRef, useState } from 'react';
import { type QualityInspection, qualityService } from '../../../host/services';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { toast } from '../../../../core/toast';
import {
  autoFillInspectionQuantities,
  formatInspectionQtyInputValue,
  INSPECTION_QTY_MIN,
  isInspectionQtyClosed,
  normalizeInspectionQty,
  type InspectionQtyField,
} from './inspection-utils.ts';

export interface EditModalProps {
  inspection: QualityInspection;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditModal({ inspection, onClose, onSuccess }: EditModalProps) {
  const [form, setForm] = useState({
    sampleQty: formatInspectionQtyInputValue(inspection.sampleQty),
    passQty: formatInspectionQtyInputValue(inspection.passQty),
    failQty: formatInspectionQtyInputValue(inspection.failQty),
    disposalNote: inspection.disposalNote ?? '',
    remarks: inspection.remarks ?? '',
  });
  const [saving, setSaving] = useState(false);
  const preferredQtyFieldRef = useRef<'passQty' | 'failQty'>('passQty');

  const updateQuantity = (field: InspectionQtyField, value: string) => {
    if (field === 'passQty' || field === 'failQty') {
      preferredQtyFieldRef.current = field;
    }
    setForm((prev) => {
      const nextForm = { ...prev, [field]: value };
      const qtyPatch = autoFillInspectionQuantities({
        sampleQty: nextForm.sampleQty,
        passQty: nextForm.passQty,
        failQty: nextForm.failQty,
        changedField: field,
        preferredField: preferredQtyFieldRef.current,
      });

      return {
        ...nextForm,
        passQty: Object.hasOwn(qtyPatch, 'passQty')
          ? qtyPatch.passQty === undefined
            ? ''
            : String(qtyPatch.passQty)
          : nextForm.passQty,
        failQty: Object.hasOwn(qtyPatch, 'failQty')
          ? qtyPatch.failQty === undefined
            ? ''
            : String(qtyPatch.failQty)
          : nextForm.failQty,
      };
    });
  };

  const handleSubmit = async () => {
    const sampleQty = normalizeInspectionQty(form.sampleQty);
    if (sampleQty === undefined || sampleQty < INSPECTION_QTY_MIN) {
      toast.error('请填写有效的抽样数量');
      return;
    }
    const passQtyText = form.passQty.trim();
    const failQtyText = form.failQty.trim();
    const updatePayload: Parameters<typeof qualityService.update>[0] = {
      id: inspection.id,
      sampleQty,
      disposalNote: form.disposalNote || undefined,
      remarks: form.remarks || undefined,
    };
    if (passQtyText !== '' || failQtyText !== '') {
      if (passQtyText === '' || failQtyText === '') {
        toast.error('如需填写检验结果，请同时填写合格数量和不合格数量');
        return;
      }
      const passQty = normalizeInspectionQty(passQtyText);
      const failQty = normalizeInspectionQty(failQtyText);
      if (passQty === undefined || failQty === undefined || passQty < 0 || failQty < 0) {
        toast.error('请输入有效的合格数量和不合格数量');
        return;
      }
      if (!isInspectionQtyClosed(sampleQty, passQty, failQty)) {
        toast.error('合格数和不合格数之和必须等于抽样数量');
        return;
      }
      updatePayload.passQty = passQty;
      updatePayload.failQty = failQty;
    }
    setSaving(true);
    try {
      await qualityService.update(updatePayload);
      onSuccess();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible
      onClose={onClose}
      title="编辑"
      confirmText="保存"
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <QuickNumInput
        label="抽检数量"
        value={form.sampleQty}
        onChangeText={(t) => updateQuantity('sampleQty', t)}
        placeholder="0"
        required
        min={INSPECTION_QTY_MIN}
        precision={4}
        quickButtons={[
          { label: '+1', value: 1 },
          { label: '+5', value: 5 },
        ]}
      />
      <QuickNumInput
        label="合格数量"
        value={form.passQty}
        onChangeText={(t) => updateQuantity('passQty', t)}
        placeholder="0"
        max={Number(form.sampleQty) || 0}
        precision={4}
        quickButtons={[
          { label: '+1', value: 1 },
          { label: '+5', value: 5 },
          { label: '最大', value: 'max' },
        ]}
      />
      <QuickNumInput
        label="不合格数量"
        value={form.failQty}
        onChangeText={(t) => updateQuantity('failQty', t)}
        placeholder="0"
        max={Number(form.sampleQty) || 0}
        precision={4}
        quickButtons={[
          { label: '+1', value: 1 },
          { label: '+5', value: 5 },
          { label: '最大', value: 'max' },
        ]}
      />
      <FormField
        label="处置意见（可选）"
        value={form.disposalNote}
        onChangeText={(t) => setForm((f) => ({ ...f, disposalNote: t }))}
        placeholder="可选"
        multiline
      />
      <FormField
        label="备注（可选）"
        value={form.remarks}
        onChangeText={(t) => setForm((f) => ({ ...f, remarks: t }))}
        placeholder="可选"
        multiline
      />
    </FullScreenModal>
  );
}
