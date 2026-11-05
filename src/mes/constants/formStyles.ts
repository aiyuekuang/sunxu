import { StyleSheet } from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../../core/theme/tokens';

/**
 * 所有 FormScreen 共享的基础样式
 * 避免在 CompanyFormScreen / UserFormScreen / DepartmentFormScreen / RoleFormScreen 中重复定义
 */
export const formStyles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  section: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  submitBtn: {
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  submitText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: '600' as const,
  },
});
