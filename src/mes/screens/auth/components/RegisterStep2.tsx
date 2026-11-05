import { Ionicons } from '@expo/vector-icons';
import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { SupportWechatQr } from '../../../../integrations/mes-app/SupportWechatQr.tsx';
import { SUPPORT_CONTACT } from '../../../../integrations/mes-app/support-contact';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

export type Step2Fields = {
  companyName: string;
};

interface RegisterStep2Props {
  control: Control<Step2Fields>;
  errors: FieldErrors<Step2Fields>;
  loading: boolean;
  onSubmit: () => void;
}

export function RegisterStep2({ control, errors, loading, onSubmit }: RegisterStep2Props) {
  const { colors } = useTheme();

  return (
    <>
      <Text style={[styles.cardTitle, { color: colors.text }]}>创建公司</Text>
      <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
        注册后您将成为该公司的超级管理员
      </Text>

      <View style={styles.fields}>
        <Controller
          control={control}
          name="companyName"
          render={({ field }) => (
            <FormField
              label="公司名称"
              required
              value={field.value}
              onChangeText={field.onChange}
              placeholder="请输入公司名称"
              autoCorrect={false}
              error={errors.companyName?.message}
            />
          )}
        />

        <View style={styles.registrationNotice}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
          <Text style={[styles.registrationNoticeText, { color: colors.warning }]}>
            {`注册将创建公司和超级管理员账户。其他用户请由管理员在“用户管理”中新增并分配角色。协助开通：${SUPPORT_CONTACT.phone} / 微信 ${SUPPORT_CONTACT.wechat}。`}
          </Text>
        </View>
        <SupportWechatQr
          size={116}
          qrValue={SUPPORT_CONTACT.wechatQrValue}
          contactLabel={SUPPORT_CONTACT.wechat ? `微信 ${SUPPORT_CONTACT.wechat}` : '微信联系信息未配置'}
          hint="扫码添加微信，或复制微信号搜索"
          encodeQr={SUPPORT_CONTACT.encodeQr}
        />
      </View>

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <InlineLoading />
            <Text style={styles.nextButtonText}>注册中...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.nextButtonText}>完成注册</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: FontSize.sm,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
  },
  fields: {
    gap: Spacing.md,
  },
  registrationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  registrationNoticeText: {
    flex: 1,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  nextButton: {
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
