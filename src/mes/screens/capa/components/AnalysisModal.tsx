import { useEffect, useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  initialValues?: {
    rootCause?: string;
    correctiveAction?: string;
    preventiveAction?: string;
  };
  onSubmit: (
    rootCause: string,
    correctiveAction: string,
    preventiveAction: string,
  ) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalysisModal({ visible, onClose, initialValues, onSubmit }: AnalysisModalProps) {
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setRootCause(initialValues?.rootCause ?? '');
    setCorrectiveAction(initialValues?.correctiveAction ?? '');
    setPreventiveAction(initialValues?.preventiveAction ?? '');
  }, [
    initialValues?.correctiveAction,
    initialValues?.preventiveAction,
    initialValues?.rootCause,
    visible,
  ]);

  const handleSubmit = async () => {
    if (!rootCause.trim()) {
      toast.info('请填写根本原因');
      return;
    }
    if (!correctiveAction.trim()) {
      toast.info('请填写纠正措施');
      return;
    }
    if (!preventiveAction.trim()) {
      toast.info('请填写预防措施');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(rootCause.trim(), correctiveAction.trim(), preventiveAction.trim());
      setRootCause('');
      setCorrectiveAction('');
      setPreventiveAction('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="提交根因分析"
      confirmText="提交"
      cancelText="取消"
      onConfirm={handleSubmit}
      loading={submitting}
      avoidKeyboard
      maxHeightRatio={0.85}
    >
      <FormField
        label="根本原因"
        required
        value={rootCause}
        onChangeText={setRootCause}
        placeholder="请描述问题的根本原因..."
        multiline
        numberOfLines={4}
      />

      <FormField
        label="纠正措施"
        required
        value={correctiveAction}
        onChangeText={setCorrectiveAction}
        placeholder="请描述纠正措施..."
        multiline
        numberOfLines={4}
      />

      <FormField
        label="预防措施"
        required
        value={preventiveAction}
        onChangeText={setPreventiveAction}
        placeholder="请描述预防措施..."
        multiline
        numberOfLines={4}
      />
    </BottomSheet>
  );
}
