import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { InfoRow } from '../../../../../core/components/DetailCard.tsx';
import { formStyles } from '../../../../constants/formStyles';
import { FontSize, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';
import { useScaledFontSize } from '../../../../../core/theme/font-scale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditableFields {
  realName: string;
  username: string;
  phone: string;
  email: string;
}

interface ProfileInfoSectionProps {
  /** 当前用户显示数据（非编辑态） */
  displayValues: {
    realName: string | null;
    username: string;
    phone: string | null;
    email: string | null;
  };
  /** 是否处于编辑态 */
  editing: boolean;
  /** 编辑态的表单值 */
  editValues: EditableFields;
  /** 是否正在保存 */
  saving: boolean;
  /** 更新单个字段值 */
  onFieldChange: <K extends keyof EditableFields>(key: K, value: string) => void;
  /** 进入编辑态 */
  onEdit: () => void;
  /** 取消编辑 */
  onCancel: () => void;
  /** 保存 */
  onSave: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileInfoSection({
  displayValues,
  editing,
  editValues,
  saving,
  onFieldChange,
  onEdit,
  onCancel,
  onSave,
}: ProfileInfoSectionProps) {
  const { colors } = useTheme();
  const inlineInputFontSize = useScaledFontSize(FontSize.base);

  const inputStyle = [
    styles.inlineInput,
    { color: colors.text, borderBottomColor: `${colors.primary}40`, fontSize: inlineInputFontSize },
  ];

  return (
    <View style={[formStyles.section, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[formStyles.sectionTitle, { color: colors.textMuted }]}>基本信息</Text>
        {editing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onCancel} disabled={saving} activeOpacity={0.7}>
              <Text style={[styles.headerActionText, { color: colors.textSecondary }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} disabled={saving} activeOpacity={0.7}>
              <Text style={[styles.headerActionText, { color: colors.primary }]}>
                {saving ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={14} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>编辑</Text>
          </TouchableOpacity>
        )}
      </View>

      <InfoRow
        label="真实姓名"
        right={
          editing ? (
            <TextInput
              style={inputStyle}
              value={editValues.realName}
              onChangeText={(v) => onFieldChange('realName', v)}
              placeholder="请输入真实姓名"
              placeholderTextColor={colors.textTertiary}
              numberOfLines={1}
            />
          ) : undefined
        }
        value={!editing ? displayValues.realName || '未填写' : undefined}
      />
      <InfoRow
        label="用户名"
        right={
          editing ? (
            <TextInput
              style={inputStyle}
              value={editValues.username}
              onChangeText={(v) => onFieldChange('username', v)}
              placeholder="字母/数字/下划线"
              placeholderTextColor={colors.textTertiary}
              numberOfLines={1}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : undefined
        }
        value={!editing ? displayValues.username || '未设置' : undefined}
      />
      <InfoRow
        label="手机号码"
        right={
          editing ? (
            <TextInput
              style={inputStyle}
              value={editValues.phone}
              onChangeText={(v) => onFieldChange('phone', v)}
              placeholder="选填"
              placeholderTextColor={colors.textTertiary}
              numberOfLines={1}
              keyboardType="phone-pad"
              maxLength={11}
            />
          ) : undefined
        }
        value={!editing ? displayValues.phone || '未填写' : undefined}
      />
      <InfoRow
        label="邮箱"
        right={
          editing ? (
            <TextInput
              style={inputStyle}
              value={editValues.email}
              onChangeText={(v) => onFieldChange('email', v)}
              placeholder="请输入邮箱"
              placeholderTextColor={colors.textTertiary}
              numberOfLines={1}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : undefined
        }
        value={!editing ? displayValues.email || '未填写' : undefined}
        last
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerActionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  inlineInput: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '500',
    textAlign: 'right',
    padding: 0,
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
});
