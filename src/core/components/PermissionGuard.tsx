import type React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { EmptyState } from './EmptyState.tsx';
import { PageHeader } from './PageHeader.tsx';

interface PermissionGuardProps {
  /** Permission identifiers are interpreted by the host application. */
  permissions: string[];
  /** Additional identifiers that must all be authorized by the host. */
  requiredPermissions?: string[];
  /** Host-owned authorization result. Sunxu does not interpret permission codes. */
  checkAccess: (
    permissions: string[],
    requiredPermissions: string[],
  ) => { authorized: boolean; featureVisible?: boolean };
  onBack?: () => void;
  children: React.ReactNode;
}

/**
 * 权限守卫：包裹屏幕组件，无权限时显示提示页而非空白/报错。
 * 用于防止用户通过深链接或直接 navigate 绕过菜单权限。
 */
export function PermissionGuard({
  permissions,
  requiredPermissions = [],
  checkAccess,
  onBack,
  children,
}: PermissionGuardProps) {
  const { colors } = useTheme();
  if (permissions.length === 0) return <>{children}</>;
  const access = checkAccess(permissions, requiredPermissions);
  if (access.authorized) return <>{children}</>;
  const isFeatureHidden = access.featureVisible === false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader
        title={isFeatureHidden ? '功能未展示' : '无访问权限'}
        onBack={onBack}
      />
      <View style={styles.content}>
        <EmptyState
          icon={isFeatureHidden ? 'eye-off-outline' : 'lock-closed-outline'}
          title={isFeatureHidden ? '当前运营方案未展示此功能' : '暂无访问权限'}
          description={
            isFeatureHidden
              ? '可在管理端运营配置中追加对应功能增强后再使用'
              : '请联系管理员为您分配此模块的权限'
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center' },
});
