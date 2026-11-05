import { Ionicons } from '@expo/vector-icons';
import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Step1Fields = {
  email: string;
  password: string;
  confirmPassword: string;
  realName: string;
  username: string;
  phone: string;
  verifyCode: string;
};

interface RegisterStep1Props {
  /** react-hook-form control for step 1 fields */
  control: Control<Step1Fields>;
  /** react-hook-form field errors for step 1 */
  errors: FieldErrors<Step1Fields>;
  /** Whether the verification code is currently being sent */
  codeSending: boolean;
  /** Remaining cooldown seconds (0 = can send) */
  codeCooldown: number;
  /** Called when user presses "send code" */
  onSendCode: () => void;
  /** Called with validated form data when user presses "next" */
  onSubmit: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterStep1({
  control,
  errors,
  codeSending,
  codeCooldown,
  onSendCode,
  onSubmit,
}: RegisterStep1Props) {
  const { colors } = useTheme();

  return (
    <>
      <Text style={[styles.cardTitle, { color: colors.text }]}>创建账号</Text>
      <Text style={[styles.cardSub, { color: colors.textSecondary }]}>请填写基本信息完成注册</Text>

      <View style={styles.fields}>
        <Controller
          control={control}
          name="realName"
          rules={{ required: '请输入姓名', minLength: { value: 2, message: '姓名最少2个字符' } }}
          render={({ field }) => (
            <FormField
              label="姓名"
              required
              value={field.value}
              onChangeText={field.onChange}
              placeholder="请输入真实姓名"
              autoCorrect={false}
              error={errors.realName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="username"
          rules={{
            validate: (v: string) => {
              if (!v) return true;
              if (!/^[a-zA-Z0-9+\-_.@]+$/.test(v))
                return '用户名只允许英文字母、数字及 + - _ . @ 等字符';
              if (v.length < 2) return '用户名最少2个字符';
              if (v.length > 30) return '用户名最多30个字符';
              return true;
            },
          }}
          render={({ field }) => (
            <FormField
              label="用户名"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="选填，不填则自动生成"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          rules={{
            validate: (v: string) => {
              if (!v) return true;
              if (!/^1[3-9]\d{9}$/.test(v)) return '请输入有效的手机号码';
              return true;
            },
          }}
          render={({ field }) => (
            <FormField
              label="手机号码"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="选填"
              keyboardType="phone-pad"
              maxLength={11}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: '请输入邮箱',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' },
          }}
          render={({ field }) => (
            <FormField
              label="邮箱"
              required
              value={field.value}
              onChangeText={field.onChange}
              placeholder="请输入邮箱地址"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        {/* Verification code */}
        <View>
          <Controller
            control={control}
            name="verifyCode"
            rules={{ required: '请输入验证码' }}
            render={({ field }) => (
              <FormField
                label="邮箱验证码"
                required
                value={field.value}
                onChangeText={field.onChange}
                placeholder="请输入6位验证码"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.verifyCode?.message}
                rightElement={
                  <TouchableOpacity
                    onPress={onSendCode}
                    disabled={codeSending || codeCooldown > 0}
                    style={[
                      styles.codeBtn,
                      {
                        borderColor: colors.primary,
                        opacity: codeSending || codeCooldown > 0 ? 0.5 : 1,
                      },
                    ]}
                  >
                    {codeSending ? (
                      <InlineLoading />
                    ) : (
                      <Text style={[styles.codeBtnText, { color: colors.primary }]}>
                        {codeCooldown > 0 ? `${codeCooldown}s` : '获取验证码'}
                      </Text>
                    )}
                  </TouchableOpacity>
                }
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="password"
          rules={{
            required: '请输入密码',
            minLength: { value: 6, message: '密码最少6位' },
            maxLength: { value: 20, message: '密码最多20位' },
            validate: (v: string) => (!/\s/.test(v) ? true : '密码不能包含空格'),
          }}
          render={({ field }) => (
            <FormField
              label="密码"
              required
              value={field.value}
              onChangeText={field.onChange}
              placeholder="请输入密码（6-20位）"
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{ required: '请确认密码' }}
          render={({ field }) => (
            <FormField
              label="确认密码"
              required
              value={field.value}
              onChangeText={field.onChange}
              placeholder="请再次输入密码"
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              error={errors.confirmPassword?.message}
            />
          )}
        />
      </View>

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: colors.primary }]}
        onPress={onSubmit}
        activeOpacity={0.85}
      >
        <Text style={styles.nextButtonText}>下一步</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  codeBtn: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  codeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  nextButton: {
    height: 46,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
