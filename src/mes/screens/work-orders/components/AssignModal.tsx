import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { userService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

interface SimpleUser {
  id: string;
  username: string;
  realName: string | null;
}

export interface AssignModalProps {
  visible: boolean;
  op: WorkOrderOperation | null;
  onClose: () => void;
  onSubmit: (assigneeId: string, operationId: string) => void;
}

export function AssignModal({ visible, op, onClose, onSubmit }: AssignModalProps) {
  const { colors } = useTheme();
  const [selectedUser, setSelectedUser] = useState<SimpleUser | null>(null);

  // 重新指派时显示当前指派人
  useEffect(() => {
    if (visible && op?.assignee) {
      setSelectedUser({
        id: op.assignee.id,
        username: op.assignee.username ?? '',
        realName: op.assignee.realName ?? null,
      });
    } else if (!visible) {
      setSelectedUser(null);
    }
  }, [visible, op]);

  const handleSubmit = () => {
    if (!selectedUser) {
      toast.info('请选择操作员');
      return;
    }
    if (!op) return;
    onSubmit(selectedUser.id, op.id);
    setSelectedUser(null);
  };

  const handleClose = () => {
    setSelectedUser(null);
    onClose();
  };

  // 使用 simpleList：无需 user:list 权限，支持 keyword 同时搜索 username 和 realName
  const fetchUsers = async (params: { page: number; pageSize: number; keyword?: string }) => {
    const list = await userService.simpleList(params.keyword || undefined);
    return { list, total: list.length };
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={`工序指派：${op?.operationName ?? ''}`}
      confirmText="确认指派"
      onConfirm={handleSubmit}
      maxHeightRatio={0.4}
    >
      {op?.assignee && (
        <View style={[styles.currentBanner, { backgroundColor: `${colors.warning}12` }]}>
          <Ionicons name="swap-horizontal-outline" size={14} color={colors.warning} />
          <Text style={[styles.currentText, { color: colors.warning }]}>
            当前指派：{op.assignee.realName || op.assignee.username}
          </Text>
        </View>
      )}
      <EntityPickerField<SimpleUser>
        label="操作员"
        value={selectedUser}
        onChange={setSelectedUser}
        fetchFn={fetchUsers}
        keyExtractor={(u) => u.id}
        labelExtractor={(u) => u.realName || u.username}
        sublabelExtractor={(u) => u.username}
        placeholder="请选择操作员"
        required
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  currentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  currentText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
