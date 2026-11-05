import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';
import { useBottomSheetTextInput } from './BottomSheetContext.ts';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 编码/序列号等搜索关闭输入纠正（透传给内部输入框） */
  autoCorrect?: boolean;
  /** 序列号等场景需要关闭自动大写（透传给内部输入框） */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = '搜索...',
  autoFocus,
  autoCorrect,
  autoCapitalize,
}: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const inputFontSize = useScaledFontSize(FontSize.base);
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const { InputComponent, inputKey, inputProps } = useBottomSheetTextInput({
    value,
    onChangeText,
  });

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceSecondary, isDark ? '#3A3A3C' : '#E8EAEF'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={focused ? colors.primary : colors.textMuted}
        style={styles.icon}
      />
      <InputComponent
        key={inputKey}
        style={[styles.input, { color: colors.text, fontSize: inputFontSize }]}
        {...inputProps}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        // Android 会把长占位文案按两行测量，固定高度容器内会被裁切；必须显式单行
        numberOfLines={1}
        autoFocus={autoFocus}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        returnKeyType="search"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.clearBtn}
          activeOpacity={0.6}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={focused ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: 6,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    padding: 0,
  },
  clearBtn: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
